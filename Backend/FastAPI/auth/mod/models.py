from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Self
from datetime import datetime


class Login(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Meal tracking models
class MealComposition(BaseModel):
    """Meal composition with percentages (carbs + proteins + fats should equal 1.0)"""
    carbs: float = Field(..., ge=0.0, le=1.0, description="Carbohydrate percentage")
    proteins: float = Field(..., ge=0.0, le=1.0, description="Protein percentage")
    fats: float = Field(..., ge=0.0, le=1.0, description="Fat percentage")

    @model_validator(mode='after')
    def validate_percentages_sum(self) -> Self:
        """Validate that percentages sum to 1.0"""
        total = self.carbs + self.proteins + self.fats

        if not (0.99 <= total <= 1.01):  # Allow for small floating point errors
            raise ValueError(f"Meal composition percentages must sum to 1.0, got {total}")
        return self


class Meal(BaseModel):
    """Individual meal with timing and composition"""
    time: str = Field(..., description="Time of meal (e.g., '08:00')")
    meal_type: str = Field(..., description="Type of meal (breakfast, lunch, dinner, etc.)")
    composition: MealComposition

    @field_validator('meal_type')
    @classmethod
    def validate_meal_type(cls, v):
        """Validate meal type is one of the expected values"""
        valid_types = ['breakfast', 'lunch', 'dinner', 'snack', 'brunch']
        if v.lower() not in valid_types:
            raise ValueError(f"Meal type must be one of {valid_types}, got '{v}'")
        return v.lower()


class DayMeal(BaseModel):
    """Collection of meals for a specific day"""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    meals: List[Meal] = Field(default_factory=list, description="List of meals for the day")

    @field_validator('date')
    @classmethod
    def validate_date_format(cls, v):
        """Validate date format"""
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")


# Baby tracking models
class Vaccine(BaseModel):
    """Vaccine record"""
    date: str = Field(..., description="Date of vaccination in YYYY-MM-DD format")
    name: str = Field(..., min_length=1, description="Name of the vaccine")
    venue: str = Field(..., min_length=1, description="Vaccination venue")

    @field_validator('date')
    @classmethod
    def validate_date_format(cls, v):
        """Validate date format"""
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")


class Milestone(BaseModel):
    """Developmental milestone tracking"""
    date: str = Field(..., description="Date of milestone in YYYY-MM-DD format")
    title: str = Field(..., min_length=1, description="Milestone title")
    description: str = Field(..., min_length=1, description="Milestone description")
    is_completed: bool = Field(default=False, description="Whether milestone is completed")

    @field_validator('date')
    @classmethod
    def validate_date_format(cls, v):
        """Validate date format"""
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")


class Baby(BaseModel):
    """Baby profile with tracking information"""
    id: str = Field(..., min_length=1, description="Unique baby identifier")
    name: str = Field(..., min_length=1, description="Baby's name")
    date_of_birth: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    vaccines: List[Vaccine] = Field(default_factory=list, description="List of vaccines")
    milestones: List[Milestone] = Field(default_factory=list, description="List of milestones")

    @field_validator('date_of_birth')
    @classmethod
    def validate_date_format(cls, v):
        """Validate date format"""
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

    @field_validator('date_of_birth')
    @classmethod
    def validate_birth_date_not_future(cls, v):
        """Validate birth date is not in the future"""
        birth_date = datetime.strptime(v, '%Y-%m-%d')
        if birth_date > datetime.now():
            raise ValueError("Birth date cannot be in the future")
        return v


# Complete User model with all features
class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: str = Field(..., description="Email address")
    mobile: str = Field(..., min_length=10, description="Mobile number")
    pass_hash: str = Field(..., min_length=1, description="Password hash")
    meals: List[DayMeal] = Field(default_factory=list, description="List of daily meals")
    have_baby: bool = Field(default=False, description="Whether user has a baby")
    baby: Optional[Baby] = Field(default=None, description="Baby information")

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        """Basic email validation"""
        if '@' not in v or '.' not in v:
            raise ValueError("Invalid email format")
        return v.lower()

    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        """Username validation"""
        if not v.replace('_', '').isalnum():
            raise ValueError("Username must contain only letters, numbers, and underscores")
        return v

    @model_validator(mode='after')
    def validate_baby_consistency(self) -> Self:
        """Ensure have_baby flag is consistent with baby field"""
        if self.have_baby and self.baby is None:
            raise ValueError("If have_baby is True, baby information must be provided")
        if not self.have_baby and self.baby is not None:
            raise ValueError("If have_baby is False, baby information should not be provided")

        return self


# Request/Response models for API endpoints
class UserCreate(BaseModel):
    """Model for creating a new user"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(...)
    mobile: str = Field(..., min_length=10)
    password: str = Field(..., min_length=8)

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if '@' not in v or '.' not in v:
            raise ValueError("Invalid email format")
        return v.lower()


class UserResponse(BaseModel):
    """Model for user response (without sensitive data)"""
    username: str
    email: str
    mobile: str
    have_baby: bool
    baby: Optional[Baby] = None


class MealCreate(BaseModel):
    """Model for creating a new meal"""
    time: str
    name: str
    meal_type: str


class DayMealCreate(BaseModel):
    """Model for creating a day's meals"""
    date: str
    meals: List[MealCreate]


class VaccineCreate(BaseModel):
    """Model for creating a vaccine record"""
    date: str
    name: str
    venue: str


class MilestoneCreate(BaseModel):
    """Model for creating a milestone"""
    date: str
    title: str
    description: str
    is_completed: bool = False


class BabyCreate(BaseModel):
    """Model for creating a baby profile"""
    name: str
    date_of_birth: str


class BabyUpdate(BaseModel):
    """Model for updating baby information"""
    name: Optional[str] = None
    vaccines: Optional[List[VaccineCreate]] = None
    milestones: Optional[List[MilestoneCreate]] = None


# Helper functions for creating meal compositions
def create_meal(carbs: float = 0.5, proteins: float = 0.3, fats: float = 0.2) -> MealComposition:
    """Create a balanced meal composition with default ratios"""
    return MealComposition(carbs=carbs, proteins=proteins, fats=fats)


