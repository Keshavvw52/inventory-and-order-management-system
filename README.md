# Inventory & Order Management System

A full-stack web app for managing products, customers, and orders — with automatic stock tracking built in. Built with FastAPI on the backend and React on the frontend, backed by PostgreSQL.

![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## What it does

- **Products** — add, edit, delete products with SKU and stock quantity
- **Customers** — manage customer records with email and contact info
- **Orders** — place multi-item orders; stock is automatically reduced on creation and restored on cancellation
- **Dashboard** — quick view of total orders, customers, products, and low-stock alerts

---

## Stack

**Backend:** FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, PostgreSQL  
**Frontend:** React 19, Vite, TanStack Query, React Hook Form + Zod, Axios  
**Infra:** Docker, Docker Compose, Nginx

---

## Running locally

### With Docker (easiest)

```bash
docker-compose up --build
```

That's it. This starts PostgreSQL, runs migrations, and serves both the API and frontend.

| | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

---

### Without Docker

**Requirements:** Python 3.11+, Node.js 18+, PostgreSQL 15+

#### Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file (use `.env.example` as a starting point):

```env
APP_NAME="Inventory & Order Management System"
DEBUG=True
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=inventory_db
POSTGRES_ADMIN_DB=postgres
CORS_ORIGINS=http://localhost:5173,http://localhost:5175,http://localhost:3000
```

Create the database, run migrations, then start the server:

```bash
python -m app.db.setup_db
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

```bash
npm run dev
```

Frontend runs at http://localhost:5173

---

## Project structure

```
├── backend/
│   ├── app/
│   │   ├── api/v1/        # Route handlers
│   │   ├── core/          # Config and DB session
│   │   ├── models/        # SQLAlchemy models
│   │   ├── repositories/  # DB query layer
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   └── alembic/           # Migrations
├── frontend/
│   └── src/
│       ├── services/      # API client + data services
│       ├── components/    # Reusable UI components
│       └── pages/         # Page views
├── docker-compose.yml
└── render.yaml            # Render deployment config
```

---

## Deploying to Render

The repo includes a `render.yaml` blueprint. To deploy:

1. Push to GitHub
2. Go to [Render](https://dashboard.render.com) → New → Blueprint
3. Connect the repo — Render will provision the backend service and a managed PostgreSQL database automatically

After deploy, set `CORS_ORIGINS` in the Render dashboard to your frontend URL.

For the frontend, deploy via [Vercel](https://vercel.com) by pointing it at the `frontend/` directory and setting `VITE_API_BASE_URL` to your Render backend URL.

---

## API

Interactive docs are at `/docs` once the server is running. Quick reference:

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | Health check |
| GET/POST | `/api/v1/products` | List / create products |
| GET/PUT/DELETE | `/api/v1/products/{id}` | Get, update, delete a product |
| GET/POST | `/api/v1/customers` | List / create customers |
| GET/PUT/DELETE | `/api/v1/customers/{id}` | Get, update, delete a customer |
| GET/POST | `/api/v1/orders` | List / place orders |
| GET/DELETE | `/api/v1/orders/{id}` | Get, cancel an order |
| GET | `/api/v1/dashboard/stats` | Dashboard KPIs |

---

## License

MIT
