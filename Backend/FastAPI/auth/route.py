from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from FastAPI.auth.mod.Config import collection
from FastAPI.auth.mod.JWTToken import create_access_token
from FastAPI.auth.mod.models import (
    User, UserCreate, Token, UserResponse, TokenData, MealCreate, Meal, DayMeal, MealComposition
)
from FastAPI.auth.mod.oauth import bcrypt, verify_password, get_current_user

# Create router for authentication
auth_router = APIRouter()

@auth_router.get("/")
async def index():
    return {"message": "Welcome to auth"}


# Authentication endpoints
@auth_router.post('/register', response_model=dict)
def create_user(request: UserCreate):
    """Create a new user account"""
    # Check if user already exists
    existing_user = collection.find_one({"username": request.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered"
        )

    existing_email = collection.find_one({"email": request.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Hash password and create user
    hashed_password = bcrypt(request.password)

    # Create user object with proper structure
    user_data = {
        "username": request.username,
        "email": request.email,
        "mobile": request.mobile,
        "pass_hash": hashed_password,
        "meals": [],
        "have_baby": False,
        "baby": None
    }

    # Validate with Pydantic model
    user = User(**user_data)

    # Insert into database
    user_dict = user.model_dump()
    result = collection.insert_one(user_dict)

    if result.inserted_id:
        return {"message": "User created successfully", "user_id": str(result.inserted_id)}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

@auth_router.post('/register', response_model=dict)
def create_user(request: UserCreate):
    """Create a new user account"""
    # Check if user already exists
    existing_user = collection.find_one({"username": request.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered"
        )

    existing_email = collection.find_one({"email": request.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Hash password and create user
    hashed_password = bcrypt(request.password)

    # Create user object with proper structure
    user_data = {
        "username": request.username,
        "email": request.email,
        "mobile": request.mobile,
        "pass_hash": hashed_password,
        "meals": [],
        "have_baby": False,
        "baby": None
    }

    # Validate with Pydantic model
    user = User(**user_data)

    # Insert into database
    user_dict = user.model_dump()
    result = collection.insert_one(user_dict)

    if result.inserted_id:
        return {"message": "User created successfully", "user_id": str(result.inserted_id)}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


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

def _get_composition(meal_name: str):
    comp = MealComposition(
        carbs=0.6,
        proteins=0.2,
        fats=0.2,
    )
    return comp



def _add_meal_to_date_helper(
        meal: MealCreate,
        date: str,
        current_user: TokenData,
        collection
) -> dict:
    new_meal = Meal(
        time=meal.time,
        meal_type=meal.meal_type,
        composition=_get_composition(meal.meal_name),
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

    return None
