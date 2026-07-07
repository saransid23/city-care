# Backend Python (Flask)

This directory contains a Flask implementation that replaces the original Node.js/Express backend.

## Prerequisites
- Python 3.10+ (recommended)
- MongoDB instance (connection string in `.env`)

## Setup
```bash
# Navigate to this directory
cd backend_python

# (Optional) Create a virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Configuration
Create a `.env` file (already provided) with your MongoDB URI and desired port:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

## Running the server
```bash
python app.py
```
The API will be available at `http://localhost:5000`.

## API Endpoints
- `GET /api/health` – Health check
- `GET /api/complaints` – Retrieve all complaints
- `POST /api/complaints` – Create a new complaint (supports multipart file upload for `photo`)

## Notes
- Uploaded files are served from the shared `uploads` folder at the project root.
- CORS is configured to allow requests from the React frontend (`http://localhost:5173`).
