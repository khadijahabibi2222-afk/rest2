# 🍽️ Restaurant POS — v2.0
**سیستم مدیریت رستورانت | Node.js + Express + MongoDB + Socket.io**

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io (LAN broadcast) |
| Auth | JWT + bcrypt (role-based) |
| Frontend | Single-file HTML/CSS/JS (same UI as v1) |

---

## Prerequisites (پیش‌نیازها)

1. **Node.js** v18 or higher → https://nodejs.org
2. **MongoDB Community Server** (local) → https://www.mongodb.com/try/download/community
   - Install and start the `mongod` service. On Windows it runs as a service automatically after install.
   - Default connection: `mongodb://127.0.0.1:27017` — no password needed for local LAN use.

---

## Quick Start (راه‌اندازی سریع)

```bash
# 1. Copy the project folder to your server machine, then:
cd restaurant-pos

# 2. Install dependencies
npm install

# 3. Create your .env file (copy the example and edit if needed)
cp .env.example .env

# 4. Seed the database with initial data (run once only)
npm run seed

# 5. Start the server
npm start
```

The server starts on **http://0.0.0.0:4000**

**Default login:** username `admin` / password `1234`

---

## Accessing from Other Devices on the LAN

All devices (waiter tablets, kitchen screen, cashier PC) connect to the **server computer's IP** in any browser:

```
http://<server-computer-ip>:4000
```

To find the server IP:
- **Windows:** run `ipconfig` in Command Prompt → look for IPv4 Address
- **Linux/Mac:** run `ip a` or `ifconfig`

Example: `http://192.168.1.100:4000`

> No internet required. Everything runs on your local network.

---

## Roles & Access

| Role | نقش | Access |
|---|---|---|
| `manager` | مدیر | Everything — dashboard, orders, kitchen, cashier, menu, inventory, employees, expenses, reports, day-close, settings |
| `waiter` | گارسون | Orders + Kitchen |
| `chef` | آشپز | Kitchen only |
| `cashier` | خزانه‌دار | Cashier + Orders + Reports + Day-close |

---

## Real-time Events (Socket.io)

When any user takes an action, **every connected device refreshes automatically**:

| Event | Who triggers it | Who sees the update |
|---|---|---|
| `order:created` | Waiter submits order | Kitchen screen (plays a sound + shows new card) |
| `order:updated` | Chef changes status / cashier marks paid | Cashier, waiter orders list |
| `tables:changed` | Table added/deleted | Orders page table grid |
| `menu:changed` | Manager edits menu | Waiter order screen |
| `settings:changed` | Day open/close | All screens (day status badge) |
| `inventory:changed` | Stock updated | Inventory page |
| `users:changed` | Employee added/edited | Employees page |

> The Orders page uses **surgical DOM patching** during live updates — the cart is never interrupted when new order events arrive.

---

## Project Structure

```
restaurant-pos/
├── server.js                 # Entry point
├── .env.example              # Environment config template
├── package.json
├── config/
│   └── db.js                 # MongoDB connection
├── models/                   # Mongoose schemas
│   ├── User.js
│   ├── Category.js
│   ├── MenuItem.js
│   ├── Table.js
│   ├── Order.js              # Compound-indexed for scale
│   ├── InventoryItem.js
│   ├── InventoryCategory.js
│   ├── ExpenseItem.js
│   ├── Expense.js
│   ├── Attendance.js         # Unique index: userId + date
│   ├── Advance.js
│   ├── Deduction.js
│   ├── Settings.js           # Singleton
│   └── DayClosing.js
├── middleware/
│   ├── auth.js               # JWT verify + role guard
│   └── errorHandler.js
├── controllers/              # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── categoryController.js
│   ├── menuController.js
│   ├── tableController.js
│   ├── orderController.js    # Inventory auto-deduction on order
│   ├── inventoryController.js
│   ├── expenseController.js
│   ├── attendanceController.js  # + payroll aggregation
│   ├── settingsController.js    # Day open/close
│   └── reportController.js      # Server-side aggregation pipeline
├── routes/                   # Express routers
├── sockets/
│   └── index.js              # Socket.io init + broadcast helper
├── seed/
│   └── seed.js               # Initial data (run once: npm run seed)
└── public/
    └── index.html            # Complete frontend (same UI, fetch API instead of localStorage)
```

---

## API Endpoints

### Auth
```
POST   /api/auth/login          Login → returns JWT token
GET    /api/auth/me             Verify token, return current user
```

### Core
```
GET/POST/PUT/DELETE  /api/categories
GET/POST/PUT/DELETE  /api/menu
GET/POST/DELETE      /api/tables
GET/POST             /api/orders
PATCH                /api/orders/:id/status
PATCH                /api/orders/:id/cancel
PATCH                /api/orders/:id/pay
GET/POST/PUT/PATCH/DELETE  /api/inventory/items
GET/POST/DELETE      /api/inventory/categories
GET/POST/DELETE      /api/expenses
GET/POST/DELETE      /api/expenses/items
GET/POST             /api/attendance
GET/POST             /api/advances
GET/POST/DELETE      /api/deductions
GET                  /api/payroll/summary       ← Server-side aggregation
GET/PUT              /api/settings
POST                 /api/settings/close-day
POST                 /api/settings/open-day
GET                  /api/settings/closings
GET                  /api/reports/dashboard     ← Aggregated, never sends raw history
```

---

## Database Indexes (Performance)

Critical indexes that keep queries fast even with millions of records:

| Collection | Index | Purpose |
|---|---|---|
| Order | `{ date: 1 }` | Today's orders / daily reports |
| Order | `{ status: 1 }` | Kitchen active-order view |
| Order | `{ tableId: 1, status: 1 }` | Is this table occupied? |
| Order | `{ createdAt: -1 }` | Recent orders pagination |
| Attendance | `{ userId: 1, date: 1 }` unique | One record/employee/day |
| Advance | `{ userId: 1 }` | Employee advance history |
| Deduction | `{ userId: 1 }` | Employee deduction history |
| Expense | `{ date: 1 }` | Daily expense reports |
| MenuItem | `{ catId: 1, active: 1 }` | Category-filtered menu |

---

## Scalability Notes

- **Orders**: The list endpoint is always paginated (`?limit=50&page=N`). The client never downloads the full order history.
- **Reports/Dashboard**: All aggregations run as MongoDB pipelines on the server. The monthly sales chart, top-items ranking, and payroll summary are pre-computed — the client just renders the result.
- **Attendance**: `findOneAndUpdate` with `upsert: true` — safe to call multiple times for the same employee/day without creating duplicates.
- **Logo**: Stored as a base64 data URL in the Settings document. For very large deployments, move this to a file path.

---

## Running as a Background Service (Windows)

Install `pm2` globally and use it to keep the server running after you close the terminal:

```bash
npm install -g pm2
pm2 start server.js --name restaurant-pos
pm2 save
pm2 startup        # Auto-start on Windows boot
```

---

## Re-seed / Reset

```bash
# Drop the database (WARNING: deletes all data)
mongosh restaurant_pos --eval "db.dropDatabase()"

# Then re-seed
npm run seed
```
