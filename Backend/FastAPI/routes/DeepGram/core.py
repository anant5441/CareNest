import os
import requests
from dotenv import load_dotenv
from fastapi import HTTPException, APIRouter, UploadFile, File
import google.generativeai as genai
import json

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')
DeepGramRouter = APIRouter()

chat_features = {
    0: "General chat for all the med queries",
    1: "Find the nearby hospital",
    3: "Meal tracking and guidance based on prev diets",
    4: "Vaccine tracker for babies",
    5: "Meal generator for babies",
    6: "General Myth Busting for pregnancy",
    7: "Meal generator for women",
}


def detect_relevant_feature(transcript: str) -> int:
    try:
        prompt = f"""
        Analyze the following medical query transcript and determine which feature category it best fits into.

        Available features:
        "{chat_features}"

        Transcript: "{transcript}"

        Instructions:
        - If the query is about finding hospitals, emergency care, or location-based medical services, return 1
        - If the query is about tracking meals, diet history, or nutritional guidance, return 3
        - If the query is about baby vaccines, immunization schedules, or vaccine tracking, return 4
        - If the query is about baby food, feeding schedules, or meal planning for infants, return 5
        - If the query is asking about medical myths, false information, or fact-checking medical claims, return 6
        - For all other general medical questions, health concerns, symptoms, or medical advice, return 0

        Return ONLY the number (0, 1, 3, 4, 5, 6, or 7) as your response, nothing else.
        """

        response = model.generate_content(prompt)
        feature_idx = int(response.text.strip())

        # Validate that the returned index is valid
        if feature_idx not in chat_features:
            return 0  # Default to general chat if invalid

        return feature_idx

    except Exception as e:
        print(f"Error detecting feature: {e}")
        return 0  # Default to general chat on error


@DeepGramRouter.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)) -> dict:
    api_key = os.getenv("DEEPGRAM_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="DEEPGRAM_API_KEY not found")

    url = "https://api.deepgram.com/v1/listen"
    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": "audio/*"
    }

    try:
        audio_data = await file.read()
        response = requests.post(url, headers=headers, data=audio_data)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Deepgram API failed")

        result = response.json()
        transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]

        feature_idx = detect_relevant_feature(transcript)

        return {
            "transcript": transcript,
            "feature_idx": feature_idx,
            "feature_description": chat_features[feature_idx]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")