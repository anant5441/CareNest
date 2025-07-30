from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import re
import spacy
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq
from fuzzywuzzy import fuzz
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Option 1: Using transformers for medical NER (Backup)
try:
    from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

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

router = APIRouter()

# Configuration
DB_FAISS_PATH = os.path.join(os.path.dirname(__file__), "..", "vectorstore", "medical_db_faiss")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Load NLP models
try:
    nlp = spacy.load("en_core_sci_sm")
    USE_SCISPACY = True
except Exception as e:
    print(f"Could not load en_core_sci_sm: {e}")
    USE_SCISPACY = False

try:
    nlp_general = spacy.load("en_core_web_sm")
    USE_GENERAL_NLP = True
except Exception as e:
    print(f"Could not load en_core_web_sm: {e}")
    USE_GENERAL_NLP = False

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


# Load Groq LLM with LLaMA 4
def load_llm():
    """Load Groq LLM with LLaMA model"""
    return ChatGroq(
        model_name="meta-llama/llama-4-scout-17b-16e-instruct",
        api_key=GROQ_API_KEY,
        temperature=0.3,
    )


def set_custom_prompt():
    """Set custom prompt template for medical queries"""
    template = """
    Use the context below to answer the user's medical question.
    Only answer based on the context provided. If you don't know the answer based on the context, just say that you don't know.
    Don't try to make up an answer. Only provide information found directly in the context.

    Context: {context}

    Question: {question}

    Start the answer directly. No small talk.
    """
    return PromptTemplate(template=template, input_variables=["context", "question"])


# Medical term extraction functions
def extract_medical_terms_spacy(text):
    """Extract medical terms using spaCy models"""
    medical_terms = []

    # Try scientific spaCy model first
    if USE_SCISPACY:
        try:
            doc = nlp(text)
            medical_terms.extend([ent.text for ent in doc.ents])
        except Exception as e:
            print(f"Error with sci spaCy: {e}")

    # Fallback to general spaCy model
    if USE_GENERAL_NLP and not medical_terms:
        try:
            doc = nlp_general(text)
            medical_terms.extend([ent.text for ent in doc.ents])
        except Exception as e:
            print(f"Error with general spaCy: {e}")

    return list(set(medical_terms))


def extract_medical_terms_transformers(text):
    """Extract medical terms using transformers NER model"""
    if not USE_TRANSFORMERS_NER:
        return []

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
    """Main function to extract medical terms using all available methods"""
    medical_terms = []

    # Try spaCy first (most accurate for medical terms)
    spacy_terms = extract_medical_terms_spacy(text)
    medical_terms.extend(spacy_terms)

    # Add transformers terms as backup
    transformer_terms = extract_medical_terms_transformers(text)
    medical_terms.extend(transformer_terms)

    # Add regex terms if nothing found
    if not medical_terms:
        regex_terms = extract_medical_terms_regex(text)
        medical_terms.extend(regex_terms)

    # Remove duplicates and filter short terms
    return list(set([term for term in medical_terms if len(term) > 2]))


# Greeting checker
def is_greeting(text):
    """Check if text is a greeting"""
    greetings = [
        "hi", "hello", "hey", "hii", "hio",
        "good morning", "good evening", "namaste", "salaam"
    ]
    text = text.lower().strip()

    # Exact match or very close match
    for greet in greetings:
        if text == greet:
            return True
        if fuzz.ratio(text, greet) >= 90:
            return True

    return False


# Initialize vector store and QA chain
try:
    embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    db = FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)

    qa_chain = RetrievalQA.from_chain_type(
        llm=load_llm(),
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

    query_text = request.query.strip()

    # Handle greetings
    if is_greeting(query_text):
        return QueryResponse(
            result="Hi there! I'm your medical assistant. Ask me anything about your health, symptoms, or treatment.",
            medical_terms=[],
            context_valid=False,
            sources=[]
        )

    try:
        # Process query
        response = qa_chain.invoke({'query': query_text})

        # Extract medical terms
        medical_terms = extract_medical_terms(query_text)

        # Context similarity check using cosine similarity
        query_embedding = embedding_model.embed_query(query_text)
        similarities = [
            cosine_similarity([query_embedding], [embedding_model.embed_query(doc.page_content)])[0][0]
            for doc in response["source_documents"]
        ]
        context_valid = any(sim > 0.50 for sim in similarities)

        # Additional validation: check if medical terms are in context
        if not context_valid and medical_terms:
            joined_context = " ".join([doc.page_content.lower() for doc in response['source_documents']])
            context_valid = any(term.lower() in joined_context for term in medical_terms)

        # Prepare sources
        sources = [
            {
                "content": doc.page_content[:300] + ("..." if len(doc.page_content) > 300 else ""),
                "page": doc.metadata.get("page", "?"),
                "similarity": similarities[i] if i < len(similarities) else 0.0
            }
            for i, doc in enumerate(response["source_documents"])
        ] if context_valid else []

        return QueryResponse(
            result=response['result'] if context_valid else "Sorry, I couldn't find any relevant information.",
            medical_terms=medical_terms,
            context_valid=context_valid,
            sources=sources
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-terms")
async def test_medical_extraction(request: QueryRequest):
    """Test endpoint to see what medical terms are extracted from text"""
    try:
        spacy_terms = extract_medical_terms_spacy(request.query)
        transformer_terms = extract_medical_terms_transformers(request.query)
        regex_terms = extract_medical_terms_regex(request.query)
        combined_terms = extract_medical_terms(request.query)

        return {
            "query": request.query,
            "spacy_terms": spacy_terms,
            "transformer_terms": transformer_terms,
            "regex_terms": regex_terms,
            "combined_terms": combined_terms
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_status():
    """Get the status of various components"""
    return {
        "scispacy_loaded": USE_SCISPACY,
        "general_nlp_loaded": USE_GENERAL_NLP,
        "transformers_ner": USE_TRANSFORMERS_NER,
        "qa_chain_initialized": QA_CHAIN_INITIALIZED,
        "db_path": DB_FAISS_PATH,
        "groq_api_configured": GROQ_API_KEY is not None,
        "llm_model": "meta-llama/llama-4-scout-17b-16e-instruct"
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "medical_query_router"}