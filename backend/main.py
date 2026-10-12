import os
import json
import uuid
import hmac
import hashlib
import base64
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Request, Response, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

SECRET_KEY = "vsms-secret-jwt-token-key-2026"
COOKIE_NAME = "vsms_session"
DB_FILE = os.path.join(os.path.dirname(__file__), "db.json")
SEED_FILE = os.path.join(os.path.dirname(__file__), "seed_data.json")

app = FastAPI(title="AutoPulse VSM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://tt-1-eu8u.onrender.com",
        "https://autopulse-vsm.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Database Setup & Persistence -----------------

DEFAULT_USERS = [
    {
        "id": "513d46d5-5557-48c8-ae1d-5b633141896e",
        "email": "staff@autovsm.com",
        "password": "password123",
        "name": "Rajesh Sharma",
        "role": "staff",
        "customer_id": None,
    },
    {
        "id": "f61c7ffa-d317-4a27-951e-651beb19b21b",
        "email": "customer@autovsm.com",
        "password": "password123",
        "name": "Priya Sharma",
        "role": "customer",
        "customer_id": "b4d8ead2-b110-4cad-baf3-96ceb3383002",
    },
]

db: Dict[str, Any] = {
    "users": [dict(u) for u in DEFAULT_USERS],
    "customers": [],
    "vehicles": [],
    "services": [],
}

def load_db():
    global db
    loaded = None
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                loaded = json.load(f)
        except Exception:
            pass

    if not loaded and os.path.exists(SEED_FILE):
        try:
            with open(SEED_FILE, "r", encoding="utf-8") as f:
                loaded = json.load(f)
        except Exception:
            pass

    if loaded:
        if "users" in loaded and loaded["users"]:
            db["users"] = loaded["users"]
        else:
            db["users"] = [dict(u) for u in DEFAULT_USERS]
        db["customers"] = loaded.get("customers", [])
        db["vehicles"] = loaded.get("vehicles", [])
        db["services"] = loaded.get("services", [])
        save_db()
    else:
        db["users"] = [dict(u) for u in DEFAULT_USERS]

def save_db():
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2)
    except Exception as e:
        print(f"Error saving db: {e}")

load_db()

# ----------------- Standard JWT (HS256) Zero-dependency Implementation -----------------

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def base64url_decode(data: str) -> bytes:
    rem = len(data) % 4
    if rem > 0:
        data += '=' * (4 - rem)
    return base64.urlsafe_b64decode(data.encode('utf-8'))

def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    exp = int((datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))).timestamp())
    header = base64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode('utf-8'))
    payload = base64url_encode(json.dumps({"sub": user_id, "exp": exp}).encode('utf-8'))
    sig = base64url_encode(hmac.new(SECRET_KEY.encode('utf-8'), f"{header}.{payload}".encode('utf-8'), hashlib.sha256).digest())
    return f"{header}.{payload}.{sig}"

def decode_token(token: str) -> dict:
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid token format")
    header, payload, sig = parts
    expected_sig = base64url_encode(hmac.new(SECRET_KEY.encode('utf-8'), f"{header}.{payload}".encode('utf-8'), hashlib.sha256).digest())
    if not hmac.compare_digest(sig, expected_sig):
        raise ValueError("Invalid token signature")
    data = json.loads(base64url_decode(payload).decode('utf-8'))
    if "exp" in data and data["exp"] < int(datetime.now(timezone.utc).timestamp()):
        raise ValueError("Token expired")
    return data

def get_current_user(request: Request) -> Dict[str, Any]:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not signed in")

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not signed in")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not signed in")

    user = next((u for u in db["users"] if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not signed in")
    return user

def require_staff(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if user.get("role") != "staff":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff access required")
    return user

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")

def vehicle_label(v: Dict[str, Any]) -> str:
    return f"{v.get('year', '')} {v.get('make', '')} {v.get('model', '')} · {v.get('plate', '')}"

def refresh_customer_vehicle_counts():
    for cust in db["customers"]:
        cust["vehicle_count"] = sum(1 for v in db["vehicles"] if v.get("customer_id") == cust["id"])

# ----------------- Pydantic Models -----------------

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    customer_id: Optional[str] = None

class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    address: str = ""

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class VehicleCreate(BaseModel):
    customer_id: str
    make: str
    model: str
    year: int
    plate: str
    vin: str
    mileage: int

class VehicleUpdate(BaseModel):
    customer_id: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    plate: Optional[str] = None
    vin: Optional[str] = None
    mileage: Optional[int] = None

class ServiceCreate(BaseModel):
    vehicle_id: str
    service_type: str
    description: str = ""
    technician: str = ""
    cost: float
    status: str
    service_date: str

class ServiceUpdate(BaseModel):
    vehicle_id: Optional[str] = None
    service_type: Optional[str] = None
    description: Optional[str] = None
    technician: Optional[str] = None
    cost: Optional[float] = None
    status: Optional[str] = None
    service_date: Optional[str] = None

# ----------------- API Routes -----------------

@app.get("/api")
@app.get("/api/")
def api_root():
    return {"message": "Hello World"}

# --- Auth ---

@app.post("/api/auth/login", response_model=UserResponse)
def login(creds: LoginRequest, response: Response):
    user = next((u for u in db["users"] if u["email"].lower() == creds.email.lower() and u["password"] == creds.password), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user["id"])
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=604800,
        samesite="none",
        secure=True,
        path="/",
    )
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "customer_id": user["customer_id"],
    }

@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/", samesite="none", secure=True)
    return {"success": True}

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "customer_id": user["customer_id"],
    }

