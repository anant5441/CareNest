from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import google.generativeai as genai
import os
import logging

load_dotenv()

PDF_DIR = "data"
FAISS_DIR = "faiss_db"
GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
COSINE_THRESHOLD = 0.5

logging.getLogger().setLevel(logging.ERROR)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_pdf(path):
    loader = DirectoryLoader(
        path,
        glob='*.pdf',
        loader_cls=PyPDFLoader
    )
    return loader.load()

def create_chunks(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=100,
    )
    return splitter.split_documents(documents)

def get_embedding_model():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def create_vector_store(chunks, embedding_model, persist_directory=FAISS_DIR):
    store = FAISS.from_documents(documents=chunks, embedding=embedding_model)
    store.save_local(persist_directory)
    return store

def get_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("Missing GROQ_API_KEY in .env")
    return ChatGroq(
        temperature=0.3,
        groq_api_key=api_key,
        model_name=GROQ_MODEL,
        max_tokens=1024
    )

def cosine_threshold_retriever(vector_store, query, embedding_model, threshold=0.5, top_k=10):
    embedded_query = embedding_model.embed_query(query)
    docs_scores = vector_store.similarity_search_with_score_by_vector(embedded_query, k=top_k)
    return [doc for doc, score in docs_scores if score >= threshold]

def is_poor_answer(ans):
    return not ans or len(ans) < 30 or ans.lower() in ["i don't know", "no relevant information found", "n/a"]

def prepare_instruction(query):
    return (
        "You are a compassionate and knowledgeable assistant specializing in neonatal and pediatric growth and development.\n"
        "Your goal is to provide clear, empathetic, and practical guidance to parents or caregivers.\n\n"
        "For every user question, your response must include:\n"
        "1. ✅ Normal growth milestones for the child's age\n"
        "2. 🧠 Expected developmental milestones (motor, cognitive, speech)\n"
        "3. 🧸 Suggested exercises or activities that promote healthy growth\n"
        "4. 👩‍👧 Real-world examples and practical tips for caregivers\n"
        "5. ⚠️ Indicators for when medical consultation may be necessary\n\n"
        "Format the response clearly using emojis and bullet points. Keep the tone warm, supportive, and easy to understand for caregivers.\n"
        "Avoid overly technical language and always aim to reassure and educate.\n\n"
        f"User Query: {query}"
    )

def run_milestone_pipeline(query):
    if not query:
        return {"error": "Empty query."}

    embedding_model = get_embedding_model()

    if os.path.exists(f"{FAISS_DIR}/index.faiss"):
        vector_store = FAISS.load_local(FAISS_DIR, embeddings=embedding_model, allow_dangerous_deserialization=True)
    else:
        documents = load_pdf(PDF_DIR)
        chunks = create_chunks(documents)
        vector_store = create_vector_store(chunks, embedding_model)

    instruction = prepare_instruction(query)
    llm = get_llm()

    retriever = MultiQueryRetriever.from_llm(
        retriever=vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 3}),
        llm=llm,
    )

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
        return_source_documents=True
    )

    result = qa_chain.invoke({"query": instruction})
    answer = result["result"].strip()

    if is_poor_answer(answer):
        try:
            gemini_key = os.getenv("GEMINI_API_KEY")
            if not gemini_key:
                raise ValueError("Missing GEMINI_API_KEY in .env")

            genai.configure(api_key=gemini_key)

            gemini_prompt = (
                "You are a trusted neonatal and pediatric growth assistant.\n"
                "Your role is to provide accurate, developmentally appropriate, and reassuring responses to caregivers' questions.\n\n"
                "For every query, structure your answer to include:\n"
                "✅ Normal growth milestones for the baby’s age\n"
                "🧠 Expected developmental skills (motor, cognitive, communication, etc.)\n"
                "🧸 Practical exercises, play routines, or daily activities to promote development\n"
                "💡 Real-world tips or relatable examples to guide caregivers\n"
                "⚠️ Red flags or situations where pediatric consultation is recommended\n\n"
                "Maintain a clear, supportive, and empathetic tone.\n"
                "Use friendly formatting with emojis like ✅, ⚠️, 🧸, 💡 to make the information easy to digest in a baby care mobile app.\n\n"
                f"User Query: {query}"
            )

            model = genai.GenerativeModel("gemini-2.0-flash")
            gemini_response = model.generate_content(gemini_prompt)
            answer = gemini_response.text.strip()
            return {"answer": answer, "model": "Gemini"}
        except Exception as e:
            return {"error": str(e)}
    else:
        return {
            "answer": answer,
            "model": "Groq",
            "sources": [
                {"source": doc.metadata.get("source", "unknown"), "content": doc.page_content[:200]}
                for doc in result["source_documents"]
            ]
        }
