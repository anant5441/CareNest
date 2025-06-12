# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import spacy
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Step - 1 Load models and setup
nlp = spacy.load("en_core_sci_sm")
HUGGINGFACE_REPO_ID = "mistralai/Mistral-7B-Instruct-v0.3"
DB_FAISS_PATH = os.path.join(os.path.dirname(__file__), "vectorstore", "medical_db_faiss")

# Initialize components
def load_llm(huggingface_repo_id):
    return HuggingFaceEndpoint(
        repo_id=huggingface_repo_id,
        temperature=0.5,
        huggingfacehub_api_token="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",
        max_new_tokens=512,
    )

# Define request/response models
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    result: str
    medical_terms: list[str]
    context_valid: bool
    sources: list[dict]

# step -2: connect llm with faiss and create  chain 

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

# Step -3 Load vector store
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db = FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)

# Step - 4 Create QA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=load_llm(HUGGINGFACE_REPO_ID),
    chain_type="stuff",
    retriever=db.as_retriever(search_kwargs={'k': 3}),
    return_source_documents=True,
    chain_type_kwargs={'prompt': set_custom_prompt()},
)

# Step 5: User Query Input(a)

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    try:
        # Process query # Step 5: User Query Response(b)
        response = qa_chain.invoke({'query': request.query})
        
        # Step 6 Extract medical terms
        doc = nlp(request.query)
        medical_terms = []

        for ent in doc.ents:
            medical_terms.append(ent.text) 
        
        # Step 7 Validate context

        joined_context = " ".join([doc.page_content.lower() for doc in response['source_documents']])
        
        # Step 8 Conditional Output
        if any(term.lower() in joined_context for term in medical_terms):
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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
