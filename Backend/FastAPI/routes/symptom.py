from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
import os
import re
import logging
import tempfile
from typing import List, Optional
from langchain_huggingface import HuggingFaceEndpoint, HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain.retrievers.multi_query import MultiQueryRetriever
from fuzzywuzzy import fuzz
from dotenv import load_dotenv
import whisper
import torch
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configuration
HUGGINGFACE_REPO_ID = "mistralai/Mistral-7B-Instruct-v0.3"
SYMPTOM_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "vectorstore", "symptom_db_faiss")
SUPPORTED_AUDIO_FORMATS = {'.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac'}
MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25MB

# Medical patterns for symptom extraction
MEDICAL_PATTERNS = [
    r'\b\w*itis\b',  # inflammation terms
    r'\b\w*osis\b',  # condition terms
    r'\b\w*emia\b',  # blood condition terms
    r'\b\w*pathy\b',  # disease terms
    r'\b\w*algia\b',  # pain terms
    r'\b\w*ectomy\b',  # surgical removal
    r'\b\w*scopy\b',  # examination terms
    r'\b\w*gram\b',  # imaging terms
    r'\b\w*therapy\b',  # treatment terms
    r'\b(?:mg|ml|cc|mcg|IU|units?)\b',  # dosage units
]

COMMON_MEDICAL_TERMS = {
    'symptoms': ['fever', 'pain', 'headache', 'nausea', 'fatigue', 'cough', 'shortness of breath',
                 'dizziness', 'vomiting', 'diarrhea', 'constipation', 'rash', 'swelling', 'bleeding',
                 'lethargy', 'poor feeding', 'cold skin', 'breathing difficulty', 'seizure'],
    'conditions': ['diabetes', 'hypertension', 'asthma', 'pneumonia', 'bronchitis', 'infection',
                   'allergy', 'migraine', 'arthritis', 'depression', 'anxiety', 'hypothermia',
                   'dehydration', 'sepsis', 'hypoglycemia'],
    'body_parts': ['heart', 'lung', 'liver', 'kidney', 'brain', 'stomach', 'chest', 'abdomen',
                   'head', 'neck', 'back', 'arm', 'leg', 'hand', 'foot', 'eyes', 'ears', 'throat'],
    'medications': ['aspirin', 'ibuprofen', 'acetaminophen', 'antibiotic', 'insulin', 'steroid',
                    'paracetamol', 'amoxicillin', 'prednisolone', 'tetracycline'],
    'procedures': ['surgery', 'biopsy', 'x-ray', 'CT scan', 'MRI', 'ultrasound', 'blood test',
                   'ECG', 'endoscopy', 'colonoscopy']
}

# Age group specific prompts
AGE_GROUP_PROMPTS = {
    "newborn": """
    You are an intelligent clinical assistant assessing a newborn (0-28 days) based on a caregiver's description. 
    This age group is EXTREMELY vulnerable — treat any concerning symptom with the highest caution.
    For newborns, ALWAYS prioritize danger signs: poor feeding, lethargy, cold skin, abnormal breathing, 
    no urination for >6 hours, abnormal temperature, or unusual sleepiness.
    """,

    "infant": """
    You are an intelligent clinical assistant assessing an infant (1-12 months) based on a caregiver's description.
    Infants are highly vulnerable. Pay special attention to feeding patterns, developmental milestones, 
    temperature regulation, and signs of dehydration or infection.
    """,

    "child": """
    You are an intelligent clinical assistant assessing a child (1-12 years) based on a caregiver's description.
    Children can communicate some symptoms but may not express pain or discomfort clearly. 
    Focus on behavioral changes, eating patterns, sleep disturbances, and play activity levels.
    """,

    "adult": """
    You are an intelligent clinical assistant assessing an adult patient based on their symptom description.
    Consider chronic conditions, medication interactions, occupational factors, and lifestyle influences.
    """,

    "elderly": """
    You are an intelligent clinical assistant assessing an elderly patient based on their symptom description.
    Consider multiple comorbidities, medication interactions, fall risks, cognitive factors, 
    and atypical presentation of common conditions in older adults.
    """
}

# Router - Fixed the prefix to match your main.py
router = APIRouter(prefix="/symptom", tags=["symptom-analysis"])


# Pydantic models
class TranscriptionRequest(BaseModel):
    model: Optional[str] = "base"
    language: Optional[str] = None


class TranscriptionResponse(BaseModel):
    transcript: str
    language: str
    confidence: float
    duration: float


