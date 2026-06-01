# API Documentation

Base URL: `http://localhost:8000/api/v1` (local) or your Render URL in production.

All request and response bodies are JSON. Timestamps are in ISO 8601 format (UTC).
All monetary values are in Indian Rupees (INR).

---

## Health

### GET `/health`

Returns whether the service is running.

**Response `200`**
```json
{ "status": "healthy" }
```

---

## Products

### GET `/products`

Returns all products.

**Query params**

| Param | Type | Default | Description |
|---|---|---|---|
| `skip` | int | 0 | Offset for pagination |
| `limit` | int | 100 | Max records to return |

**Response `200`**
```json
[
  {
    "id": 1,
    "name": "Wireless Keyboard",
    "sku": "WK-001",
    "price": "49.99",
    "stock_quantity": 120,
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

---

### POST `/products`

Creates a new product. SKUs are automatically uppercased and deduplicated.

**Request body**
```json
{
  "name": "Wireless Keyboard",
  "sku": "wk-001",
  "price": 49.99,
  "stock_quantity": 120
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | 1–255 chars |
| `sku` | string | Yes | 1–100 chars, must be unique |
| `price` | decimal | Yes | ≥ 0 |
| `stock_quantity` | int | Yes | ≥ 0 |

**Response `201`** — the created product object

**Errors**
- `422` — validation failed (missing field, invalid type, etc.)
- `409` — SKU already exists

---

### GET `/products/{id}`

**Response `200`** — single product object  
**Response `404`** — product not found

---

### PUT `/products/{id}`

Partial update — only include the fields you want to change.

**Request body** (all fields optional)
```json
{
  "price": 44.99,
  "stock_quantity": 95
}
```

**Response `200`** — updated product object  
**Response `404`** — product not found

---

### DELETE `/products/{id}`

Deletes a product. Will fail if the product has existing orders.

**Response `200`** — the deleted product object  
**Response `404`** — product not found  
**Response `409`** — product is referenced by one or more orders

---

## Customers

### GET `/customers`

Returns all customers.

**Query params:** `skip`, `limit` (same as products)

**Response `200`**
```json
[
  {
    "id": 1,
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1-555-0100",
    "created_at": "2025-01-10T08:00:00Z"
  }
]
```

---

### POST `/customers`

**Request body**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0100"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `full_name` | string | Yes | 1–255 chars |
| `email` | string | Yes | Must be a valid email, stored lowercase, unique |
| `phone` | string | No | Max 50 chars |

**Response `201`** — created customer  
**Response `409`** — email already in use

---

### GET `/customers/{id}`

**Response `200`** — single customer object  
**Response `404`** — not found

---

### PUT `/customers/{id}`

Partial update.

**Request body** (all fields optional)
```json
{
  "phone": "+1-555-9999"
}
```

**Response `200`** — updated customer

---

### DELETE `/customers/{id}`

**Response `200`** — deleted customer  
**Response `404`** — not found  
**Response `409`** — customer has existing orders

---

## Orders

### GET `/orders`

Returns all orders with their line items.

**Query params:** `skip`, `limit`

**Response `200`**
```json
[
  {
    "id": 1,
    "customer_id": 3,
    "total_amount": "149.97",
    "status": "delivered",
    "created_at": "2025-01-20T14:22:00Z",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 2,
        "quantity": 3,
        "unit_price": "49.99"
      }
    ]
  }
]
```

---

### POST `/orders`

Places an order. Stock is checked and decremented atomically — if any item is out of stock, the entire order is rejected and nothing changes.

**Request body**
```json
{
  "customer_id": 3,
  "items": [
    { "product_id": 2, "quantity": 3 },
    { "product_id": 5, "quantity": 1 }
  ]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `customer_id` | int | Yes | Must be an existing customer |
| `items` | array | Yes | At least one item required |
| `items[].product_id` | int | Yes | Must be an existing product |
| `items[].quantity` | int | Yes | Must be ≥ 1 |

`total_amount` is calculated server-side using the product's price at order time and stored on the order item as `unit_price`.
`status` is one of `placed`, `processing`, `shipped`, or `delivered`.

**Response `201`** — created order with items  
**Response `400`** — insufficient stock for one or more items  
**Response `404`** — customer or product not found

---

### PATCH `/orders/{id}/status`

Updates an order's fulfillment status.

**Request body**
```json
{
  "status": "processing"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `status` | string | Yes | One of `placed`, `processing`, `shipped`, `delivered` |

**Response `200`** — updated order

---

### GET `/orders/{id}`

**Response `200`** — single order with items  
**Response `404`** — not found

---

### DELETE `/orders/{id}`

Cancels an order. Stock for all items in the order is automatically restored.

**Response `200`** — the cancelled order  
**Response `404`** — not found

---

## Dashboard

### GET `/dashboard/stats`

Returns aggregated stats for the dashboard view.

**Response `200`**
```json
{
  "total_products": 42,
  "total_customers": 18,
  "total_orders": 134,
  "low_stock_products": [
    {
      "id": 7,
      "name": "USB-C Cable",
      "sku": "USBC-001",
      "price": "12.99",
      "stock_quantity": 3,
      "created_at": "2025-01-05T09:00:00Z"
    }
  ]
}
```

`low_stock_products` contains any product with `stock_quantity <= 10`.

---

## Error format

All errors follow FastAPI's standard format:

```json
{
  "detail": "Product with SKU 'WK-001' already exists"
}
```

Validation errors (422) return a list:

```json
{
  "detail": [
    {
      "loc": ["body", "price"],
      "msg": "Input should be greater than or equal to 0",
      "type": "greater_than_equal"
    }
  ]
}
```

---

## Running the interactive docs

The Swagger UI is available at `/docs` when the server is running. It lets you test every endpoint directly from the browser without needing a separate HTTP client.
