"""Add order status lifecycle

Revision ID: 7d4f1b2c9e8a
Revises: cf8f7f8b8d6b
Create Date: 2026-06-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7d4f1b2c9e8a"
down_revision: Union[str, Sequence[str], None] = "cf8f7f8b8d6b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("status", sa.String(length=20), nullable=True))
    op.execute("UPDATE orders SET status = 'delivered' WHERE status IS NULL")
    op.alter_column(
        "orders",
        "status",
        existing_type=sa.String(length=20),
        nullable=False,
        server_default="placed",
    )
    op.create_check_constraint(
        "ck_orders_status",
        "orders",
        "status IN ('placed', 'processing', 'shipped', 'delivered')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_orders_status", "orders", type_="check")
    op.drop_column("orders", "status")