class SymptomDetail(BaseModel):
    name: str
    duration: Optional[str] = "Not specified"
    severity: Optional[str] = "Not specified"
    frequency: Optional[str] = "Not specified"
    patterns: Optional[str] = "Not specified"


class MedicalAnalysisRequest(BaseModel):
    query: str
    patient_age_group: Optional[str] = "adult"
    urgency_threshold: Optional[str] = "medium"


class MedicalAnalysisResponse(BaseModel):
    symptom_details: List[SymptomDetail]
    medical_specialty: str
    urgency_level: str
    home_remedies: List[str]
    supportive_care: List[str]
    next_steps: str
    first_aid: List[str]
    possible_causes: List[str]
    patient_summary: str
    medical_terms: List[str]
    context_valid: bool


class SourceDocument(BaseModel):
    content: str
    page: str
    source: str
    relevance_score: Optional[float] = None


class RAGQueryRequest(BaseModel):
    query: str
    k: Optional[int] = 3
    temperature: Optional[float] = 0.5
    max_tokens: Optional[int] = 512


class RAGQueryResponse(BaseModel):
    answer: str
    source_documents: List[SourceDocument]
    confidence: float


class CombinedAnalysisResponse(BaseModel):
    transcript: str
    medical_analysis: MedicalAnalysisResponse
    rag_insights: Optional[RAGQueryResponse] = None


class HealthCheckResponse(BaseModel):
    status: str
    models: dict
    vector_store: dict
    timestamp: str


# Global variables for components
_embedding_model = None
_vector_store = None
_qa_chain = None
_whisper_model = None
_initialized = False


def load_whisper_model(model_size: str = "base"):
    """Load Whisper model for audio transcription"""
    global _whisper_model
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _whisper_model = whisper.load_model(model_size, device=device)
        logging.info(f"Whisper model '{model_size}' loaded on {device}")
        return _whisper_model
    except Exception as e:
        logging.error(f"Failed to load Whisper model: {e}")
        raise e


def load_llm():
    """Load HuggingFace LLM"""
    hf_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not hf_token:
        raise ValueError("HuggingFace token not found in environment variables")

    return HuggingFaceEndpoint(
        repo_id=HUGGINGFACE_REPO_ID,
        temperature=0.5,
        huggingfacehub_api_token=hf_token,
        max_new_tokens=512,
    )


def set_custom_prompt(age_group: str = "adult"):
    """Set custom prompt template based on age group"""
    age_specific_intro = AGE_GROUP_PROMPTS.get(age_group, AGE_GROUP_PROMPTS["adult"])

    template = f"""
    {age_specific_intro}

    Analyze the patient description and provide a detailed, structured response focused on symptom assessment.
    Use the pieces of information provided in the context to answer the user's question about symptoms.
    If you don't know the answer, just say that you don't know. Don't try to make up an answer.

    Your task is to extract and report the following information in a structured format:

    1. 🤒 Symptom Details:
        - For each symptom, list:
            - Symptom name (e.g., cough, fever, poor feeding)
            - Include: duration, severity, frequency, and patterns
            - Estimate approximate duration if temporal clues appear

    2. 🩺 Recommended Medical Specialty: 
        Suggest the most appropriate specialist based on symptoms and age group

    3. 🚨 Urgency Level:
        - Emergency (needs help now)
        - Urgent (within 24-48 hours)  
        - Non-urgent but important
        - Routine check-up
        - ⚠ For babies/newborns: If danger signs present (lethargy, poor feeding, low urine output, 
          cold to touch, abnormal breathing), label as *Emergency*

    4. 🏠 Recommended Home Remedies:
        Safe, evidence-based home care measures with safety notes
        Mention what to avoid during recovery

    5. 💊 Evidence-Based Supportive Care:
        - Include WHO/IMCI recommended treatments when appropriate
        - Note: "Only if applicable and under medical supervision"
        - For neonates: mention standard protocols (Kangaroo care, hydration, warmth)

    6. 💡 Advice & Next Steps:
        Clear, confident recommendation for immediate actions

    7. 🚑 First-Aid Recommendations:
        Emergency steps until medical help is available

    8. 🧬 Possible Causes of the Condition:
        List likely underlying causes using safe language ("may suggest", "could be")
        Base on standard conditions for the age group

    9. 💬 Friendly Summary to the Patient:
        Warm, supportive 1-2 line response directly to patient/caregiver

    Context: {{context}}
    Question: {{question}}

    Important:
    - Be medically cautious: avoid diagnosis, focus on triage
    - If any section has no info, write "Not specified"
    - Keep structured, clear, and avoid jargon
    - For critical symptoms in vulnerable age groups, emphasize urgency

    Start the answer directly. No small talk.
    """
    return PromptTemplate(template=template, input_variables=["context", "question"])


