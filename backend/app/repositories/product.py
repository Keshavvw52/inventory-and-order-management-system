from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

class ProductRepository:
    def get_by_id(self, db: Session, product_id: int) -> Product | None:
        return db.get(Product, product_id)

    def get_by_sku(self, db: Session, sku: str) -> Product | None:
        statement = select(Product).where(Product.sku == sku.strip().upper())
        return db.execute(statement).scalar_one_or_none()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> list[Product]:
        statement = select(Product).order_by(Product.name).offset(skip).limit(limit)
        return list(db.execute(statement).scalars().all())

    def get_by_ids_for_update(self, db: Session, product_ids: list[int]) -> list[Product]:
        statement = (
            select(Product)
            .where(Product.id.in_(product_ids))
            .order_by(Product.id)
            .with_for_update()
        )
        return list(db.execute(statement).scalars().all())

    def create(self, db: Session, *, obj_in: ProductCreate) -> Product:
        db_obj = Product(
            name=obj_in.name,
            sku=obj_in.sku,
            price=obj_in.price,
            stock_quantity=obj_in.stock_quantity
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Product, obj_in: ProductUpdate) -> Product:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, product_id: int) -> Product | None:
        db_obj = db.get(Product, product_id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj

product_repository = ProductRepository()
