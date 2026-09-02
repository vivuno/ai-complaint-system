from app.models.user import User
from app.services.auth import hash_password, verify_password, create_token
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
from app.services.ai import analyze_complaint
import uuid
from app.database.db import SessionLocal, engine, Base
from app.models.complaint import Complaint
from app.services.similarity import is_duplicate
from sentence_transformers import SentenceTransformer, util
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.services.email import send_email
import asyncio
from transformers import pipeline
classifier = pipeline("zero-shot-classification")
sentiment_model = pipeline("sentiment-analysis")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

model = SentenceTransformer('all-MiniLM-L6-v2')
  
app = FastAPI()

# create tables
Base.metadata.create_all(bind=engine)

@app.post("/complaint")
async def create_complaint(text: str, username: str, db: Session = Depends(get_db)):


    labels = ["Water", "Electricity", "Internet", "Billing", "Other"]

    result = classifier(text, labels)

    category = result["labels"][0]  # best match

    sentiment = sentiment_model(text)[0]["label"]

    if "not working" in text.lower() or "urgent" in text.lower():
        priority = "High"
    elif "slow" in text.lower():
        priority = "Medium"
    else:
        priority = "Low"



    # Get all user's active complaints
    complaints = db.query(Complaint).filter(
        Complaint.username == username,
        Complaint.status != "Resolved"
    ).all()

    # 🔍 Compare similarity
    new_embedding = model.encode(text, convert_to_tensor=True)

    for c in complaints:
        existing_embedding = model.encode(c.text, convert_to_tensor=True)

        similarity = util.cos_sim(new_embedding, existing_embedding).item()

        if similarity > 0.75:   # 🔥 threshold
            return {
                "error": "Similar complaint already exists "
            }

    # ✅ Save if unique
    complaint = Complaint(
        text=text,
        username=username,
        status="Submitted",
        category=category,
        priority=priority,
        sentiment=sentiment
        
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    
    user = db.query(User).filter(User.username == username).first()

    if user and user.email:
        await send_email(
            subject="Complaint Submitted ",
            email_to=user.email,
            body=f"""
Hello {username},

Your complaint has been successfully submitted.

Complaint ID: {complaint.id}
Status: Submitted

Thank you.
"""
        )

    return complaint

@app.get("/complaints")
def get_all_complaints(username: str, db: Session = Depends(get_db)):
    db = SessionLocal()

    if username == "admin":
       complaints = db.query(Complaint).all()   # ✅ admin sees all
    else:
       complaints = db.query(Complaint).filter(Complaint.username == username).all()

    result = []
    for c in complaints:
        result.append({
            "id": c.id,
            "complaint_code": f"CMP-{c.id:05d}",
            "text": c.text,
            "category": c.category,
            "sentiment": c.sentiment,
            "priority": c.priority,
            "status": c.status
        })

    return result

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
def register(username: str, password: str, email: str):
    db = SessionLocal()
    
    existing = db.query(User).filter(User.username == username) .first()
    if existing:
        return {"error": "User already exists"}

    user = User(username=username, password=hash_password(password), email=email)
    db.add(user)
    
    try:
        db.commit()
        db.refresh(user)
        return {"message": "User created"}

    except IntegrityError:
        db.rollback()
        return {"error": "Username already exists (DB constraint)"}

@app.post("/login")
def login(username: str, password: str):
    db = SessionLocal()

    user = db.query(User).filter(User.username == username).first()

    if not user or not verify_password(password, user.password):
        return {"error": "Invalid credentials"}

    token = create_token({"username": username})

    return {"token": token}


@app.put("/update-status")
async def update_status(id: int, status: str, db: Session = Depends(get_db)):
    db = SessionLocal()

    complaint = db.query(Complaint).filter(Complaint.id == id).first()

    if not complaint:
        return {"error": "Complaint not found"}

    complaint.status = status
    db.commit()
    
    user = db.query(User).filter(User.username == complaint.username).first()

    #  SEND EMAIL HERE
    if user and user.email:
        await send_email(
            subject="Complaint Status Updated ",
            email_to=user.email,
            body=f"""
Hello {complaint.username},

Your complaint (ID: {complaint.id}) status has been updated.

New Status: {status}

Thank you.
"""
        )

    return {"message": "Status updated"}
    
   
@app.get("/search-complaint")
def search_complaint(code: str):
    db = SessionLocal()

    try:
        # 🔥 Extract numeric ID
        complaint_id = int(code.replace("CMP-", ""))

    except:
        return {"error": "Invalid Complaint ID format"}

    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()

    if not complaint:
        return {"error": "Complaint not found"}

    return {
        "id": complaint.id,
        "complaint_code": f"CMP-{complaint.id:05d}",
        "text": complaint.text,
        "status": complaint.status,
        "category": complaint.category,
        "priority": complaint.priority
    }  
    
    

@app.post("/forgot-password")
async def forgot_password(email: str):
    db = SessionLocal()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return {"error": "User not found"}

    token = str(uuid.uuid4())
    user.reset_token = token
    db.commit()

    reset_link = f"http://localhost:5173/reset-password/{token}"

    await send_email(
        subject="Reset Password",
        email_to=email,
        body=f"Click here to reset password:\n{reset_link}"
    )

    return {"message": "Reset link sent"}    



@app.post("/reset-password")
def reset_password(token: str, new_password: str):
    db = SessionLocal()

    user = db.query(User).filter(User.reset_token == token).first()

    if not user:
        return {"error": "Invalid token"}

    user.password = hash_password(new_password)
    user.reset_token = None
    db.commit()

    return {"message": "Password updated"}
    
    
@app.get("/complaint/{id}")
def get_complaint_by_id(id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()

    if not complaint:
        return {"error": "Complaint not found"}

    return {
        "id": complaint.id,
        "complaint_code": f"CMP-{complaint.id:05d}",
        "text": complaint.text,
        "category": complaint.category,
        "priority": complaint.priority,
        "status": complaint.status
    }
