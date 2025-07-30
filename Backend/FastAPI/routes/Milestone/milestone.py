from fastapi import FastAPI, Query
from pydantic import BaseModel
from milestoneCore import run_milestone_pipeline
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

@app.post("/milestone")
def get_milestone_info(req: QueryRequest):
    result = run_milestone_pipeline(req.query)
    return result
