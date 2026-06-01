from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate

class CustomerRepository:
    def get_by_id(self, db: Session, customer_id: int) -> Optional[Customer]:
        return db.get(Customer, customer_id)

    def get_by_email(self, db: Session, email: str) -> Optional[Customer]:
        statement = select(Customer).where(Customer.email == email.strip().lower())
        return db.execute(statement).scalar_one_or_none()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
        statement = select(Customer).order_by(Customer.full_name).offset(skip).limit(limit)
        return list(db.execute(statement).scalars().all())

    def create(self, db: Session, *, obj_in: CustomerCreate) -> Customer:
        db_obj = Customer(
            full_name=obj_in.full_name,
            email=obj_in.email,
            phone=obj_in.phone
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Customer, obj_in: CustomerUpdate) -> Customer:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, customer_id: int) -> Optional[Customer]:
        db_obj = db.get(Customer, customer_id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj

customer_repository = CustomerRepository()