# --- Customers ---

@app.get("/api/customers")
def get_customers(user: Dict[str, Any] = Depends(require_staff)):
    refresh_customer_vehicle_counts()
    return db["customers"]

@app.post("/api/customers")
def create_customer(payload: CustomerCreate, user: Dict[str, Any] = Depends(require_staff)):
    new_cust = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "address": payload.address,
        "created_at": now_iso(),
        "vehicle_count": 0,
    }
    db["customers"].append(new_cust)
    save_db()
    return new_cust

@app.put("/api/customers/{customer_id}")
def update_customer(customer_id: str, payload: CustomerUpdate, user: Dict[str, Any] = Depends(require_staff)):
    cust = next((c for c in db["customers"] if c["id"] == customer_id), None)
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    if payload.name is not None:
        cust["name"] = payload.name
        for v in db["vehicles"]:
            if v.get("customer_id") == customer_id:
                v["owner_name"] = payload.name
        for s in db["services"]:
            v = next((veh for veh in db["vehicles"] if veh["id"] == s.get("vehicle_id")), None)
            if v and v.get("customer_id") == customer_id:
                s["owner_name"] = payload.name

    if payload.email is not None:
        cust["email"] = payload.email
    if payload.phone is not None:
        cust["phone"] = payload.phone
    if payload.address is not None:
        cust["address"] = payload.address

    save_db()
    return cust