def extract_medical_terms(text):
    """Extract medical terms using regex patterns and keyword matching"""
    medical_terms = []
    text_lower = text.lower()

    # Check predefined medical terms
    for category, terms in COMMON_MEDICAL_TERMS.items():
        for term in terms:
            if term.lower() in text_lower:
                medical_terms.append(term)

    # Check regex patterns
    for pattern in MEDICAL_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        medical_terms.extend(matches)

    # Remove duplicates and return
    return list(set([term for term in medical_terms if len(term) > 2]))


def parse_structured_response(response_text: str) -> dict:
    """Parse the structured response from LLM into components"""
    try:
        sections = {
            'symptom_details': [],
            'medical_specialty': 'Not specified',
            'urgency_level': 'Not specified',
            'home_remedies': [],
            'supportive_care': [],
            'next_steps': 'Not specified',
            'first_aid': [],
            'possible_causes': [],
            'patient_summary': 'Not specified'
        }

        # Split response by emoji sections
        lines = response_text.split('\n')
        current_section = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Identify sections
            if '🤒 Symptom Details:' in line or '🤒 Symptom Analysis:' in line:
                current_section = 'symptom_details'
            elif '🩺 Recommended Medical Specialty:' in line:
                current_section = 'medical_specialty'
                content = line.split(':', 1)[1].strip() if ':' in line else 'Not specified'
                sections['medical_specialty'] = content
            elif '🚨 Urgency Level:' in line:
                current_section = 'urgency_level'
                content = line.split(':', 1)[1].strip() if ':' in line else 'Not specified'
                sections['urgency_level'] = content
            elif '🏠 Recommended Home Remedies:' in line or '🏠 Home Care Recommendations:' in line:
                current_section = 'home_remedies'
            elif '💊 Evidence-Based Supportive Care:' in line or '💊 Supportive Care Options:' in line:
                current_section = 'supportive_care'
            elif '💡 Advice & Next Steps:' in line or '💡 Next Steps & Advice:' in line:
                current_section = 'next_steps'
                content = line.split(':', 1)[1].strip() if ':' in line else 'Not specified'
                sections['next_steps'] = content
            elif '🚑 First-Aid Recommendations:' in line or '🚑 Emergency Signs to Watch:' in line:
                current_section = 'first_aid'
            elif '🧬 Possible Causes:' in line or '🧬 Possible Underlying Causes:' in line:
                current_section = 'possible_causes'
            elif '💬 Friendly Summary:' in line or '💬 Patient Summary:' in line:
                current_section = 'patient_summary'
                content = line.split(':', 1)[1].strip() if ':' in line else 'Not specified'
                sections['patient_summary'] = content
            else:
                # Add content to current section
                if current_section in ['home_remedies', 'supportive_care', 'first_aid', 'possible_causes']:
                    if line and not line.startswith('�'):
                        # Clean up bullet points and formatting
                        cleaned_line = re.sub(r'^[-•*]\s*', '', line)
                        if cleaned_line and cleaned_line != 'Not specified':
                            sections[current_section].append(cleaned_line)
                elif current_section == 'symptom_details':
                    # Parse symptom details - simplified parsing
                    if 'symptom' in line.lower() or any(
                            term in line.lower() for term in ['fever', 'pain', 'cough', 'nausea']):
                        sections['symptom_details'].append({
                            'name': line,
                            'duration': 'Not specified',
                            'severity': 'Not specified',
                            'frequency': 'Not specified',
                            'patterns': 'Not specified'
                        })

        return sections

    except Exception as e:
        logging.error(f"Error parsing structured response: {e}")
        return {
            'symptom_details': [],
            'medical_specialty': 'Not specified',
            'urgency_level': 'Not specified',
            'home_remedies': ['Unable to parse response'],
            'supportive_care': ['Unable to parse response'],
            'next_steps': 'Please consult a healthcare provider',
            'first_aid': ['Unable to parse response'],
            'possible_causes': ['Unable to parse response'],
            'patient_summary': 'Please seek professional medical advice'
        }


