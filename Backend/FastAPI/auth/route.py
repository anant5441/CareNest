import os
import json
import os
import re
import uuid
from datetime import datetime
from typing import Dict, Any
from typing import Optional

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from auth.mod.Config import collection
from auth.mod.JWTToken import create_access_token
from auth.mod.models import (
    User, Token, UserResponse, TokenData, MealCreate, Meal, DayMeal, MealComposition, BabyCreate, UserCreateWithBaby,
    RecommendationResponse, ErrorResponse
)
from auth.mod.oauth import bcrypt, verify_password, get_current_user

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')


# Create router for authentication
auth_router = APIRouter()

@auth_router.get("/")
async def index():
    return {"message": "Welcome to auth"}


# Authentication endpoints
def check_user_exists(username: str, email: str) -> None:

    existing_user = collection.find_one({
        "$or": [
            {"username": username},
            {"email": email}
        ]
    })

    if existing_user:
        if existing_user.get("username") == username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )


def create_baby_profile(baby_name: str, baby_date_of_birth: str) -> Dict[str, Any]:
    return {
        "id": str(uuid.uuid4()),
        "name": baby_name,
        "date_of_birth": baby_date_of_birth,
        "vaccines": [],
        "milestones": []
    }


def create_user_data(request: UserCreateWithBaby, baby_profile: Optional[Dict] = None) -> Dict[str, Any]:
    """Create user data dictionary"""
    return {
        "username": request.username,
        "email": request.email,
        "mobile": request.mobile,
        "pass_hash": bcrypt(request.password),
        "meals": [],
        "have_baby": baby_profile is not None,
        "baby": baby_profile
    }


def insert_user_to_db(user_data: Dict[str, Any]) -> str:
    """Insert user to database and return user_id"""
    # Validate with Pydantic model
    user = User(**user_data)

    # Insert into database
    result = collection.insert_one(user.model_dump())

    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

    return str(result.inserted_id)


@auth_router.post('/register', response_model=dict)
def register_user(request: UserCreateWithBaby):
    """Unified user registration endpoint with optional baby profile"""

    # Check if user already exists
    check_user_exists(request.username, request.email)

    # Create baby profile if data provided
    baby_profile = None
    baby_id = None

    if request.has_baby_data():
        baby_profile = create_baby_profile(request.baby_name, request.baby_date_of_birth)
        baby_id = baby_profile["id"]

    # Create and insert user
    user_data = create_user_data(request, baby_profile)
    user_id = insert_user_to_db(user_data)

    # Build response
    response_data = {
        "message": "User created successfully",
        "user_id": user_id
    }

    if baby_profile:
        response_data.update({
            "baby_created": True,
            "baby_id": baby_id,
            "message": "User and baby profile created successfully"
        })

    return response_data
