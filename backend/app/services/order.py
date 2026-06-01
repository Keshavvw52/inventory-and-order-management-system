from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from decimal import Decimal

from app.repositories.order import order_repository
from app.repositories.product import product_repository
from app.repositories.customer import customer_repository
from app.schemas.order import OrderCreate, OrderStatusUpdate
from app.models.order import Order

class OrderService:
    def create_order(self, db: Session, *, obj_in: OrderCreate) -> Order:
        customer = customer_repository.get_by_id(db, obj_in.customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {obj_in.customer_id} not found."
            )

        requested_quantities: dict[int, int] = {}
        for item in obj_in.items:
            requested_quantities[item.product_id] = requested_quantities.get(item.product_id, 0) + item.quantity

        product_ids = sorted(requested_quantities.keys())

        try:
            locked_products = product_repository.get_by_ids_for_update(db, product_ids)
            products_by_id = {product.id: product for product in locked_products}

            missing_product_ids = [product_id for product_id in product_ids if product_id not in products_by_id]
            if missing_product_ids:
                missing_product_id = missing_product_ids[0]
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {missing_product_id} not found."
                )

            insufficient_stock_errors = []
            total_amount = Decimal("0.00")

            for product_id, requested_quantity in requested_quantities.items():
                product = products_by_id[product_id]
                if product.stock_quantity < requested_quantity:
                    insufficient_stock_errors.append(
                        f"Product '{product.name}' (SKU: {product.sku}) has insufficient stock. "
                        f"Available: {product.stock_quantity}, Requested: {requested_quantity}."
                    )

            if insufficient_stock_errors:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"message": "Insufficient stock for some products.", "errors": insufficient_stock_errors}
                )

            order = order_repository.create(
                db,
                customer_id=obj_in.customer_id,
                total_amount=total_amount,
                status="placed",
            )

            for item in obj_in.items:
                product = products_by_id[item.product_id]
                total_amount += Decimal(str(item.quantity)) * product.price
                order_repository.create_item(
                    db,
                    order_id=order.id,
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=product.price
                )
                product.stock_quantity -= item.quantity

            order.total_amount = total_amount
            db.commit()

            return order_repository.get_by_id(db, order.id)

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to place order due to server error: {str(e)}"
            )

    def get_order_by_id(self, db: Session, order_id: int) -> Order:
        order = order_repository.get_by_id(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found."
            )
        return order

    def get_all_orders(self, db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
        return order_repository.get_all(db, skip=skip, limit=limit)

    def update_order_status(self, db: Session, order_id: int, obj_in: OrderStatusUpdate) -> Order:
        self.get_order_by_id(db, order_id)

        try:
            order_repository.update_status(db, order_id=order_id, status=obj_in.status)
            db.commit()
            return order_repository.get_by_id(db, order_id)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update order status: {str(e)}"
            )

    def delete_order(self, db: Session, order_id: int) -> Order:
        order = self.get_order_by_id(db, order_id)

        try:
            for item in order.items:
                product = product_repository.get_by_id(db, item.product_id)
                if product:
                    product.stock_quantity += item.quantity

            order_repository.delete(db, order_id)
            db.commit()
            return order

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete/cancel order: {str(e)}"
            )

order_service = OrderService()
