import asyncio
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
JWT_SECRET = os.environ.get("JWT_SECRET", "qmd-hakomed-secret-2026-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24
PORT = int(os.environ.get("PORT", "8000"))

# Password hashing - using pbkdf2_sha256 (no external C dependency needed)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Default whitelisted users
DEFAULT_USERS = [
    {"email": "thika.orges@gmail.com", "password": "Hakomed2026!", "role": "admin"},
    {"email": "thika@hakomed.it", "password": "Hakomed2026!", "role": "admin"},
    {"email": "martin@hakomed.it", "password": "Hakomed2026!", "role": "admin"},
    {"email": "hansjoerg@hakomed.it", "password": "Hakomed2026!", "role": "admin"},
]

# App
app = FastAPI(title="qmd Global Partner Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB
client: AsyncIOMotorClient = None
db = None

security = HTTPBearer()


class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class PartnerCreate(BaseModel):
    name: str
    country: str
    flag: str = ""
    region: str
    activity: str
    email: str = ""
    status: str = "Current"
    revenue_2026: Optional[float] = None
    has_contract: bool = False
    contract_expiration: Optional[str] = None

class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    flag: Optional[str] = None
    region: Optional[str] = None
    activity: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    revenue_2026: Optional[float] = None
    has_contract: Optional[bool] = None
    contract_expiration: Optional[str] = None

class LogCreate(BaseModel):
    text: str


@app.on_event("startup")
async def startup():
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    users_col = db["users"]
    for u in DEFAULT_USERS:
        existing = await users_col.find_one({"email": u["email"]})
        if not existing:
            await users_col.insert_one({
                "id": str(uuid.uuid4()),
                "email": u["email"],
                "hashed_password": pwd_context.hash(u["password"]),
                "role": u["role"],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info(f"Created default user: {u['email']}")
    asyncio.create_task(keep_alive_task())
    logger.info("Keep-alive background task started")


@app.on_event("shutdown")
async def shutdown():
    global client
    if client:
        client.close()


async def keep_alive_task():
    """Self-ping every 4 minutes to prevent container sleep."""
    await asyncio.sleep(10)
    async with httpx.AsyncClient(base_url=f"http://localhost:{PORT}") as hclient:
        while True:
            try:
                resp = await hclient.get("/api/health")
                logger.debug(f"Keep-alive ping: {resp.status_code}")
            except Exception as e:
                logger.warning(f"Keep-alive failed: {e}")
            await asyncio.sleep(240)


def create_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode({"sub": email, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {"email": user["email"], "role": user.get("role", "admin"), "id": user.get("id", "")}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/auth/login")
async def login(req: LoginRequest):
    user = await db["users"].find_one({"email": req.email})
    if not user or not pwd_context.verify(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["email"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"email": user["email"], "role": user.get("role", "admin"), "id": user.get("id", "")},
    }


@app.get("/api/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return user


@app.post("/api/auth/change-password")
async def change_password(req: ChangePasswordRequest, user=Depends(get_current_user)):
    db_user = await db["users"].find_one({"email": user["email"]})
    if not db_user or not pwd_context.verify(req.current_password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    new_hash = pwd_context.hash(req.new_password)
    await db["users"].update_one({"email": user["email"]}, {"$set": {"hashed_password": new_hash}})
    return {"message": "Password changed successfully"}


@app.get("/api/auth/users")
async def list_users(user=Depends(get_current_user)):
    users = await db["users"].find({}, {"hashed_password": 0, "_id": 0}).to_list(100)
    return users


@app.get("/api/partners")
async def list_partners(
    region: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    user=Depends(get_current_user),
):
    query = {}
    if region:
        query["region"] = region
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"country": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]
    partners = await db["partners"].find(query, {"_id": 0}).sort("name", 1).to_list(1000)
    return partners


@app.get("/api/partners/stats")
async def partner_stats(user=Depends(get_current_user)):
    total = await db["partners"].count_documents({})
    current = await db["partners"].count_documents({"status": "Current"})
    standby = await db["partners"].count_documents({"status": "Standby"})
    old = await db["partners"].count_documents({"status": "Old"})
    pipeline = [
        {"$match": {"revenue_2026": {"$ne": None, "$gt": 0}}},
        {"$group": {"_id": None, "total": {"$sum": "$revenue_2026"}}},
    ]
    revenue_result = await db["partners"].aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    regions = await db["partners"].distinct("region")
    countries = await db["partners"].distinct("country")
    return {
        "total": total,
        "current": current,
        "standby": standby,
        "old": old,
        "total_revenue_2026": total_revenue,
        "regions": len(regions),
        "countries": len(countries),
    }


@app.get("/api/partners/{partner_id}")
async def get_partner(partner_id: str, user=Depends(get_current_user)):
    partner = await db["partners"].find_one({"id": partner_id}, {"_id": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return partner


@app.post("/api/partners", status_code=201)
async def create_partner(partner: PartnerCreate, user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "name": partner.name,
        "country": partner.country,
        "flag": partner.flag,
        "region": partner.region,
        "activity": partner.activity,
        "email": partner.email,
        "status": partner.status,
        "revenue_2026": partner.revenue_2026,
        "has_contract": partner.has_contract,
        "contract_expiration": partner.contract_expiration,
        "created_at": now,
        "updated_at": now,
    }
    await db["partners"].insert_one(doc)
    doc.pop("_id", None)
    return doc


@app.put("/api/partners/{partner_id}")
async def update_partner(partner_id: str, updates: PartnerUpdate, user=Depends(get_current_user)):
    existing = await db["partners"].find_one({"id": partner_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Partner not found")
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db["partners"].update_one({"id": partner_id}, {"$set": update_data})
    updated = await db["partners"].find_one({"id": partner_id}, {"_id": 0})
    return updated


@app.delete("/api/partners/{partner_id}")
async def delete_partner(partner_id: str, user=Depends(get_current_user)):
    existing = await db["partners"].find_one({"id": partner_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Partner not found")
    await db["partners"].delete_one({"id": partner_id})
    await db["partner_logs"].delete_many({"partner_id": partner_id})
    return {"message": "Partner deleted", "id": partner_id}


@app.post("/api/partners/seed")
async def seed_partners(force: bool = False, user=Depends(get_current_user)):
    count = await db["partners"].count_documents({})
    if count > 0 and not force:
        return {"message": f"Already {count} partners. Use force=true to re-seed.", "seeded": False}
    if force:
        await db["partners"].delete_many({})
    import json
    seed_path = os.path.join(os.path.dirname(__file__), "seed_data.json")
    if os.path.exists(seed_path):
        with open(seed_path, "r") as f:
            partners = json.load(f)
        now = datetime.now(timezone.utc).isoformat()
        for p in partners:
            if "id" not in p:
                p["id"] = str(uuid.uuid4())
            if "created_at" not in p:
                p["created_at"] = now
            if "updated_at" not in p:
                p["updated_at"] = now
        await db["partners"].insert_many(partners)
        return {"message": f"Seeded {len(partners)} partners", "seeded": True}
    return {"message": "No seed data file found", "seeded": False}


@app.get("/api/partners/{partner_id}/logs")
async def list_partner_logs(partner_id: str, user=Depends(get_current_user)):
    partner = await db["partners"].find_one({"id": partner_id})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    logs = await db["partner_logs"].find(
        {"partner_id": partner_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return logs


@app.post("/api/partners/{partner_id}/logs", status_code=201)
async def add_partner_log(partner_id: str, log: LogCreate, user=Depends(get_current_user)):
    partner = await db["partners"].find_one({"id": partner_id})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "partner_id": partner_id,
        "text": log.text,
        "author": user["email"],
        "created_at": now,
    }
    await db["partner_logs"].insert_one(doc)
    doc.pop("_id", None)
    return doc


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)


from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pathlib

STATIC_DIR = pathlib.Path("/app/static")
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR / "static")), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