@auth_router.post('/login', response_model=Token)
def login(request: OAuth2PasswordRequestForm = Depends()):
    """Login user and return access token"""
    user = collection.find_one({"username": request.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(request.password, user["pass_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user["username"]})
    return Token(access_token=access_token, token_type="bearer")

@auth_router.get("/me", response_model=UserResponse)
def read_users_me(current_user: TokenData = Depends(get_current_user)):
    user = collection.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        username=user["username"],
        email=user["email"],
        mobile=user["mobile"],
        have_baby=user.get("have_baby", False),
        baby=user.get("baby")
    )


def _get_composition(meal_name: str) -> MealComposition:

    # Create a detailed prompt for consistent responses
    prompt = f"""
    Analyze the meal "{meal_name}" and provide the macronutrient composition as percentages that sum to 1.0.

    Consider typical ingredients and preparation methods for this meal.

    Respond with ONLY a JSON object in this exact format:
    {{
        "carbs": 0.XX,
        "proteins": 0.XX,
        "fats": 0.XX
    }}

    Where each value is a decimal between 0 and 1, and all three values sum to 1.0.

    Examples:
    - A pasta dish might be: {{"carbs": 0.6, "proteins": 0.2, "fats": 0.2}}
    - A steak dinner might be: {{"carbs": 0.1, "proteins": 0.6, "fats": 0.3}}
    - A salad might be: {{"carbs": 0.3, "proteins": 0.3, "fats": 0.4}}
    """

    try:
        # Generate response
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Extract JSON from response
        json_match = re.search(r'\{[^}]+}', response_text)
        if json_match:
            json_str = json_match.group()
            composition_data = json.loads(json_str)

            # Validate the data
            carbs = float(composition_data.get('carbs', 0))
            proteins = float(composition_data.get('proteins', 0))
            fats = float(composition_data.get('fats', 0))

            # Normalize to ensure they sum to 1.0
            total = carbs + proteins + fats
            if total > 0:
                carbs /= total
                proteins /= total
                fats /= total
            else:
                # Fallback values if something goes wrong
                carbs, proteins, fats = 0.4, 0.3, 0.3

            return MealComposition(
                carbs=round(carbs, 2),
                proteins=round(proteins, 2),
                fats=round(fats, 2)
            )
        else:
            raise ValueError("Could not extract JSON from response")

    except Exception as e:
        print(f"Error getting composition for {meal_name}: {e}")
        # Return reasonable default values
        return MealComposition(
            carbs=0.4,
            proteins=0.3,
            fats=0.3
        )



def _add_meal_to_date_helper(
        meal: MealCreate,
        date: str,
        current_user: TokenData,
        collection
) -> dict:
    new_meal = Meal(
        time=meal.time,
        meal_name=meal.name,
        meal_type=meal.meal_type,
        composition=_get_composition(meal.name),
    )

    result = collection.update_one(
        {"username": current_user.username, "meals.date": date},
        {"$push": {"meals.$.meals": new_meal.model_dump()}},
        upsert=False
    )

    if result.modified_count == 0:
        user_exists = collection.find_one(
            {"username": current_user.username},
            {"_id": 1}  # Only return _id for efficiency
        )
        if not user_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Create new day meal entry
        day_meal = DayMeal(date=date, meals=[new_meal])
        result = collection.update_one(
            {"username": current_user.username},
            {"$push": {"meals": day_meal.model_dump()}}
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add meal"
            )

    return {
        "message": "Meal added successfully",
        "date": date,
        "meal": new_meal.model_dump()
    }


@auth_router.post("/meals/add", response_model=dict)
def add_meal_to_today(
        meal: MealCreate,
        current_user: TokenData = Depends(get_current_user)
):
    """Add meal to today's date"""
    today = datetime.now().strftime('%Y-%m-%d')
    return _add_meal_to_date_helper(meal, today, current_user, collection)


@auth_router.post("/meals/add-custom", response_model=dict)
def add_meal_to_date(
        meal: MealCreate,
        date: str,
        current_user: TokenData = Depends(get_current_user)
):
    try:
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    return _add_meal_to_date_helper(meal, date, current_user, collection)

@auth_router.get("/meals", response_model=list[DayMeal])
def get_meal_plans(current_user: TokenData = Depends(get_current_user)):
    user = collection.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user.get("meals", [])

@auth_router.get("/meals/{date}", response_model=Optional[DayMeal])
def get_meal_plan_by_date(
        date: str,
        current_user: TokenData = Depends(get_current_user)
):
    """Get meal plan for a specific date"""
    user = collection.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    meals = user.get("meals", [])
    for meal_day in meals:
        if meal_day["date"] == date:
            return DayMeal(**meal_day)

    return []


@auth_router.get("/meal_avg", response_model=MealComposition)
def get_meal_composition_avg(current_user: TokenData = Depends(get_current_user)) -> MealComposition:
    default_fallback = MealComposition(carbs=0.5 , proteins=0.1 , fats=0.4)
    meals = get_meal_plans(current_user)

    if not meals:
        return default_fallback

    all_meals = []
    for day_meal in meals:
        daily_meals = day_meal.get("meals", [])
        for meal in daily_meals:
            composition = meal.get("composition", {})
            if composition:
                all_meals.append(composition)


    if not all_meals:
        return default_fallback

    # Take the last 7 meals (or fewer if less than 7 available)
    recent_meals = all_meals[-7:]

    total_carbs = 0.0
    total_proteins = 0.0
    total_fats = 0.0
    count = 0

    # Sum up compositions for the recent meals
    for composition in recent_meals:
        total_carbs += composition.get("carbs", 0.0)
        total_proteins += composition.get("proteins", 0.0)
        total_fats += composition.get("fats", 0.0)
        count += 1

    # Calculate averages
    if count == 0:
        return default_fallback

    avg_carbs = total_carbs / count
    avg_proteins = total_proteins / count
    avg_fats = total_fats / count

    # Ensure the averages sum to 1.0
    total_avg = avg_carbs + avg_proteins + avg_fats
    if total_avg > 0:
        avg_carbs = avg_carbs / total_avg
        avg_proteins = avg_proteins / total_avg
        avg_fats = avg_fats / total_avg
    else:
        # Fallback to default if all values are zero
        avg_carbs, avg_proteins, avg_fats = 0.5, 0.3, 0.2


    return MealComposition(
        carbs=round(avg_carbs, 3),
        proteins=round(avg_proteins, 3),
        fats=round(avg_fats, 3)
    )

# Baby management endpoints
@auth_router.post("/baby", response_model=dict)
def create_baby(
        baby_data: BabyCreate,
        current_user: TokenData = Depends(get_current_user)
):
    # Generate baby ID
    baby_id = str(uuid.uuid4())

    baby_profile = {
        "id": baby_id,
        "name": baby_data.name,
        "date_of_birth": baby_data.date_of_birth,
        "vaccines": [],
        "milestones": []
    }

    # Update user with baby information
    result = collection.update_one(
        {"username": current_user.username},
        {
            "$set": {
                "have_baby": True,
                "baby": baby_profile
            }
        }
    )

    if result.modified_count:
        return {"message": "Baby profile created successfully", "baby_id": baby_id}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create baby profile"
        )


@auth_router.get("/ai_meal_guide", response_model=RecommendationResponse,
         responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}})
