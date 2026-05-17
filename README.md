# HostelEase – Hostel Essentials Ordering System

A production-ready full-stack SaaS web application for hostel students to order daily essentials — snacks, stationery, toiletries, drinks, and more — delivered directly to their room.

---

## Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React 18 + Vite, Tailwind CSS, Framer Motion, Redux Toolkit, Recharts |
| Backend     | Node.js, Express.js, MongoDB + Mongoose |
| Auth        | JWT (access + refresh tokens), bcryptjs |
| Payments    | Razorpay + Cash on Delivery |
| Real-time   | Socket.IO |
| Storage     | Cloudinary (images) |
| Email       | Nodemailer |
| Container   | Docker + Nginx |

---

## Project Structure

```
hostelease/
├── backend/
│   ├── config/          # DB, Cloudinary, Socket.IO setup
│   ├── constants/        # App-wide enums and constants
│   ├── controllers/      # Thin HTTP handlers
│   ├── middlewares/      # Auth, error, validation
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── services/         # Business logic layer
│   ├── utils/            # asyncHandler, logger, email, JWT, seeder
│   ├── validations/      # express-validator chains
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── animations/   # Framer Motion variants
│       ├── components/   # Reusable UI components
│       ├── hooks/        # useDebounce, useAuth, useSocket, etc.
│       ├── layouts/      # Public, Student, Admin layouts
│       ├── pages/        # All route pages
│       ├── services/     # Axios instance, Socket client
│       ├── store/        # Redux store + slices
│       └── utils/        # formatCurrency, dates, status helpers
│
├── docker-compose.yml
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Razorpay test account

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
# Fill in your .env values
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Configure environment variables

**backend/.env**
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_32_char_secret
JWT_REFRESH_SECRET=your_32_char_refresh_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

**Test credentials:**
| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@hostelease.com       | admin123    |
| Student | arjun@hostelease.com       | student123  |

### 4. Run in development

```bash
# Terminal 1 – Backend
cd backend && npm run dev

# Terminal 2 – Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

---

## Docker (Production)

```bash
# Build and start everything
docker-compose up --build

# App available at http://localhost:80
```

---

## API Reference

### Auth
| Method | Endpoint               | Access |
|--------|------------------------|--------|
| POST   | /api/auth/register     | Public |
| POST   | /api/auth/login        | Public |
| GET    | /api/auth/profile      | Protected |
| PUT    | /api/auth/profile      | Protected |

### Products
| Method | Endpoint                    | Access  |
|--------|-----------------------------|---------|
| GET    | /api/products               | Public  |
| GET    | /api/products/trending      | Public  |
| GET    | /api/products/:id           | Public  |
| POST   | /api/products               | Admin   |
| PUT    | /api/products/:id           | Admin   |
| DELETE | /api/products/:id           | Admin   |
| POST   | /api/products/:id/review    | Student |
| GET    | /api/products/low-stock     | Admin   |

### Orders
| Method | Endpoint                    | Access  |
|--------|-----------------------------|---------|
| POST   | /api/orders                 | Student |
| GET    | /api/orders                 | Admin   |
| GET    | /api/orders/my-orders       | Student |
| PATCH  | /api/orders/:id/status      | Admin   |
| DELETE | /api/orders/:id             | Student |

### Payments
| Method | Endpoint                        | Access    |
|--------|---------------------------------|-----------|
| POST   | /api/payments/create-order      | Protected |
| POST   | /api/payments/verify            | Protected |
| GET    | /api/payments/history           | Protected |
| GET    | /api/payments/analytics         | Admin     |

### Cart
| Method | Endpoint                | Access    |
|--------|-------------------------|-----------|
| GET    | /api/cart               | Protected |
| POST   | /api/cart               | Protected |
| PUT    | /api/cart/:productId    | Protected |
| DELETE | /api/cart/:productId    | Protected |
| DELETE | /api/cart/clear         | Protected |

### Analytics (Admin)
| Method | Endpoint                    |
|--------|-----------------------------|
| GET    | /api/analytics/dashboard    |
| GET    | /api/analytics/monthly      |
| GET    | /api/analytics/categories   |
| GET    | /api/analytics/spending     |

---

## Features

### Student
- Browse & search 36+ seeded products across 7 categories
- Smart search with debounce + category filtering + price range + sort
- Cart with quantity management and sticky summary
- Checkout with delivery slot selection, coupon codes, delivery notes
- Razorpay payment integration with signature verification
- Cash on Delivery option
- Order history with expandable details and cancellation
- Real-time notifications via Socket.IO
- Wishlist system
- Product reviews with verified purchase badges
- Profile with spending analytics chart

### Admin
- KPI dashboard – revenue, orders, students, low stock
- Product CRUD with Cloudinary image upload
- Inventory management with restock controls and availability toggles
- Order management with status updates (Pending → Processing → Delivered)
- User management with activate/deactivate
- Coupon creation with usage tracking and progress bars
- Analytics – monthly revenue bar chart, category pie chart
- Broadcast notifications to all students

---

## Security

- JWT access tokens (7d) + refresh token architecture
- bcrypt password hashing (rounds: 12)
- Helmet.js security headers
- Rate limiting – 200 req / 15 min per IP
- Role-based access control (RBAC)
- Razorpay HMAC SHA256 signature verification
- Input validation via express-validator
- Cloudinary secure image upload

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

### Backend → Railway / Render
1. Connect your GitHub repo
2. Set environment variables in platform dashboard
3. Deploy – platform detects Node.js automatically

### Database → MongoDB Atlas
1. Create a free cluster
2. Get connection string
3. Set `MONGO_URI` in backend `.env`

---

## License

MIT – Built for hostel students everywhere 🎓
