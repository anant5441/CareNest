from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# LangChain setup
from .connect_memory_with_llm import qa_chain, structured_query_template

meal_router = APIRouter()

class NutritionRequest(BaseModel):
    age: str
    meal_duration: str
    diet: str
    diet_notes: str
    allergies: str
    nutrient_focus: str
    foods_tolerated: str
    medical_conditions: str
    cultural_preference: str

@meal_router.get("/test")
async def home():
    return {"message": "Meal Gen API is running"}

@meal_router.post("/generate")
async def generate_meal_plan(payload: NutritionRequest):
    try:
        prompt = structured_query_template.format(**payload.dict())
        result = qa_chain.invoke({"query": prompt})
        sources = [
            {"source": doc.metadata.get("source", "Unknown")}
            for doc in result.get("source_documents", [])
        ]
        return JSONResponse(content={"result": result["result"], "sources": sources})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)