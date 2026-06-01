import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

from app.core.config import settings

def setup_database():
    conn_params = {
        "dbname": settings.POSTGRES_ADMIN_DB,
        "user": settings.POSTGRES_USER,
        "password": settings.POSTGRES_PASSWORD,
        "host": settings.POSTGRES_HOST,
        "port": str(settings.POSTGRES_PORT),
    }

    target_database = settings.POSTGRES_DB

    print("Connecting to local PostgreSQL database...")
    try:
        conn = psycopg2.connect(**conn_params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s;", (target_database,))
        exists = cursor.fetchone()

        if not exists:
            print(f"Database '{target_database}' does not exist. Creating...")
            cursor.execute(f'CREATE DATABASE "{target_database}";')
            print(f"Database '{target_database}' created successfully.")
        else:
            print(f"Database '{target_database}' already exists.")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting or creating database: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    setup_database()
