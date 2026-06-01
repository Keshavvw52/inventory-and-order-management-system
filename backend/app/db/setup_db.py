import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def setup_database():
    # Use postgres system DB to create our application DB
    conn_params = {
        "dbname": "postgres",
        "user": "postgres",
        "password": "keshavvw52@star",
        "host": "localhost",
        "port": "5432"
    }
    
    print("Connecting to local PostgreSQL database...")
    try:
        conn = psycopg2.connect(**conn_params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'inventory_db';")
        exists = cursor.fetchone()
        
        if not exists:
            print("Database 'inventory_db' does not exist. Creating...")
            cursor.execute("CREATE DATABASE inventory_db;")
            print("Database 'inventory_db' created successfully.")
        else:
            print("Database 'inventory_db' already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting or creating database: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    setup_database()
