from pydantic import BaseModel, Field
from typing import List
from app.schemas.product import ProductResponse

class DashboardStatsResponse(BaseModel):
    total_products: int = Field(..., description="Total count of products")
    total_customers: int = Field(..., description="Total count of customers")
    total_orders: int = Field(..., description="Total count of orders placed")
    low_stock_products: List[ProductResponse] = Field(..., description="List of products with stock <= 10")
