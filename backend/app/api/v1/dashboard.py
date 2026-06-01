from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.dashboard import DashboardStatsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Retrieve aggregate statistics for products, customers, orders, and low-stock items."""
    
    # 1. Total products count
    total_products = db.execute(select(func.count(Product.id))).scalar_one()
    
    # 2. Total customers count
    total_customers = db.execute(select(func.count(Customer.id))).scalar_one()
    
    # 3. Total orders count
    total_orders = db.execute(select(func.count(Order.id))).scalar_one()
    
    # 4. Low stock products (stock_quantity <= 10)
    statement = select(Product).where(Product.stock_quantity <= 10).order_by(Product.stock_quantity)
    low_stock_products = db.execute(statement).scalars().all()
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": list(low_stock_products)
    }
