from fastapi import APIRouter
from app.api.v1 import products

router = APIRouter(prefix="/api/v1")

router.include_router(products.router)

@router.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

