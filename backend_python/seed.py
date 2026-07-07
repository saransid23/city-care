"""Seed script — inserts 30 realistic dummy complaints into city_care.complaints"""
import os
import random
import string
import secrets
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/city_care"))
db = client[os.getenv("MONGO_DB", "city_care")]
col = db["complaints"]

CATEGORIES = ["Pothole", "Water Supply", "Streetlight", "Garbage", "Electricity"]

DESCRIPTIONS = {
    "Pothole": [
        "Large pothole on the main road causing accidents. Vehicles are getting damaged.",
        "Multiple potholes near the school gate, dangerous for children and cyclists.",
        "Deep crater-like pothole at the junction — leaking water makes it worse.",
        "Pothole has been there for weeks, needs immediate repair before someone gets hurt.",
        "Broken road surface with exposed gravel causing flat tires daily.",
    ],
    "Water Supply": [
        "No water supply for the past 3 days. Residents are struggling without basic needs.",
        "Leaking water pipe on main street — flooding the road and wasting water.",
        "Contaminated water supply — residents are falling sick after drinking tap water.",
        "Low water pressure for 2 weeks, barely enough for daily household use.",
        "Water supply pipeline burst causing flooding in residential area.",
    ],
    "Streetlight": [
        "4 consecutive streetlights are not working — area is completely dark at night.",
        "Faulty flickering streetlight near bus stop causing visibility issues.",
        "Streetlight pole is tilted dangerously, could fall on pedestrians.",
        "No lighting on the stretch near the park — unsafe for evening walkers.",
        "Broken streetlight exposing live wires, emergency hazard.",
    ],
    "Garbage": [
        "Garbage not collected for 5 days — overflowing bins and foul smell everywhere.",
        "Illegal dumping site near the park, attracting stray animals and disease.",
        "Garbage truck is skipping our street for the past week with no reason.",
        "Waste bins near the market are full and spilling onto the road.",
        "Dead animal waste not cleared — major health concern for the locality.",
    ],
    "Electricity": [
        "Frequent power cuts every 2 hours — affecting businesses and households.",
        "Exposed electrical wires on the roadside — emergency danger to public.",
        "Transformer making loud noise and sparking — fire hazard risk.",
        "Street electrical panel left open with wires hanging out, children nearby.",
        "Power outage for 12 hours with no ETA — affecting hospitals and residences.",
    ],
}

LOCATIONS = [
    "Anna Nagar, Chennai", "T. Nagar, Chennai", "Velachery, Chennai",
    "Adyar, Chennai", "Tambaram, Chennai", "Chromepet, Chennai",
    "Perambur, Chennai", "Kodambakkam, Chennai", "Guindy, Chennai",
    "Porur, Chennai", "Sholinganallur, Chennai", "Pallavaram, Chennai",
    "Ambattur, Chennai", "Avadi, Chennai", "Madipakkam, Chennai",
]

STATUSES = ["Pending", "Pending", "Pending", "In Progress", "In Progress", "Resolved"]

PRIORITY_MAP = {
    ("Streetlight", "Broken streetlight exposing live wires"): "Critical",
    ("Electricity", "Exposed electrical wires"): "Critical",
    ("Electricity", "Transformer making loud noise"): "Critical",
    ("Water Supply", "Contaminated water supply"): "Critical",
    ("Water Supply", "No water supply for the past 3 days"): "High",
    ("Water Supply", "Water supply pipeline burst"): "High",
    ("Garbage", "Dead animal waste"): "High",
    ("Electricity", "Power outage for 12 hours"): "High",
}

def gen_id():
    alpha = string.ascii_uppercase + string.digits
    return "CMP-" + "".join(secrets.choice(alpha) for _ in range(7))

def classify(category, description):
    desc = description.lower()
    for (cat, kw), pri in PRIORITY_MAP.items():
        if cat == category and kw.lower() in desc:
            return pri
    critical_kw = ["danger", "emergency", "hazard", "accident", "fire", "flood",
                   "electrocution", "exposed wire", "collapse", "live wires", "sparking"]
    high_kw = ["major", "severe", "broken", "days", "weeks", "no water", "no supply",
               "leaking", "burst", "outage", "contaminated"]
    medium_kw = ["moderate", "overflowing", "some", "few", "minor"]
    if any(k in desc for k in critical_kw):
        return "Critical"
    if any(k in desc for k in high_kw):
        return "High"
    if any(k in desc for k in medium_kw):
        return "Medium"
    if category in ["Electricity", "Water Supply"]:
        return "High"
    if category == "Pothole":
        return "Medium"
    return "Low"

now = datetime.utcnow()

docs = []
for i in range(30):
    cat = random.choice(CATEGORIES)
    desc = random.choice(DESCRIPTIONS[cat])
    loc = random.choice(LOCATIONS)
    status = random.choice(STATUSES)
    priority = classify(cat, desc)
    # Spread complaints over last 30 days
    days_ago = random.randint(0, 30)
    created = now - timedelta(days=days_ago, hours=random.randint(0, 23))
    updated = created + timedelta(hours=random.randint(1, 48)) if status != "Pending" else created

    docs.append({
        "complaintId": gen_id(),
        "category": cat,
        "description": desc,
        "location": loc,
        "photo": None,
        "priority": priority,
        "status": status,
        "createdAt": created,
        "updatedAt": updated,
    })

result = col.insert_many(docs)
print(f"✅ Inserted {len(result.inserted_ids)} complaints successfully.")
total = col.count_documents({})
print(f"📊 Total complaints in DB now: {total}")
