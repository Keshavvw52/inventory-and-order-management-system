from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from decimal import Decimal

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Name of the product")
    sku: str = Field(..., min_length=1, max_length=100, description="Unique stock keeping unit code")
    price: Decimal = Field(..., ge=0, decimal_places=2, description="Price of the product")
    stock_quantity: int = Field(..., ge=0, description="Quantity of product in stock")

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: str) -> str:
        # Clean sku: strip spaces and convert to uppercase for consistency
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("SKU cannot be empty or just whitespace")
        return cleaned

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Name cannot be empty or just whitespace")
        return cleaned

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    sku: str | None = Field(None, min_length=1, max_length=100)
    price: Decimal | None = Field(None, ge=0, decimal_places=2)
    stock_quantity: int | None = Field(None, ge=0)

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: str | None) -> str | None:
        if v is not None:
            cleaned = v.strip().upper()
            if not cleaned:
                raise ValueError("SKU cannot be empty or just whitespace")
            return cleaned
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is not None:
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Name cannot be empty or just whitespace")
            return cleaned
        return v

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
