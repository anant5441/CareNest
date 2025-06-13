# backend/routes/medical_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import re
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Option 1: Using transformers for medical NER (Recommended)
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

router = APIRouter()

# Configuration
HUGGINGFACE_REPO_ID = "mistralai/Mistral-7B-Instruct-v0.3"
DB_FAISS_PATH = os.path.join(os.path.dirname(__file__), "..", "vectorstore", "medical_db_faiss")

# Initialize medical NER pipeline using transformers
try:
    medical_ner = pipeline(
        "ner",
        model="d4data/biomedical-ner-all",
        tokenizer="d4data/biomedical-ner-all",
        aggregation_strategy="simple"
    )
    USE_TRANSFORMERS_NER = True
except Exception as e:
    print(f"Could not load transformers NER model: {e}")
    USE_TRANSFORMERS_NER = False

# Medical terms regex patterns (fallback)
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

# Common medical terms list
COMMON_MEDICAL_TERMS = {
    'symptoms': ['fever', 'pain', 'headache', 'nausea', 'fatigue', 'cough', 'shortness of breath'],
    'conditions': ['diabetes', 'hypertension', 'asthma', 'pneumonia', 'bronchitis', 'infection'],
    'body_parts': ['heart', 'lung', 'liver', 'kidney', 'brain', 'stomach', 'chest', 'abdomen'],
    'medications': ['aspirin', 'ibuprofen', 'acetaminophen', 'antibiotic', 'insulin', 'steroid'],
    'procedures': ['surgery', 'biopsy', 'x-ray', 'CT scan', 'MRI', 'ultrasound', 'blood test']
}


# Define request/response models
class QueryRequest(BaseModel):
    query: str


class QueryResponse(BaseModel):
    result: str
    medical_terms: list[str]
    context_valid: bool
    sources: list[dict]


# Initialize components
def load_llm(huggingface_repo_id):
    return HuggingFaceEndpoint(
        repo_id=huggingface_repo_id,
        temperature=0.5,
        huggingfacehub_api_token="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",
        max_new_tokens=512,
    )


def set_custom_prompt():
    template = """
    Use the pieces of information provided in the context to answer user's question.
    If you don't know the answer, just say that you don't know. Don't try to make up an answer. 
    Only provide information found directly in the context.

    Context: {context}

    Question: {question}

    Start the answer directly. No small talk.
    """
    return PromptTemplate(template=template, input_variables=["context", "question"])


# Medical term extraction functions
def extract_medical_terms_transformers(text):
    """Extract medical terms using transformers NER model"""
    try:
        entities = medical_ner(text)
        medical_terms = []
        for entity in entities:
            # Filter for medical entities with high confidence
            if entity['score'] > 0.5:
                medical_terms.append(entity['word'])
        return list(set(medical_terms))  # Remove duplicates
    except Exception as e:
        print(f"Error in transformers NER: {e}")
        return []


def extract_medical_terms_regex(text):
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


def extract_medical_terms(text):
    """Main function to extract medical terms using available methods"""
    medical_terms = []

    # Try transformers first (most accurate)
    if USE_TRANSFORMERS_NER:
        terms = extract_medical_terms_transformers(text)
        medical_terms.extend(terms)

    # Fallback to regex method
    regex_terms = extract_medical_terms_regex(text)
    medical_terms.extend(regex_terms)

    # Remove duplicates and filter short terms
    return list(set([term for term in medical_terms if len(term) > 2]))


# Initialize vector store and QA chain
try:
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)

    qa_chain = RetrievalQA.from_chain_type(
        llm=load_llm(HUGGINGFACE_REPO_ID),
        chain_type="stuff",
        retriever=db.as_retriever(search_kwargs={'k': 3}),
        return_source_documents=True,
        chain_type_kwargs={'prompt': set_custom_prompt()},
    )
    QA_CHAIN_INITIALIZED = True
except Exception as e:
    print(f"Error initializing QA chain: {e}")
    QA_CHAIN_INITIALIZED = False


# Routes
@router.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Process medical query and return answer with extracted medical terms"""
    if not QA_CHAIN_INITIALIZED:
        raise HTTPException(status_code=500, detail="QA chain not initialized")

    try:
        # Process query
        response = qa_chain.invoke({'query': request.query})

        # Extract medical terms using alternative methods
        medical_terms = extract_medical_terms(request.query)

        # Validate context
        joined_context = " ".join([doc.page_content.lower() for doc in response['source_documents']])

        # Conditional Output
        if any(term.lower() in joined_context for term in medical_terms) or len(medical_terms) == 0:
            sources = [
                {
                    "content": doc.page_content[:300] + ("..." if len(doc.page_content) > 300 else ""),
                    "page": doc.metadata.get("page", "?")
                }
                for doc in response["source_documents"]
            ]
            return QueryResponse(
                result=response['result'],
                medical_terms=medical_terms,
                context_valid=True,
                sources=sources,
            )
        else:
            return QueryResponse(
                result="Sorry, I couldn't find any relevant information.",
                medical_terms=medical_terms,
                context_valid=False,
                sources=[],
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-terms")
async def test_medical_extraction(request: QueryRequest):
    """Test endpoint to see what medical terms are extracted from text"""
    try:
        terms = extract_medical_terms(request.query)
        return {"query": request.query, "medical_terms": terms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_status():
    """Get the status of various components"""
    return {
        "transformers_ner": USE_TRANSFORMERS_NER,
        "qa_chain_initialized": QA_CHAIN_INITIALIZED,
        "db_path": DB_FAISS_PATH
    }