def initialize_components():
    """Initialize all components"""
    global _embedding_model, _vector_store, _qa_chain, _initialized

    if _initialized:
        return

    try:
        logging.info("Initializing medical analysis components...")

        # Setup embedding model
        _embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

        # Load existing vector store
        if not os.path.exists(f"{SYMPTOM_DB_PATH}/index.faiss"):
            raise FileNotFoundError(f"Vector store not found at {SYMPTOM_DB_PATH}")

        logging.info("Loading existing FAISS vector store...")
        _vector_store = FAISS.load_local(
            SYMPTOM_DB_PATH,
            _embedding_model,
            allow_dangerous_deserialization=True
        )

        # Load Whisper model
        load_whisper_model("base")

        _initialized = True
        logging.info("Medical analysis components initialized successfully!")

    except Exception as e:
        logging.error(f"Failed to initialize components: {e}")
        raise e


def get_components():
    """Get initialized components"""
    if not _initialized:
        initialize_components()
    return _embedding_model, _vector_store, _qa_chain


# Routes
@router.get("/")
async def symptom_root():
    """Root endpoint for symptom analysis router"""
    return {
        "message": "Symptom Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "POST /transcribe": "Convert audio to text",
            "POST /medical-analysis": "Analyze medical symptoms",
            "POST /rag-query": "Query medical knowledge base",
            "POST /audio-to-analysis": "Combined audio transcription and analysis",
            "GET /health": "Health check",
            "POST /query": "Legacy symptom query (deprecated)"
        },
        "status": "active"
    }


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
        audio_file: UploadFile = File(...),
        model: str = Form("base"),
        language: Optional[str] = Form(None)
):
    """Convert audio files to text using Whisper"""
    try:
        # Validate file
        if not audio_file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")

        file_extension = os.path.splitext(audio_file.filename)[1].lower()
        if file_extension not in SUPPORTED_AUDIO_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported audio format. Supported: {', '.join(SUPPORTED_AUDIO_FORMATS)}"
            )

        # Check file size
        content = await audio_file.read()
        file_size = len(content)

        if file_size > MAX_AUDIO_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_AUDIO_SIZE // (1024 * 1024)}MB"
            )

        # Load Whisper model if not already loaded or different model requested
        global _whisper_model
        if _whisper_model is None:
            _whisper_model = load_whisper_model(model)

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name

        try:
            # Transcribe audio
            result = _whisper_model.transcribe(temp_file_path, language=language)

            return TranscriptionResponse(
                transcript=result["text"].strip(),
                language=result.get("language", "unknown"),
                confidence=0.95,  # Whisper doesn't provide confidence scores
                duration=len(content) / (16000 * 2)  # Rough estimate
            )

        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except Exception as e:
        logging.error(f"Error in audio transcription: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/medical-analysis", response_model=MedicalAnalysisResponse)
async def analyze_medical_query(request: MedicalAnalysisRequest):
    """Analyze medical symptoms and provide structured clinical assessment"""
    try:
        _, vector_store, _ = get_components()

        # Setup QA chain with age-appropriate prompt
        llm = load_llm()
        retriever = MultiQueryRetriever.from_llm(
            retriever=vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 3}),
            llm=llm,
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=retriever,
            chain_type="stuff",
            return_source_documents=True,
            chain_type_kwargs={'prompt': set_custom_prompt(request.patient_age_group)},
        )

        # Process query
        response = qa_chain.invoke({'query': request.query})

        # Parse structured response
        parsed_response = parse_structured_response(response['result'])

        # Extract medical terms
        medical_terms = extract_medical_terms(request.query)

        # Validate context
        joined_context = " ".join([doc.page_content.lower() for doc in response['source_documents']])
        context_valid = any(term.lower() in joined_context for term in medical_terms) or len(medical_terms) == 0

        # Convert symptom details to proper format
        symptom_details = []
        for detail in parsed_response.get('symptom_details', []):
            if isinstance(detail, dict):
                symptom_details.append(SymptomDetail(**detail))
            else:
                symptom_details.append(SymptomDetail(name=str(detail)))

        return MedicalAnalysisResponse(
            symptom_details=symptom_details,
            medical_specialty=parsed_response.get('medical_specialty', 'Not specified'),
            urgency_level=parsed_response.get('urgency_level', 'Not specified'),
            home_remedies=parsed_response.get('home_remedies', []),
            supportive_care=parsed_response.get('supportive_care', []),
            next_steps=parsed_response.get('next_steps', 'Not specified'),
            first_aid=parsed_response.get('first_aid', []),
            possible_causes=parsed_response.get('possible_causes', []),
            patient_summary=parsed_response.get('patient_summary', 'Not specified'),
            medical_terms=medical_terms,
            context_valid=context_valid
        )

    except Exception as e:
        logging.error(f"Error in medical analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rag-query", response_model=RAGQueryResponse)
