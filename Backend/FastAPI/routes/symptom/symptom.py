import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
from symptomCore import SymptomAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/medical", tags=["medical"])

# Initialize the symptom analyzer
symptom_analyzer = SymptomAnalyzer()


# Pydantic models
class HealthCheckResponse(BaseModel):
    status: str
    message: str


class AudioToAnalysisRequest(BaseModel):
    audio_data: str  # Base64 encoded audio data
    patient_age_group: Optional[str] = "newborn"
    model: Optional[str] = "nova"  # Deepgram model (nova, etc.)


class MedicalAnalysisResponse(BaseModel):
    symptom_details: Dict[str, Any]
    recommended_specialty: str
    urgency_level: str
    home_remedies: List[str]
    supportive_care: List[str]
    advice_next_steps: str
    first_aid: Optional[str]
    possible_causes: List[str]
    friendly_summary: str
    success: bool


class QueryRequest(BaseModel):
    query: str
    use_rag: Optional[bool] = True


class QueryResponse(BaseModel):
    answer: str
    source_documents: Optional[List[Dict[str, Any]]] = None
    success: bool


class RAGQueryRequest(BaseModel):
    query: str
    max_results: Optional[int] = 3


class RAGQueryResponse(BaseModel):
    answer: str
    source_documents: List[Dict[str, Any]]
    success: bool


@router.get("/health-check", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    try:
        if symptom_analyzer.is_initialized():
            return HealthCheckResponse(
                status="healthy",
                message="Medical analysis service is running properly with Groq LLM + Deepgram"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service is not properly initialized"
            )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service is currently unavailable"
        )


@router.post("/audio-to-analysis", response_model=MedicalAnalysisResponse)
async def audio_to_analysis(request: AudioToAnalysisRequest):
    """Full pipeline: Deepgram transcription + LLM symptom triage"""
    try:
        logger.info("Starting audio-to-analysis pipeline")

        analysis_result = await symptom_analyzer.analyze_voice_input(
            audio_base64=request.audio_data,
            age_group=request.patient_age_group
        )

        logger.info("Audio-to-analysis pipeline completed successfully")

        return MedicalAnalysisResponse(
            symptom_details=analysis_result.get("symptom_details", {}),
            recommended_specialty=analysis_result.get("recommended_specialty", "General Physician"),
            urgency_level=analysis_result.get("urgency_level", "Routine check-up"),
            home_remedies=analysis_result.get("home_remedies", []),
            supportive_care=analysis_result.get("supportive_care", []),
            advice_next_steps=analysis_result.get("advice_next_steps", ""),
            first_aid=analysis_result.get("first_aid"),
            possible_causes=analysis_result.get("possible_causes", []),
            friendly_summary=analysis_result.get("friendly_summary", ""),
            success=True
        )

    except Exception as e:
        logger.error(f"Audio-to-analysis pipeline failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audio-to-analysis pipeline failed: {str(e)}"
        )


@router.post("/rag-query", response_model=RAGQueryResponse)
async def rag_query(request: RAGQueryRequest):
    """Query the medical knowledge base using RAG"""
    try:
        logger.info(f"Processing RAG query: {request.query}")

        answer, source_docs = await symptom_analyzer.query_knowledge_base(
            request.query,
            request.max_results
        )

        return RAGQueryResponse(
            answer=answer,
            source_documents=source_docs,
            success=True
        )

    except Exception as e:
        logger.error(f"RAG query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG query failed: {str(e)}"
        )


@router.post("/query", response_model=QueryResponse)
async def general_query(request: QueryRequest):
    """General medical question handler"""
    try:
        logger.info(f"Processing general query: {request.query}")

        if request.use_rag:
            answer, source_docs = await symptom_analyzer.query_knowledge_base(
                request.query,
                max_results=3
            )
            return QueryResponse(
                answer=answer,
                source_documents=source_docs,
                success=True
            )
        else:
            answer = await symptom_analyzer.direct_llm_query(request.query)
            return QueryResponse(
                answer=answer,
                source_documents=None,
                success=True
            )

    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query processing failed: {str(e)}"
        )


@router.get("/status")
async def get_status():
    """Returns config + environment status"""
    return {
        "llm_provider": "Groq",
        "llm_model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "symptom_analyzer_initialized": symptom_analyzer.is_initialized(),
        "groq_api_configured": os.getenv("GROQ_API_KEY") is not None,
        "deepgram_configured": os.getenv("DEEPGRAM_API_KEY") is not None,
        "embedding_model": "all-MiniLM-L6-v2"
    }


@router.get("/debug/deepgram")
async def debug_deepgram():
    """Debug Deepgram integration"""
    try:
        # Test Deepgram connection
        status_info = symptom_analyzer.get_deepgram_status()
        connection_test = await symptom_analyzer.test_deepgram_connection()
        
        return {
            "deepgram_status": status_info,
            "connection_test": "success" if connection_test else "failed",
            "api_key_env_set": "DEEPGRAM_API_KEY" in os.environ,
            "api_key_value": f"{os.getenv('DEEPGRAM_API_KEY')[:10]}..." if os.getenv('DEEPGRAM_API_KEY') else None
        }
        
    except Exception as e:
        return {"error": str(e)}


@router.get("/debug/analyzer")
async def debug_analyzer():
    """Debug analyzer status"""
    try:
        return {
            "analyzer_initialized": symptom_analyzer.is_initialized(),
            "vector_stores_loaded": {
                "symptom": symptom_analyzer.symptom_vector_store is not None,
                "medical": symptom_analyzer.medical_vector_store is not None
            },
            "llm_initialized": symptom_analyzer.llm is not None,
            "qa_chain_initialized": symptom_analyzer.qa_chain is not None
        }
    except Exception as e:
        return {"error": str(e)}