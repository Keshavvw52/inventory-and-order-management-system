from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order, validating inventory and reducing product stock."""
    return order_service.create_order(db, obj_in=order_in)

@router.get("/", response_model=List[OrderResponse])
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all orders in the system."""
    return order_service.get_all_orders(db, skip=skip, limit=limit)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed order information by ID, including nested order items."""
    return order_service.get_order_by_id(db, order_id)

@router.delete("/{order_id}", response_model=OrderResponse)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete (cancel) an order and restore product stock."""
    return order_service.delete_order(db, order_id)