async def rag_medical_query(request: RAGQueryRequest):
    """Query medical knowledge base using RAG"""
    try:
        _, vector_store, _ = get_components()

        # Setup QA chain with custom parameters
        llm = load_llm()
        llm.temperature = request.temperature
        llm.max_new_tokens = request.max_tokens

        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": request.k}
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=retriever,
            chain_type="stuff",
            return_source_documents=True,
        )

        # Process query
        response = qa_chain.invoke({'query': request.query})

        # Format source documents
        source_docs = []
        for doc in response['source_documents']:
            source_docs.append(SourceDocument(
                content=doc.page_content[:300] + ("..." if len(doc.page_content) > 300 else ""),
                page=str(doc.metadata.get("page", "?")),
                source=doc.metadata.get("source", "Unknown"),
                relevance_score=0.85  # Placeholder - FAISS doesn't return scores directly
            ))

        return RAGQueryResponse(
            answer=response['result'],
            source_documents=source_docs,
            confidence=0.85  # Placeholder confidence
        )

    except Exception as e:
        logging.error(f"Error in RAG query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/audio-to-analysis", response_model=CombinedAnalysisResponse)
async def audio_to_analysis(
        audio_file: UploadFile = File(...),
        patient_age_group: str = Form("adult"),
        whisper_model: str = Form("base"),
        include_rag: bool = Form(False)
):
    """One-step audio transcription and medical analysis"""
    try:
        # Step 1: Transcribe audio
        transcription_response = await transcribe_audio(
            audio_file=audio_file,
            model=whisper_model,
            language=None
        )

        # Step 2: Medical analysis
        analysis_request = MedicalAnalysisRequest(
            query=transcription_response.transcript,
            patient_age_group=patient_age_group
        )
        analysis_response = await analyze_medical_query(analysis_request)

        # Step 3: Optional RAG insights
        rag_response = None
        if include_rag:
            rag_request = RAGQueryRequest(query=transcription_response.transcript)
            rag_response = await rag_medical_query(rag_request)

        return CombinedAnalysisResponse(
            transcript=transcription_response.transcript,
            medical_analysis=analysis_response,
            rag_insights=rag_response
        )

    except Exception as e:
        logging.error(f"Error in combined audio analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Check component initialization
        if not _initialized:
            initialize_components()

        models_status = {
            "whisper": "loaded" if _whisper_model is not None else "not_loaded",
            "embedding": "loaded" if _embedding_model is not None else "not_loaded",
            "vector_store": "loaded" if _vector_store is not None else "not_loaded"
        }

        vector_store_info = {
            "path": SYMPTOM_DB_PATH,
            "exists": os.path.exists(f"{SYMPTOM_DB_PATH}/index.faiss"),
            "documents_count": _vector_store.index.ntotal if _vector_store else 0
        }

        return HealthCheckResponse(
            status="healthy",
            models=models_status,
            vector_store=vector_store_info,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logging.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


# Legacy endpoints for backwards compatibility
@router.post("/query", response_model=dict)
async def legacy_symptom_query(request: dict):
    """Legacy endpoint for backwards compatibility"""
    try:
        analysis_request = MedicalAnalysisRequest(
            query=request.get("query", ""),
            patient_age_group="adult"
        )
        response = await analyze_medical_query(analysis_request)

        # Convert to legacy format
        return {
            "result": f"🤒 Symptom Analysis: {', '.join([s.name for s in response.symptom_details])}\n" +
                      f"🩺 Recommended Medical Specialty: {response.medical_specialty}\n" +
                      f"🚨 Urgency Level: {response.urgency_level}\n" +
                      f"🏠 Home Care Recommendations: {', '.join(response.home_remedies)}\n" +
                      f"💊 Supportive Care Options: {', '.join(response.supportive_care)}\n" +
                      f"💡 Next Steps & Advice: {response.next_steps}\n" +
                      f"🚑 Emergency Signs to Watch: {', '.join(response.first_aid)}\n" +
                      f"🧬 Possible Underlying Causes: {', '.join(response.possible_causes)}\n" +
                      f"💬 Patient Summary: {response.patient_summary}",
            "medical_terms": response.medical_terms,
            "context_valid": response.context_valid,
            "sources": []
        }
    except Exception as e:
        logging.error(f"Error in legacy endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))