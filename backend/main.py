
# python -m venv venv
# source venv/bin/activate   (Linux/Mac)
# venv\Scripts\activate      (Windows)
# powershell -ExecutionPolicy ByPass -File .\venv\Scripts\Activate.ps1  (Windows PowerShell)
# command prompt: venv\Scripts\activate.bat (Windows CMD)

# install dependencies:
# pip install fastapi uvicorn python-multipart ultralytics opencv-python sqlalchemy pydantic
# run: uvicorn main:app --host 127.0.0.1 --port 8001

from fastapi import FastAPI, File, UploadFile, Header, HTTPException, Query
from fastapi.responses import Response, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from pydantic import BaseModel
import os
import cv2
import numpy as np
import uuid
import json
from collections import defaultdict
from datetime import datetime

# =====================
# CONFIG
# =====================
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATABASE_URL = "sqlite:///database.db"

# =====================
# DATABASE
# =====================
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    token = Column(String, unique=True, index=True)

class ScanImage(Base):
    __tablename__ = "scan_images"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    image_path = Column(String)          # ảnh gốc
    image_boxed_path = Column(String)    # ảnh có border

    total_objects = Column(Integer)
    result_json = Column(String)
    scan_datetime = Column(DateTime)     # ngày + giờ + phút + giây

Base.metadata.create_all(bind=engine)

# =====================
# APP & MODEL
# =====================
app = FastAPI(title="YOLOv8 Demo API")
model = YOLO("models/best.pt")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# HELPER
# =====================
def get_user_by_token(token: str):
    db = SessionLocal()
    user = db.query(User).filter(User.token == token).first()
    db.close()
    return user

