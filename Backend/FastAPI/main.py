# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.query import router as medical_router
from routes.symptom import router as symptom_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Medical Query API",
    description="A FastAPI application for medical query processing with NLP",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(medical_router, prefix="/api/f1")
app.include_router(symptom_router, prefix="/api/f2")

@app.get("/")
async def root():
    return {"message": "Medical Query API is running"}


if __name__ == "__main__":
    import uvicorn
    #Replace host with ur IP
    uvicorn.run(app, host="0.0.0.0", port=8000)