@app.delete("/api/customers/{customer_id}")
def delete_customer(customer_id: str, user: Dict[str, Any] = Depends(require_staff)):
    idx = next((i for i, c in enumerate(db["customers"]) if c["id"] == customer_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    db["customers"].pop(idx)
    veh_ids = [v["id"] for v in db["vehicles"] if v.get("customer_id") == customer_id]
    db["vehicles"] = [v for v in db["vehicles"] if v.get("customer_id") != customer_id]
    db["services"] = [s for s in db["services"] if s.get("vehicle_id") not in veh_ids]

    save_db()
    return Response(status_code=204)

# --- Vehicles ---

@app.get("/api/vehicles")
def get_vehicles(user: Dict[str, Any] = Depends(require_staff)):
    for v in db["vehicles"]:
        cust = next((c for c in db["customers"] if c["id"] == v.get("customer_id")), None)
        v["owner_name"] = cust["name"] if cust else "Unknown"
    return db["vehicles"]

@app.post("/api/vehicles")
def create_vehicle(payload: VehicleCreate, user: Dict[str, Any] = Depends(require_staff)):
    cust = next((c for c in db["customers"] if c["id"] == payload.customer_id), None)
    owner_name = cust["name"] if cust else "Unknown"

    new_veh = {
        "id": str(uuid.uuid4()),
        "customer_id": payload.customer_id,
        "make": payload.make,
        "model": payload.model,
        "year": payload.year,
        "plate": payload.plate,
        "vin": payload.vin,
        "mileage": payload.mileage,
        "created_at": now_iso(),
        "owner_name": owner_name,
    }
    db["vehicles"].append(new_veh)
    refresh_customer_vehicle_counts()
    save_db()
    return new_veh

@app.put("/api/vehicles/{vehicle_id}")
def update_vehicle(vehicle_id: str, payload: VehicleUpdate, user: Dict[str, Any] = Depends(require_staff)):
    veh = next((v for v in db["vehicles"] if v["id"] == vehicle_id), None)
    if not veh:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if payload.customer_id is not None:
        veh["customer_id"] = payload.customer_id
    if payload.make is not None:
        veh["make"] = payload.make
    if payload.model is not None:
        veh["model"] = payload.model
    if payload.year is not None:
        veh["year"] = payload.year
    if payload.plate is not None:
        veh["plate"] = payload.plate
    if payload.vin is not None:
        veh["vin"] = payload.vin
    if payload.mileage is not None:
        veh["mileage"] = payload.mileage

    cust = next((c for c in db["customers"] if c["id"] == veh.get("customer_id")), None)
    veh["owner_name"] = cust["name"] if cust else "Unknown"

    new_label = vehicle_label(veh)
    for s in db["services"]:
        if s.get("vehicle_id") == vehicle_id:
            s["vehicle_label"] = new_label
            s["owner_name"] = veh["owner_name"]

    refresh_customer_vehicle_counts()
    save_db()
    return veh

@app.delete("/api/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: str, user: Dict[str, Any] = Depends(require_staff)):
    idx = next((i for i, v in enumerate(db["vehicles"]) if v["id"] == vehicle_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    db["vehicles"].pop(idx)
    db["services"] = [s for s in db["services"] if s.get("vehicle_id") != vehicle_id]
    refresh_customer_vehicle_counts()
    save_db()
    return Response(status_code=204)

# --- Services ---

@app.get("/api/services")
def get_services(user: Dict[str, Any] = Depends(require_staff)):
    for s in db["services"]:
        veh = next((v for v in db["vehicles"] if v["id"] == s.get("vehicle_id")), None)
        if veh:
            s["vehicle_label"] = vehicle_label(veh)
            cust = next((c for c in db["customers"] if c["id"] == veh.get("customer_id")), None)
            s["owner_name"] = cust["name"] if cust else "Unknown"
        else:
            s.setdefault("vehicle_label", "Unknown Vehicle")
            s.setdefault("owner_name", "Unknown Owner")
    return db["services"]

@app.post("/api/services")
def create_service(payload: ServiceCreate, user: Dict[str, Any] = Depends(require_staff)):
    veh = next((v for v in db["vehicles"] if v["id"] == payload.vehicle_id), None)
    if veh:
        v_label = vehicle_label(veh)
        cust = next((c for c in db["customers"] if c["id"] == veh.get("customer_id")), None)
        owner_name = cust["name"] if cust else "Unknown"
    else:
        v_label = "Unknown Vehicle"
        owner_name = "Unknown Owner"

    new_service = {
        "id": str(uuid.uuid4()),
        "vehicle_id": payload.vehicle_id,
        "service_type": payload.service_type,
        "description": payload.description,
        "technician": payload.technician,
        "cost": payload.cost,
        "status": payload.status,
        "service_date": payload.service_date,
        "created_at": now_iso(),
        "vehicle_label": v_label,
        "owner_name": owner_name,
    }
    db["services"].append(new_service)
    save_db()
    return new_service

@app.put("/api/services/{service_id}")
def update_service(service_id: str, payload: ServiceUpdate, user: Dict[str, Any] = Depends(require_staff)):
    s = next((rec for rec in db["services"] if rec["id"] == service_id), None)
    if not s:
        raise HTTPException(status_code=404, detail="Service record not found")

    if payload.vehicle_id is not None:
        s["vehicle_id"] = payload.vehicle_id
    if payload.service_type is not None:
        s["service_type"] = payload.service_type
    if payload.description is not None:
        s["description"] = payload.description
    if payload.technician is not None:
        s["technician"] = payload.technician
    if payload.cost is not None:
        s["cost"] = payload.cost
    if payload.status is not None:
        s["status"] = payload.status
    if payload.service_date is not None:
        s["service_date"] = payload.service_date

    veh = next((v for v in db["vehicles"] if v["id"] == s.get("vehicle_id")), None)
    if veh:
        s["vehicle_label"] = vehicle_label(veh)
        cust = next((c for c in db["customers"] if c["id"] == veh.get("customer_id")), None)
        s["owner_name"] = cust["name"] if cust else "Unknown"

    save_db()
    return s

@app.delete("/api/services/{service_id}")
def delete_service(service_id: str, user: Dict[str, Any] = Depends(require_staff)):
    idx = next((i for i, s in enumerate(db["services"]) if s["id"] == service_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Service record not found")

    db["services"].pop(idx)
    save_db()
    return Response(status_code=204)

# --- Customer Portal ---

@app.get("/api/portal/summary")
def get_portal_summary(user: Dict[str, Any] = Depends(get_current_user)):
    customer_id = user.get("customer_id")
    if not customer_id and user.get("role") == "staff":
        if db["customers"]:
            customer_id = db["customers"][0]["id"]

    cust = next((c for c in db["customers"] if c["id"] == customer_id), None)
    if not cust:
        raise HTTPException(status_code=404, detail="Customer record not found")

    cust_vehicles = [v for v in db["vehicles"] if v.get("customer_id") == customer_id]
    portal_vehicles = []
    for v in cust_vehicles:
        v_services = [
            s for s in db["services"] if s.get("vehicle_id") == v["id"]
        ]
        v_services.sort(key=lambda s: s.get("service_date", ""), reverse=True)
        v_dict = dict(v)
        v_dict["services"] = v_services
        v_dict["vehicle_count"] = len(cust_vehicles)
        portal_vehicles.append(v_dict)

    return {
        "customer": cust,
        "vehicles": portal_vehicles,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
