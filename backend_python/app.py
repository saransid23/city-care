# backend_python/app.py
"""Flask backend for City Care project.

Replaces the original Node.js/Express implementation while preserving the same API endpoints:
- GET /api/health
- GET /api/complaints
- POST /api/complaints (supports multipart file upload)
- GET /api/complaints/stats (aggregated statistics)
- GET /api/complaints/<id> (retrieve single complaint by custom ID)
- PATCH /api/complaints/<id>/status (update complaint status)

The server serves uploaded photos from the shared "uploads" folder located at the project root.
"""

import os
import string
import secrets
from datetime import datetime, timedelta
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from pymongo import MongoClient
from werkzeug.utils import secure_filename

# Load environment variables from .env (project root/backend_python/.env)
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
import bcrypt
import jwt

# JWT helper
def generate_jwt(payload: dict) -> str:
    secret = os.getenv('JWT_SECRET_KEY')
    if not secret:
        raise RuntimeError('JWT_SECRET_KEY not set in .env')
    exp_seconds = int(os.getenv('JWT_EXPIRATION_SECONDS', '3600'))
    payload.update({'exp': datetime.utcnow() + timedelta(seconds=exp_seconds)})
    return jwt.encode(payload, secret, algorithm='HS256')
# MongoDB connection – uses MONGO_URI from .env
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise RuntimeError("MONGO_URI not set in .env file")
client = MongoClient(mongo_uri)
# Use the default database defined in the URI; otherwise fallback to 'city_care'
db = client[os.getenv("MONGO_DB", "city_care")]
# Use explicit DB name if not provided in URI
complaints_collection = db["complaints"]
users_collection = db["users"]


# ---------------------------------------------------------------------------
# Auth Routes
# ---------------------------------------------------------------------------
@app.route("/api/auth/register", methods=["POST"]) 
def register_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')
    if not email or not password:
        return jsonify({"success": False, "error": "Email and password required"}), 400
    if users_collection.find_one({"email": email}):
        return jsonify({"success": False, "error": "User already exists"}), 409
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_doc = {"email": email, "password": hashed, "name": name, "createdAt": datetime.utcnow()}
    result = users_collection.insert_one(user_doc)
    token = generate_jwt({"email": email, "role": "citizen"})
    user_doc["_id"] = str(result.inserted_id)
    return jsonify({"success": True, "token": token, "user": user_doc}), 201

@app.route("/api/auth/login", methods=["POST"]) 
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"success": False, "error": "Email and password required"}), 400
    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.get('password', '').encode('utf-8')):
        return jsonify({"success": False, "error": "Invalid credentials"}), 401
    token = generate_jwt({"email": email, "role": "citizen"})
    user['_id'] = str(user['_id'])
    return jsonify({"success": True, "token": token, "user": user}), 200

@app.route("/api/auth/google", methods=["POST"]) 
def google_auth():
    # Placeholder – existing implementation can stay; just ensure token generation uses generate_jwt
    return jsonify({"success": False, "error": "Google auth not implemented"}), 501

@app.route("/api/auth/me", methods=["GET"]) 
def get_me():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"success": False, "error": "Missing token"}), 401
    token = auth_header.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
        email = payload.get('email')
        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        user['_id'] = str(user['_id'])
        return jsonify({"success": True, "data": user}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "error": "Token expired"}), 401
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# # MongoDB connection – uses MONGO_URI from .env
# # mongo_uri = os.getenv("MONGO_URI")
# # if not mongo_uri:
# #     raise RuntimeError("MONGO_URI not set in .env file")
# # client = MongoClient(mongo_uri)
# # # Use the default database defined in the URI; otherwise fallback to 'city_care'
# # db = client[os.getenv("MONGO_DB", "city_care")]
# # # Use explicit DB name if not provided in URI
# # complaints_collection = db["complaints"]

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------
def _serialize_doc(doc):
    """Convert MongoDB document (with ObjectId and datetime) to JSON‑serialisable dict."""
    if not doc:
        return doc
    doc = dict(doc)
    # Convert ObjectId to string for JSON response
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    for key, val in list(doc.items()):
        if isinstance(val, datetime):
            # Format to ISO 8601 string with Z suffix
            doc[key] = val.isoformat() + "Z"
    return doc

def generate_complaint_id():
    """Generate a custom unique ticket ID matching CMP-XXXXXXX."""
    alphabet = string.ascii_uppercase + string.digits
    return "CMP-" + "".join(secrets.choice(alphabet) for _ in range(7))

