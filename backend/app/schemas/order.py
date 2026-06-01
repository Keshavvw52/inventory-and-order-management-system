from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Literal

from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse

OrderStatusValue = Literal["placed", "processing", "shipped", "delivered"]

# Schemas for OrderItems

class OrderItemBase(BaseModel):
    product_id: int = Field(..., description="ID of the product being ordered")
    quantity: int = Field(..., gt=0, description="Quantity of the product ordered, must be greater than 0")

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    unit_price: Decimal = Field(..., description="Price of the product at order placement")
    product: ProductResponse | None = None

    class Config:
        from_attributes = True

# Schemas for Orders

class OrderCreate(BaseModel):
    customer_id: int = Field(..., description="ID of the customer placing the order")
    items: list[OrderItemCreate] = Field(..., min_length=1, description="List of items in the order")


class OrderStatusUpdate(BaseModel):
    status: OrderStatusValue = Field(..., description="New status for the order")

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    status: OrderStatusValue
    created_at: datetime
    items: list[OrderItemResponse]
    customer: CustomerResponse | None = None

    class Config:
        from_attributes = True
