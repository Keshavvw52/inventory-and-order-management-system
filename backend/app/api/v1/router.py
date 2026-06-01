from fastapi import APIRouter

router = APIRouter(prefix="/api/v1")


@router.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
