from fastapi import FastAPI, Query, APIRouter
from pydantic import BaseModel
from .milestoneCore import run_milestone_pipeline

milestone_router = APIRouter()


class QueryRequest(BaseModel):
    query: str

@milestone_router.post("/chat")
def get_milestone_info(req: QueryRequest):
    result = run_milestone_pipeline(req.query)
    return result
