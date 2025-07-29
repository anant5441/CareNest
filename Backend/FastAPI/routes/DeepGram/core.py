import os
import requests
from dotenv import load_dotenv
from fastapi import HTTPException, APIRouter, UploadFile, File

load_dotenv()
DeepGramRouter = APIRouter()


@DeepGramRouter.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)) -> str:
    api_key = os.getenv("DEEPGRAM_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="DEEPGRAM_API_KEY not found")

    url = "https://api.deepgram.com/v1/listen"
    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": "audio/*"
    }

    audio_data = await file.read()
    response = requests.post(url, headers=headers, data=audio_data)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Deepgram API failed")

    result = response.json()
    transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]

    return transcript