import re
from pydantic import BaseModel, Field, field_validator
from datetime import datetime

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name of the customer")
    email: str = Field(..., description="Unique email address of the customer")
    phone: str | None = Field(None, max_length=50, description="Phone number of the customer")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not EMAIL_REGEX.match(cleaned):
            raise ValueError("Invalid email address format")
        return cleaned

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Full name cannot be empty or just whitespace")
        return cleaned

class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    email: str | None = Field(None, description="Unique email address of the customer")
    phone: str | None = Field(None, max_length=50, description="Phone number of the customer")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str | None) -> str | None:
        if v is None:
            return v

        cleaned = v.strip().lower()
        if not EMAIL_REGEX.match(cleaned):
            raise ValueError("Invalid email address format")
        return cleaned

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str | None) -> str | None:
        if v is None:
            return v

        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Full name cannot be empty or just whitespace")
        return cleaned

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
