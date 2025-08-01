from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
from typing import Optional
# from bson import ObjectId

app = FastAPI()


# Allow CORS from frontend
origins = [
    "http://localhost:5173",
    # Add more origins if needed, like production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")  # Replace with your MongoDB URL
db = client["carenest"]  # Database name

# Models (Pydantic schemas)
class User(BaseModel):
    name: str
    age: int
    phone: str
    address: str
    lmp: str  # Last Menstrual Period (YYYY-MM-DD)
    edd: str  # Expected Delivery Date (YYYY-MM-DD)

class ANCVisit(BaseModel):
    user_id: str
    visit_number: int
    scheduled_date: str
    actual_visit_date: str = None
    status: str = "Pending"  # "Pending", "Visited", "Missed"
    bp: str = None
    weight: float = None
    notes: str = None

class VisitUpdate(BaseModel):
    bp: Optional[str] = None
    weight: Optional[float] = None
    notes: Optional[str] = None

def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# API Endpoints
@app.post("/register/")
def register_pregnant_woman(user: User):
    """Register a new pregnant woman"""
    users_collection = db["users"]
    # result = users_collection.insert_one(user.dict())
    result = users_collection.insert_one(user.model_dump())

    # Auto-generate ANC visits (8 visits as per WHO)
    anc_visits = generate_anc_visits(str(result.inserted_id), user.lmp, user.edd)
    db["anc_visits"].insert_many(anc_visits)
    vaccines = generate_vaccine_schedule(str(result.inserted_id), user.lmp)
    db["vaccinations"].insert_many(vaccines)
    
    return {"message": "User registered and ANC visits scheduled!"}

def generate_anc_visits(user_id: str, lmp: str, edd: str) -> List[dict]:
    """Generate 8 ANC visits based on LMP/EDD"""
    lmp_date = datetime.strptime(lmp, "%Y-%m-%d")
    edd_date = datetime.strptime(edd, "%Y-%m-%d")
    
    visit_schedule = [
        8,   # Week 8-12
        20,  # Week 20
        26,  # Week 26
        30,  # Week 30
        34,  # Week 34
        36,  # Week 36
        38,  # Week 38
        40   # Week 40 (EDD)
    ]
    
    visits = []
    for i, week in enumerate(visit_schedule, 1):
        visit_date = lmp_date + timedelta(weeks=week)
        visits.append({
            "user_id": user_id,
            "visit_number": i,
            "scheduled_date": visit_date.strftime("%Y-%m-%d"),
            "status": "Pending"
        })
    return visits

def generate_vaccine_schedule(user_id: str, lmp: str) -> List[dict]:
    lmp_date = datetime.strptime(lmp, "%Y-%m-%d")
    schedule = [
        {"name": "TT1", "due_date": lmp_date + timedelta(weeks=12)},
        {"name": "TT2", "due_date": lmp_date + timedelta(weeks=16)},
        {"name": "TT Booster", "due_date": lmp_date + timedelta(weeks=20)},
        {"name": "HepB", "due_date": lmp_date + timedelta(weeks=24)},
        {"name": "DTP", "due_date": lmp_date + timedelta(weeks=28)},
        {"name": "Influenza", "due_date": lmp_date + timedelta(weeks=32)},
    ]
    vaccines = []
    for v in schedule:
        vaccines.append({
            "user_id": user_id,
            "name": v["name"],
            "due_date": v["due_date"].strftime("%Y-%m-%d"),
            "status": "Pending"
        })
    return vaccines

# @app.get("/users/{user_id}/visits")
# def get_anc_visits(user_id: str):
#     """Get all ANC visits for a user"""
#     visits = list(db["anc_visits"].find({"user_id": user_id}))
#     return {"visits": visits}
@app.get("/users/{user_id}/visits")
def get_anc_visits(user_id: str):
    """Get all ANC visits for a user"""
    visits = list(db["anc_visits"].find({"user_id": user_id}))
    
    # Convert ObjectId to string
    for visit in visits:
        visit["_id"] = str(visit["_id"])
    
    return {"visits": visits}


@app.put("/visits/{visit_id}/mark-visited")
def mark_visit_visited(visit_id: str, data: VisitUpdate):
    visits_collection = db["anc_visits"]

    try:
        obj_id = ObjectId(visit_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid visit ID")

    update_data = {
        "status": "Visited",
        "actual_visit_date": datetime.now().strftime("%Y-%m-%d"),
        "bp": data.bp,
        "weight": data.weight,
        "notes": data.notes
    }

    result = visits_collection.update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Visit not found")

    return {"message": "Visit marked as visited!"}

@app.get("/users/{user_id}/vaccinations")
def get_vaccinations(user_id: str):
    vaccines = list(db["vaccinations"].find({"user_id": user_id}))
    for v in vaccines:
        v["_id"] = str(v["_id"])
    return {"vaccines": vaccines}

@app.put("/vaccinations/{vaccine_id}/mark-completed")
def mark_vaccine_completed(vaccine_id: str):
    result = db["vaccinations"].update_one(
        {"_id": ObjectId(vaccine_id)},
        {"$set": {"status": "Completed"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vaccine not found")
    return {"message": "Vaccine marked as completed"}


# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)