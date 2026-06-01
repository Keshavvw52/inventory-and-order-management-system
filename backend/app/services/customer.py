from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional

from app.repositories.customer import customer_repository
from app.schemas.customer import CustomerCreate
from app.models.customer import Customer

class CustomerService:
    def create_customer(self, db: Session, *, obj_in: CustomerCreate) -> Customer:
        # Check email uniqueness
        existing_customer = customer_repository.get_by_email(db, obj_in.email)
        if existing_customer:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Customer with email '{obj_in.email}' already exists."
            )
        return customer_repository.create(db, obj_in=obj_in)

    def get_customer_by_id(self, db: Session, customer_id: int) -> Customer:
        customer = customer_repository.get_by_id(db, customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {customer_id} not found."
            )
        return customer

    def get_all_customers(self, db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
        return customer_repository.get_all(db, skip=skip, limit=limit)

    def delete_customer(self, db: Session, customer_id: int) -> Customer:
        # Verify customer exists
        db_obj = self.get_customer_by_id(db, customer_id)
        return customer_repository.delete(db, customer_id=customer_id)

customer_service = CustomerService()
