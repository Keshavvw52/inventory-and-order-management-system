from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from decimal import Decimal

from app.repositories.order import order_repository
from app.repositories.product import product_repository
from app.repositories.customer import customer_repository
from app.schemas.order import OrderCreate
from app.models.order import Order

class OrderService:
    def create_order(self, db: Session, *, obj_in: OrderCreate) -> Order:
        # 1. Validate customer exists
        customer = customer_repository.get_by_id(db, obj_in.customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {obj_in.customer_id} not found."
            )

        # 2. Process items, validate products and stock
        insufficient_stock_errors = []
        validated_items = []
        total_amount = Decimal("0.00")

        for item in obj_in.items:
            product = product_repository.get_by_id(db, item.product_id)
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found."
                )

            # Check stock
            if product.stock_quantity < item.quantity:
                insufficient_stock_errors.append(
                    f"Product '{product.name}' (SKU: {product.sku}) has insufficient stock. "
                    f"Available: {product.stock_quantity}, Requested: {item.quantity}."
                )
            
            validated_items.append((product, item.quantity, product.price))
            total_amount += Decimal(str(item.quantity)) * product.price

        # 3. If any stock checks failed, raise 400 Bad Request
        if insufficient_stock_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Insufficient stock for some products.", "errors": insufficient_stock_errors}
            )

        try:
            # 4. Create the Order
            order = order_repository.create(db, customer_id=obj_in.customer_id, total_amount=total_amount)

            # 5. Create OrderItems and reduce inventory stock
            for product, quantity, price in validated_items:
                # Create OrderItem
                order_repository.create_item(
                    db,
                    order_id=order.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=price
                )
                # Deduct inventory stock
                product.stock_quantity -= quantity

            # 6. Commit the entire transaction
            db.commit()
            
            # Fetch the completed order with fully preloaded relations
            return order_repository.get_by_id(db, order.id)

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

    def delete_order(self, db: Session, order_id: int) -> Order:
        # Validate order exists (loading with items preloaded)
        order = self.get_order_by_id(db, order_id)
        
        try:
            # Restore inventory stock for each product
            for item in order.items:
                product = product_repository.get_by_id(db, item.product_id)
                if product:
                    product.stock_quantity += item.quantity

            # Delete order (cascade deletes items)
            order_repository.delete(db, order_id)
            return order

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete/cancel order: {str(e)}"
            )

order_service = OrderService()
