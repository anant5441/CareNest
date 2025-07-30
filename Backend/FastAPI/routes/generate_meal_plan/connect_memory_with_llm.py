import os
from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq

load_dotenv()

# === Step 1: Setup Groq LLM ===
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("Missing GROQ_API_KEY in .env")

def load_llm():
    return ChatGroq(
        model_name="meta-llama/llama-4-scout-17b-16e-instruct",
        api_key=GROQ_API_KEY,
        temperature=0.3,
    )

# === Step 2: Load FAISS DB ===
# Get the current file's directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# Navigate to the project root and then to vectorstore
DB_FAISS_PATH = os.path.join(current_dir, "..", "..", "vectorstore", "meal_generator_db_faiss")

# Normalize the path to handle any path separator issues
DB_FAISS_PATH = os.path.normpath(DB_FAISS_PATH)

embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)

# === Step 3: LangChain Prompt Template (Context + Question only) ===
CUSTOM_PROMPT_TEMPLATE = """
You are a trusted nutrition advisor specializing in infant and child nutrition. Your goal is to provide accurate, safe, and guideline-compliant dietary recommendations for infants and toddlers, based strictly on official sources such as WHO, ICMR, and FSSAI guidelines.

Use ONLY the context provided below to generate your response. Do not make up any information. If the answer is not present in the context, respond with: "I'm sorry, I don't have that specific information in the official guidelines."

---
📘 CONTEXT:
{context}
---

👶 USER QUERY:
{question}

💡 YOUR RESPONSE (Follow these rules strictly):
- Always mention the appropriate age group if relevant.
- Suggest foods, preparation methods, or nutrients only if they are explicitly mentioned in the context.
- Highlight safety precautions if any.
- If applicable, cite the source like [WHO, 2021] or [ICMR, p.23].
- Keep the tone caring, professional, and concise.
"""

custom_prompt = PromptTemplate(
    template=CUSTOM_PROMPT_TEMPLATE,
    input_variables=["context", "question"]
)

# === Step 4: Setup QA Chain ===
qa_chain = RetrievalQA.from_chain_type(
    llm=load_llm(),
    chain_type="stuff",
    retriever=db.as_retriever(search_kwargs={'k': 3}),
    return_source_documents=True,
    chain_type_kwargs={"prompt": custom_prompt, "document_variable_name": "context"}
)

# === Step 5: Structured Input for Meal Plan Request ===
user_input = {
    "meal_duration": "1",
    "age": "8",
    "diet": "Vegetarian",
    "diet_notes": "ensure iron bioavailability with vitamin C",
    "allergies": "None",
    "nutrient_focus": "ViatminA",
    "foods_tolerated": "Sweet potato, oats",
    "medical_conditions": "None",
    "cultural_preference": "Indian"
}

# === Step 6: Convert to Structured Query ===
structured_query_template = PromptTemplate(
    input_variables=[
        "meal_duration", "age", "diet", "diet_notes", "allergies",
        "nutrient_focus", "foods_tolerated", "medical_conditions", "cultural_preference"
    ],
    template="""
Generate a {meal_duration}-day meal plan for a {age}-month-old infant with these characteristics:
- Diet type: {diet} ({diet_notes})
- Allergies/intolerances: {allergies}
- Key nutrient focus: {nutrient_focus}
- Current tolerated foods: {foods_tolerated}
- Medical considerations: {medical_conditions}
- Cultural preference: {cultural_preference}
"""
)

query = structured_query_template.format(**user_input)