async def get_recommendations(current_user: TokenData = Depends(get_current_user)):

    average_data = get_meal_composition_avg(current_user)

    # 3. Prepare prompt for RAG model
    prompt = f"""
    User's average nutrition intake:
    - Carbohydrates: {average_data.carbs}
    - Protein: {average_data.proteins}
    - Fats: {average_data.fats}

    Based on this data:
    1. Identify any significant deficiencies or imbalances
    2. Suggest specific foods to address these
    3. Provide meal recommendations
    4. Explain the benefits of these suggestions

    Return the response in valid JSON format with these exact keys:
    {{
        "analysis": "text analysis of deficiencies",
        "recommendations": {{
            "foods": ["list", "of", "specific", "foods"],
            "meals": ["specific", "meal", "suggestions"],
            "rationale": "explanation of why these help"
        }}
    }}
    Only return the JSON object, nothing else.
    """

    # 4. Query Gemini model
    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean the response
        if response_text.startswith('```json'):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith('```'):
            response_text = response_text[3:-3].strip()

        # Parse the JSON
        recommendations = json.loads(response_text)

        # Validate the response structure
        if not all(key in recommendations for key in ["analysis", "recommendations"]):
            raise ValueError("Invalid response format from model")

        if not all(key in recommendations["recommendations"] for key in ["foods", "meals", "rationale"]):
            raise ValueError("Invalid recommendations format")

        return {
            "status": "success",
            "analysis": recommendations["analysis"],
            "recommendations": recommendations["recommendations"]
        }

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "msg": "Failed to parse model response",
                "error": str(e),
                "raw_response": response_text if 'response_text' in locals() else None
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "msg": "Failed to generate recommendations",
                "error": str(e)
            }
        )


@auth_router.get("/analyze/{meal_name}", response_model=MealComposition)
def analyze_meal_composition(meal_name: str):
    """
    Analyze the macronutrient composition of a meal using Google Gemini AI.

    Returns the carbohydrate, protein, and fat ratios that sum to 1.0.
    """
    try:
        meal_name = meal_name.strip()

        if not meal_name or len(meal_name) > 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Meal name must be between 1 and 200 characters"
            )

        composition = _get_composition(meal_name)

        return composition

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error while analyzing meal composition: {str(e)}"
        )