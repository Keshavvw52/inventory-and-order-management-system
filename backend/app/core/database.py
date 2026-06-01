from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

engine = create_engine(settings.database_url, echo=settings.DEBUG)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def get_db():
    """FastAPI dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_order_status_schema() -> None:
    """Backfill the order status column for older databases."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        if not inspector.has_table("orders"):
            return

        order_columns = {column["name"] for column in inspector.get_columns("orders")}
        check_constraints = {constraint["name"] for constraint in inspector.get_check_constraints("orders")}

        if "status" not in order_columns:
            connection.execute(text("ALTER TABLE orders ADD COLUMN status VARCHAR(20)"))
            connection.execute(text("UPDATE orders SET status = 'delivered' WHERE status IS NULL"))
            connection.execute(text("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'placed'"))
            connection.execute(text("ALTER TABLE orders ALTER COLUMN status SET NOT NULL"))

        if "ck_orders_status" not in check_constraints:
            connection.execute(
                text(
                    "ALTER TABLE orders ADD CONSTRAINT ck_orders_status "
                    "CHECK (status IN ('placed', 'processing', 'shipped', 'delivered'))"
                )
            )
