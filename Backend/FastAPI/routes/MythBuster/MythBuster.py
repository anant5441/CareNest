import os
import uuid
from datetime import datetime

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette.responses import JSONResponse

# Init FastAPI
myth_router = APIRouter()

# Configure Gemini
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')


# Pydantic models for request/response validation
class MythRequest(BaseModel):
    user_input: str


class MythResponse(BaseModel):
    reply: str
    message_id: str


# Static myths with categories and more details
STATIC_MYTHS = [
    {
        "id": str(uuid.uuid4()),
        "question": "Pregnant women should eat for two.",
        "answer": "You don't need double the calories—just more nutrients. Most women only need about 300 extra calories per day during pregnancy.",
        "category": "nutrition",
        "source": "American College of Obstetricians and Gynecologists"
    },
    {
        "id": str(uuid.uuid4()),
        "question": "You can't exercise during pregnancy.",
        "answer": "Light to moderate exercise is usually healthy and encouraged, unless you have specific medical conditions. It can help reduce back pain and improve mood.",
        "category": "exercise",
        "source": "Mayo Clinic"
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Heartburn means baby has a lot of hair.",
        "answer": "There's no consistent scientific proof of this link. Heartburn is common because pregnancy hormones relax the valve between your stomach and esophagus.",
        "category": "symptoms",
        "source": "Journal of the American Medical Association"
    },
    {
        "id": str(uuid.uuid4()),
        "question": "You shouldn't fly while pregnant.",
        "answer": "Most airlines allow flying up to 36 weeks for single pregnancies. Just stay hydrated and move your legs regularly to prevent blood clots.",
        "category": "travel",
        "source": "American Pregnancy Association"
    },
    {
        "id": str(uuid.uuid4()),
        "question": "The shape of your belly predicts the baby's sex.",
        "answer": "There's no scientific basis for this. Belly shape depends on your muscle tone, uterus position, and baby's position.",
        "category": "gender",
        "source": "National Institutes of Health"
    }
]

# Create global chat session
chat_session = model.start_chat(history=[])

# Initialize chat with system message
initial_prompt = """You are a multilingual pregnancy myth buster. Understand the user's language and reply in the same language. 
Respond clearly, respectfully, and factually. Provide concise answers (1-2 paragraphs max) with emojis when appropriate. 
Always cite reputable sources when possible. Focus on debunking pregnancy myths and providing accurate medical information."""

# In-memory storage of visible chat for frontend display
chat_history_display = []


@myth_router.get("/", response_class=JSONResponse)
async def index():
    return {"message": "Pregnancy Myth Buster API", "status": "active"}


@myth_router.get("/myths", response_class=JSONResponse)
async def get_static_myths():
    """Get all static myths"""
    return {"myths": STATIC_MYTHS, "count": len(STATIC_MYTHS)}


@myth_router.get("/myths/{category}", response_class=JSONResponse)
async def get_myths_by_category(category: str):
    """Get myths by category"""
    filtered_myths = [myth for myth in STATIC_MYTHS if myth["category"] == category]
    return {"myths": filtered_myths, "category": category, "count": len(filtered_myths)}


@myth_router.post("/ask", response_model=MythResponse)
async def ask_myth(myth_request: MythRequest):
    user_input = myth_request.user_input.strip()

    if not user_input:
        raise HTTPException(status_code=400, detail="Empty input")

    # Add timestamp and unique ID for each message
    message_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()

    # Save user message first
    user_message = {
        "id": message_id,
        "text": user_input,
        "sender": "user",
        "timestamp": timestamp
    }
    chat_history_display.append(user_message)

    try:
        # For first message, include the initial prompt
        if len(chat_history_display) == 1:
            full_prompt = f"{initial_prompt}\n\nUser question: {user_input}"
            response = chat_session.send_message(full_prompt)
        else:
            response = chat_session.send_message(user_input)

        reply = response.text.strip()

        # Save bot response
        bot_message = {
            "id": str(uuid.uuid4()),
            "text": reply,
            "sender": "bot",
            "timestamp": datetime.now().isoformat()
        }
        chat_history_display.append(bot_message)

        return MythResponse(reply=reply, message_id=message_id)

    except Exception as e:
        # Log error and return friendly message
        error_message = {
            "id": str(uuid.uuid4()),
            "text": "Sorry, I'm having trouble answering that right now. Please try again later.",
            "sender": "bot",
            "timestamp": datetime.now().isoformat(),
            "is_error": True
        }
        chat_history_display.append(error_message)
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


@myth_router.get("/chat-history", response_class=JSONResponse)
async def get_chat_history():
    """Get the current chat history"""
    return {"history": chat_history_display, "count": len(chat_history_display)}


@myth_router.delete("/clear-chat", response_class=JSONResponse)
async def clear_chat():
    """Clear chat history and reset session"""
    global chat_history_display, chat_session
    chat_history_display = []
    # Reset chat session
    chat_session = model.start_chat(history=[])
    return {"status": "success", "message": "Chat history cleared"}


@myth_router.get("/health", response_class=JSONResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "chat_messages": len(chat_history_display)
    }