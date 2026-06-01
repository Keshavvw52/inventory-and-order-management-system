from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import ensure_order_status_schema
from app.api.v1.router import router as api_v1_router

app = FastAPI(
    title=settings.APP_NAME,
    description="A production-ready system for managing products, customers, orders, and inventory.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def sync_database_schema() -> None:
    ensure_order_status_schema()

# Include API routers
app.include_router(api_v1_router)


@app.get("/", tags=["Root"])
def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
