"""Restrict customer deletes when orders exist

Revision ID: cf8f7f8b8d6b
Revises: 4933c58c15f9
Create Date: 2026-06-01 21:30:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "cf8f7f8b8d6b"
down_revision: Union[str, Sequence[str], None] = "4933c58c15f9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("orders_customer_id_fkey", "orders", type_="foreignkey")
    op.create_foreign_key(
        "orders_customer_id_fkey",
        "orders",
        "customers",
        ["customer_id"],
        ["id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    op.drop_constraint("orders_customer_id_fkey", "orders", type_="foreignkey")
    op.create_foreign_key(
        "orders_customer_id_fkey",
        "orders",
        "customers",
        ["customer_id"],
        ["id"],
        ondelete="CASCADE",
    )
