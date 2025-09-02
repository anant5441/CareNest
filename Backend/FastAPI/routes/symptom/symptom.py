import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
from .symptomCore import SymptomAnalyzer

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
    warnings: Optional[List[str]] = None


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
    method_used: Optional[str] = None  # "rag" or "direct_llm"


class RAGQueryRequest(BaseModel):
    query: str
    max_results: Optional[int] = 3


class RAGQueryResponse(BaseModel):
    answer: str
    source_documents: List[Dict[str, Any]]
    success: bool
    method_used: Optional[str] = None  # "rag" or "direct_llm"


@router.get("/health-check", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint with detailed status"""
    try:
        status_info = symptom_analyzer.get_status_info()
        errors = symptom_analyzer.get_initialization_errors()

        if symptom_analyzer.is_initialized():
            warnings = []
            if not symptom_analyzer.is_rag_available():
                warnings.append("RAG functionality not available - vector stores not loaded")
            if not symptom_analyzer.deepgram_api_key:
                warnings.append("Deepgram API key not configured - audio transcription not available")

            return HealthCheckResponse(
                status="healthy",
                message="Medical analysis service is running with Groq LLM",
                warnings=warnings if warnings else None
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "message": "Service is partially initialized",
                    "errors": errors,
                    "status": status_info
                }
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
        if not symptom_analyzer.is_initialized():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service not properly initialized"
            )

        if not symptom_analyzer.deepgram_api_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Audio transcription not available - Deepgram API key not configured"
            )

        logger.info("Starting audio-to-analysis pipeline")

        analysis_result = await symptom_analyzer.analyze_voice_input(
            audio_base64=request.audio_data,
            age_group=request.patient_age_group
        )

        # Check if analysis failed
        if "error" in analysis_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=analysis_result["error"]
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

    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Audio-to-analysis pipeline failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audio-to-analysis pipeline failed: {str(e)}"
        )


@router.post("/rag-query", response_model=RAGQueryResponse)
async def rag_query(request: RAGQueryRequest):
    """Query the medical knowledge base using RAG (with fallback to direct LLM)"""
    try:
        if not symptom_analyzer.is_initialized():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service not properly initialized"
            )

        logger.info(f"Processing RAG query: {request.query}")

        answer, source_docs = await symptom_analyzer.query_knowledge_base(
            request.query,
            request.max_results
        )

        # Determine which method was used
        method_used = "rag" if symptom_analyzer.is_rag_available() else "direct_llm"

        return RAGQueryResponse(
            answer=answer,
            source_documents=source_docs,
            success=True,
            method_used=method_used
        )

    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"RAG query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query processing failed: {str(e)}"
        )


@router.post("/query", response_model=QueryResponse)
async def general_query(request: QueryRequest):
    """General medical question handler"""
    try:
        if not symptom_analyzer.is_initialized():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service not properly initialized"
            )

        logger.info(f"Processing general query: {request.query}")

        if request.use_rag and symptom_analyzer.is_rag_available():
            answer, source_docs = await symptom_analyzer.query_knowledge_base(
                request.query,
                max_results=3
            )
            return QueryResponse(
                answer=answer,
                source_documents=source_docs,
                success=True,
                method_used="rag"
            )
        else:
            # Use direct LLM query
            if request.use_rag and not symptom_analyzer.is_rag_available():
                logger.warning("RAG requested but not available, falling back to direct LLM")

            answer = await symptom_analyzer.direct_llm_query(request.query)
            return QueryResponse(
                answer=answer,
                source_documents=None,
                success=True,
                method_used="direct_llm"
            )

    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query processing failed: {str(e)}"
        )


@router.get("/status")
async def get_status():
    """Returns detailed config + environment status"""
    status_info = symptom_analyzer.get_status_info()
    errors = symptom_analyzer.get_initialization_errors()

    return {
        "llm_provider": "Groq",
        "llm_model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "embedding_model": "all-MiniLM-L6-v2",
        "service_status": {
            "initialized": status_info["initialized"],
            "rag_available": status_info["rag_available"],
            "components": status_info["components"],
            "initialization_errors": errors
        },
        "environment": {
            "groq_api_configured": os.getenv("GROQ_API_KEY") is not None,
            "deepgram_configured": os.getenv("DEEPGRAM_API_KEY") is not None,
        },
        "vector_stores": {
            "symptom_db_path": "vectorstore/symptom_db_faiss",
            "medical_db_path": "vectorstore/medical_db_faiss",
            "symptom_db_exists": os.path.exists("vectorstore/symptom_db_faiss/index.faiss"),
            "medical_db_exists": os.path.exists("vectorstore/medical_db_faiss/index.faiss")
        }
    }


@router.get("/debug/deepgram")
async def debug_deepgram():
    """Debug Deepgram integration"""
    try:
        if not symptom_analyzer.is_initialized():
            return {"error": "Symptom analyzer not initialized"}

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
    """Debug analyzer status with detailed information"""
    try:
        status_info = symptom_analyzer.get_status_info()
        errors = symptom_analyzer.get_initialization_errors()

        return {
            "analyzer_status": status_info,
            "initialization_errors": errors,
            "vector_store_paths": {
                "symptom_db": "vectorstore/symptom_db_faiss",
                "medical_db": "vectorstore/medical_db_faiss",
                "symptom_exists": os.path.exists("vectorstore/symptom_db_faiss/index.faiss"),
                "medical_exists": os.path.exists("vectorstore/medical_db_faiss/index.faiss")
            },
            "environment_vars": {
                "GROQ_API_KEY": "set" if os.getenv("GROQ_API_KEY") else "not set",
                "DEEPGRAM_API_KEY": "set" if os.getenv("DEEPGRAM_API_KEY") else "not set"
            }
        }
    except Exception as e:
        return {"error": str(e)}