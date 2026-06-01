from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from typing import List, Optional
from decimal import Decimal

from app.models.order import Order, OrderItem

class OrderRepository:
    def get_by_id(self, db: Session, order_id: int) -> Optional[Order]:
        statement = (
            select(Order)
            .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
            .where(Order.id == order_id)
        )
        return db.execute(statement).unique().scalar_one_or_none()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
        statement = (
            select(Order)
            .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.execute(statement).scalars().unique().all())

    def create(self, db: Session, *, customer_id: int, total_amount: Decimal, status: str) -> Order:
        db_obj = Order(
            customer_id=customer_id,
            total_amount=total_amount,
            status=status,
        )
        db.add(db_obj)
        db.flush() # flush to generate ID without committing yet
        return db_obj

    def create_item(
        self, db: Session, *, order_id: int, product_id: int, quantity: int, unit_price: Decimal
    ) -> OrderItem:
        db_obj = OrderItem(
            order_id=order_id,
            product_id=product_id,
            quantity=quantity,
            unit_price=unit_price
        )
        db.add(db_obj)
        db.flush()
        return db_obj

    def delete(self, db: Session, order_id: int) -> Optional[Order]:
        db_obj = db.get(Order, order_id)
        if db_obj:
            db.delete(db_obj)
            db.flush()
        return db_obj

    def update_status(self, db: Session, *, order_id: int, status: str) -> Optional[Order]:
        db_obj = db.get(Order, order_id)
        if db_obj:
            db_obj.status = status
            db.flush()
        return db_obj

order_repository = OrderRepository()
