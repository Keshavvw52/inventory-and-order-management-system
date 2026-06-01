from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import List

from app.repositories.product import product_repository
from app.schemas.product import ProductCreate, ProductUpdate
from app.models.product import Product

class ProductService:
    def create_product(self, db: Session, *, obj_in: ProductCreate) -> Product:
        # Check SKU uniqueness
        existing_product = product_repository.get_by_sku(db, obj_in.sku)
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{obj_in.sku}' already exists."
            )
        return product_repository.create(db, obj_in=obj_in)

    def get_product_by_id(self, db: Session, product_id: int) -> Product:
        product = product_repository.get_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found."
            )
        return product

    def get_all_products(self, db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
        return product_repository.get_all(db, skip=skip, limit=limit)

    def update_product(self, db: Session, product_id: int, *, obj_in: ProductUpdate) -> Product:
        db_obj = self.get_product_by_id(db, product_id)
        
        # If SKU is updated, check if new SKU is already taken
        if obj_in.sku and obj_in.sku != db_obj.sku:
            existing_product = product_repository.get_by_sku(db, obj_in.sku)
            if existing_product:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Product with SKU '{obj_in.sku}' already exists."
                )
                
        return product_repository.update(db, db_obj=db_obj, obj_in=obj_in)

    def delete_product(self, db: Session, product_id: int) -> Product:
        self.get_product_by_id(db, product_id)
        try:
            return product_repository.delete(db, product_id=product_id)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Product cannot be deleted because one or more orders reference it."
            )

product_service = ProductService()
