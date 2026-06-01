from fastapi import APIRouter
from app.api.v1 import products, customers, orders

router = APIRouter(prefix="/api/v1")

router.include_router(products.router)
router.include_router(customers.router)
router.include_router(orders.router)


@router.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


