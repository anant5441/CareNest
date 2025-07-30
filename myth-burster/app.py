from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from starlette.responses import JSONResponse
from datetime import datetime
import uuid

# Init FastAPI
app = FastAPI(title="Pregnancy Myth Buster", description="AI-powered myth debunking for expecting mothers")

# Static + Templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key="AIzaSyDoY-kzir5ZuSQ4nVzlulXcBaeNLYDq05E")
model = genai.GenerativeModel("gemini-1.5-flash")

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
chat_session = model.start_chat(history=[
    {
        "role": "user",
        "parts": ["You are a multilingual pregnancy myth buster. Understand the user's language and reply in the same language. Respond clearly, respectfully, and factually. Provide concise answers (1-2 paragraphs max) with emojis when appropriate. Always cite reputable sources when possible."]
    }
])

# In-memory storage of visible chat for frontend display
chat_history_display = []

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "static_myths": STATIC_MYTHS,
        "chat_history": chat_history_display
    })

@app.post("/ask")
async def ask_myth(request: Request):
    data = await request.json()
    user_input = data.get("user_input", "").strip()

    if not user_input:
        return JSONResponse(content={"error": "Empty input"}, status_code=400)

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
        # Ask Gemini with memory of previous exchanges
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

        return {"reply": reply, "message_id": message_id}
    
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
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )

@app.get("/clear-chat", response_class=JSONResponse)
async def clear_chat():
    global chat_history_display
    chat_history_display = []
    return {"status": "success", "message": "Chat history cleared"}