def classify_priority(category, description):
    """Auto-classify priority based on keywords in description and fallback category rules."""
    desc = (description or "").lower()
    critical_keywords = ['danger', 'emergency', 'hazard', 'accident', 'fire', 'flood', 'electrocution', 'exposed wire', 'collapse']
    high_keywords = ['major', 'severe', 'broken', 'days', 'weeks', 'large', 'multiple', 'no water', 'no supply', 'leaking']
    medium_keywords = ['moderate', 'overflowing', 'some', 'few', 'minor damage']

    if any(k in desc for k in critical_keywords):
        return 'Critical'
    elif any(k in desc for k in high_keywords):
        return 'High'
    elif any(k in desc for k in medium_keywords):
        return 'Medium'
    else:
        # Category-based fallback
        if category in ['Electricity', 'Water Supply']:
            return 'High'
        elif category == 'Pothole':
            return 'Medium'
        else:
            return 'Low'

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "time": datetime.utcnow().isoformat() + "Z"})

# Serve uploaded photos – mirrors Express static middleware
@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# GET /api/complaints/stats — aggregated statistics
@app.route("/api/complaints/stats", methods=["GET"])
def get_complaints_stats():
    try:
        total = complaints_collection.count_documents({})
        critical = complaints_collection.count_documents({"priority": "Critical"})
        pending = complaints_collection.count_documents({"status": "Pending"})
        resolved = complaints_collection.count_documents({"status": "Resolved"})

        # By category
        by_category_cursor = complaints_collection.aggregate([
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ])
        by_category = list(by_category_cursor)

        # By priority
        by_priority_cursor = complaints_collection.aggregate([
            {"$group": {"_id": "$priority", "count": {"$sum": 1}}}
        ])
        by_priority = list(by_priority_cursor)

        # Daily complaints (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        daily_cursor = complaints_collection.aggregate([
            {"$match": {"createdAt": {"$gte": seven_days_ago}}},
            {
                "$group": {
                    "_id": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ])
        daily = list(daily_cursor)

        return jsonify({
            "success": True,
            "data": {
                "total": total,
                "critical": critical,
                "pending": pending,
                "resolved": resolved,
                "byCategory": by_category,
                "byPriority": by_priority,
                "daily": daily
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# GET /api/complaints — get all with optional filters + pagination
@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    try:
        priority = request.args.get("priority")
        status   = request.args.get("status")
        category = request.args.get("category")
        page     = max(1, int(request.args.get("page", 1)))
        limit    = min(100, max(1, int(request.args.get("limit", 50))))

        filters = {}
        if priority and priority != "All Priorities":
            filters["priority"] = priority
        if status and status != "All Status":
            filters["status"] = status
        if category and category != "All Categories":
            filters["category"] = category

        skip = (page - 1) * limit
        total_count = complaints_collection.count_documents(filters)
        complaints = list(
            complaints_collection.find(filters)
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        return jsonify({
            "success": True,
            "data": [_serialize_doc(c) for c in complaints],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "pages": (total_count + limit - 1) // limit,
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# GET /api/complaints/<id> — get single complaint by complaintId
@app.route("/api/complaints/<string:complaint_id>", methods=["GET"])
def get_complaint_by_id(complaint_id):
    try:
        complaint = complaints_collection.find_one({"complaintId": complaint_id})
        if not complaint:
            return jsonify({"success": False, "error": "Complaint not found"}), 404
        return jsonify({
            "success": True,
            "data": _serialize_doc(complaint)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# PATCH /api/complaints/<id>/status — update status
@app.route("/api/complaints/<string:complaint_id>/status", methods=["PATCH"])
def update_complaint_status(complaint_id):
    try:
        req_data = request.get_json() or {}
        new_status = req_data.get("status")
        if not new_status:
            return jsonify({"success": False, "error": "Status is required"}), 400

        updated_complaint = complaints_collection.find_one_and_update(
            {"complaintId": complaint_id},
            {"$set": {"status": new_status, "updatedAt": datetime.utcnow()}},
            return_document=True
        )

        if not updated_complaint:
            return jsonify({"success": False, "error": "Complaint not found"}), 404

        return jsonify({
            "success": True,
            "data": _serialize_doc(updated_complaint)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# POST /api/complaints — submit new complaint
@app.route("/api/complaints", methods=["POST"])
def create_complaint():
    try:
        # Accept both JSON bodies and form‑data (for file uploads)
        data = {}
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()

        # Extract required fields
        category = data.get("category")
        description = data.get("description")
        location = data.get("location")

        if not category or not description or not location:
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        # Handle optional photo upload
        filename = None
        if "photo" in request.files:
            photo = request.files["photo"]
            if photo.filename:
                filename = secure_filename(photo.filename)
                dest_path = Path(app.config["UPLOAD_FOLDER"]).joinpath(filename)
                photo.save(dest_path)

        # Build complaint document
        complaint_doc = {
            "complaintId": generate_complaint_id(),
            "category": category,
            "description": description,
            "location": location,
            "photo": filename,
            "priority": classify_priority(category, description),
            "status": "Pending",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        # Insert into MongoDB
        result = complaints_collection.insert_one(complaint_doc)
        complaint_doc["_id"] = str(result.inserted_id)

        return jsonify({
            "success": True,
            "data": _serialize_doc(complaint_doc)
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    # Enable debug mode for development – remove or set to False for production
    app.run(host="0.0.0.0", port=port, debug=True)