def draw_boxes(img, predictions):
    for p in predictions:
        x1, y1, x2, y2 = map(int, p["bbox"])
        label = f'{p["class_name"]} {p["confidence"]:.2f}'
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(
            img, label,
            (x1, max(y1 - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6, (0, 255, 0), 2
        )
    return img

# =====================
# MODELS
# =====================
class LoginRequest(BaseModel):
    username: str
    password: str

# =====================
# ROUTES
# =====================
@app.get("/")
def root():
    return {"ok": True}

# ---------------------
# LOGIN
# ---------------------
@app.post("/login")
def login(req: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.username == req.username).first()

    if user:
        if user.password != req.password:
            db.close()
            raise HTTPException(status_code=401, detail="Wrong password")
        token = user.token
    else:
        token = str(uuid.uuid4())
        user = User(username=req.username, password=req.password, token=token)
        db.add(user)
        db.commit()
        db.refresh(user)

    db.close()
    return {"token": token}

# ---------------------
# SCAN IMAGE
# ---------------------
@app.post("/scan")
async def scan_image(
    file: UploadFile = File(...),
    authorization: str = Header(...)
):
    user = get_user_by_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    # YOLO predict
    results = model(img)
    predictions = []

    for r in results:
        for box in r.boxes:
            predictions.append({
                "class_id": int(box.cls[0]),
                "class_name": model.names[int(box.cls[0])],
                "confidence": float(box.conf[0]),
                "bbox": box.xyxy[0].tolist()
            })

    # TIME
    now = datetime.now()

    # FOLDER
    base_dir = os.path.join(
        UPLOAD_DIR,
        str(now.year),
        f"{now.month:02d}",
        f"{now.day:02d}"
    )

    raw_dir = os.path.join(base_dir, "raw")
    boxed_dir = os.path.join(base_dir, "boxed")

    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(boxed_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}.jpg"

    raw_path = os.path.join(raw_dir, filename)
    boxed_path = os.path.join(boxed_dir, filename)

    # SAVE RAW
    cv2.imwrite(raw_path, img)

    # DRAW + SAVE BOXED
    img_boxed = draw_boxes(img.copy(), predictions)
    cv2.imwrite(boxed_path, img_boxed)

    # SAVE DB
    db = SessionLocal()
    scan = ScanImage(
        user_id=user.id,
        image_path=raw_path,
        image_boxed_path=boxed_path,
        total_objects=len(predictions),
        result_json=json.dumps(predictions),
        scan_datetime=now
    )
    db.add(scan)
    db.commit()
    db.close()

    # RETURN BOXED IMAGE
    _, jpeg = cv2.imencode(".jpg", img_boxed)
    return Response(content=jpeg.tobytes(), media_type="image/jpeg")

# ---------------------
# GET SCANS LIST
# ---------------------
@app.get("/scans")
def get_scans(
    authorization: str = Header(...),
    date: str = Query(None, description="YYYY-MM-DD")
):
    user = get_user_by_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = SessionLocal()
    query = db.query(ScanImage).filter(ScanImage.user_id == user.id)

    if date:
        try:
            d = datetime.strptime(date, "%Y-%m-%d").date()
            query = query.filter(ScanImage.scan_datetime >= d)
        except ValueError:
            db.close()
            raise HTTPException(status_code=400, detail="Invalid date format")

    scans = query.order_by(ScanImage.scan_datetime.desc()).all()
    db.close()

    return [
        {
            "id": s.id,
            "total_objects": s.total_objects,
            "scan_datetime": s.scan_datetime.strftime("%Y-%m-%d %H:%M:%S")
        }
        for s in scans
    ]

# ---------------------
# GET BOXED IMAGE
# ---------------------
@app.get("/scan/image/{scan_id}")
def get_scan_image(scan_id: int, authorization: str = Header(...)):
    user = get_user_by_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = SessionLocal()
    scan = db.query(ScanImage).filter(
        ScanImage.id == scan_id,
        ScanImage.user_id == user.id
    ).first()
    db.close()

    if not scan or not os.path.exists(scan.image_boxed_path):
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(scan.image_boxed_path, media_type="image/jpeg")

# ---------------------
# DELETE SCAN
# ---------------------
@app.delete("/scan/{scan_id}")
def delete_scan(scan_id: int, authorization: str = Header(...)):
    user = get_user_by_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = SessionLocal()
    scan = db.query(ScanImage).filter(
        ScanImage.id == scan_id,
        ScanImage.user_id == user.id
    ).first()

    if not scan:
        db.close()
        raise HTTPException(status_code=404, detail="Scan not found")

    if os.path.exists(scan.image_path):
        os.remove(scan.image_path)
    if os.path.exists(scan.image_boxed_path):
        os.remove(scan.image_boxed_path)

    db.delete(scan)
    db.commit()
    db.close()

    return {"ok": True}

@app.get("/stats")
def get_stats(
    authorization: str = Header(...),
    from_date: str = Query(None, description="YYYY-MM-DD"),
    to_date: str = Query(None, description="YYYY-MM-DD")
):
    user = get_user_by_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = SessionLocal()
    query = db.query(ScanImage).filter(ScanImage.user_id == user.id)

    # FILTER DATE
    try:
        if from_date:
            from_d = datetime.strptime(from_date, "%Y-%m-%d")
            query = query.filter(ScanImage.scan_datetime >= from_d)

        if to_date:
            to_d = datetime.strptime(to_date, "%Y-%m-%d")
            query = query.filter(ScanImage.scan_datetime <= to_d)
    except ValueError:
        db.close()
        raise HTTPException(status_code=400, detail="Invalid date format")

    scans = query.all()
    db.close()

    # ==========================
    # 1. SCANS PER DAY
    # ==========================
    scan_per_day = defaultdict(int)
    for s in scans:
        day = s.scan_datetime.strftime("%Y-%m-%d")
        scan_per_day[day] += 1

    scan_per_day_data = [
        {"date": k, "total_scans": v}
        for k, v in sorted(scan_per_day.items())
    ]

    # ==========================
    # 2. OBJECTS BY CLASS
    # ==========================
    objects_by_class = defaultdict(int)
    for s in scans:
        results = json.loads(s.result_json)
        for r in results:
            objects_by_class[r["class_name"]] += 1

    objects_by_class_data = [
        {"class_name": k, "total": v}
        for k, v in objects_by_class.items()
    ]

    return {
        "scan_per_day": scan_per_day_data,
        "objects_by_class": objects_by_class_data
    }