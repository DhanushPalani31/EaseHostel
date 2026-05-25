# HostelEase V2 — Smart Hostel Delivery & Ordering Platform

A production-ready full-stack MERN SaaS application combining V1 (product ordering) and V2 (custom orders + parcel delivery) into a single unified platform.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, Redux Toolkit, Recharts |
| Backend | Node.js, Express.js, MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Payments | Razorpay + Cash on Delivery |
| Real-time | Socket.IO |
| Storage | Cloudinary |
| Email | Nodemailer |


---

## 📁 Project Structure

```
hostelease/
├── backend/
│   ├── config/
│   │   ├── db.js              MongoDB connection
│   │   ├── cloudinary.js      Image upload (multer + cloudinary)
│   │   ├── socket.js          Socket.IO init
│   │   ├── email.js           Nodemailer config
│   │   └── razorpay.js        Razorpay instance
│   │
│   ├── constants/
│   │   └── index.js           ORDER_STATUS, PAYMENT_STATUS, ROLES, etc.
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── secondary.models.js  Cart, Payment, Notification, Coupon
│   │   ├── CustomOrder.js       V2: Custom product requests
│   │   ├── ExternalDelivery.js  V2: Gate pickup + hostel delivery
│   │   └── DeliveryStaff.js     V2: Delivery personnel
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── invoice.controller.js
│   │   ├── misc.controller.js   Cart, payments, notifications, etc.
│   │   └── v2.controller.js     Custom orders, deliveries, staff
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── order.service.js
│   │   ├── payment.service.js
│   │   ├── cart.service.js
│   │   ├── analytics.service.js
│   │   ├── notification.service.js
│   │   ├── coupon.service.js
│   │   ├── user.service.js
│   │   ├── wishlist.service.js
│   │   ├── customOrder.service.js    V2
│   │   ├── externalDelivery.service.js V2
│   │   └── deliveryStaff.service.js  V2
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   ├── cart.routes.js
│   │   ├── notification.routes.js
│   │   ├── coupon.routes.js
│   │   ├── user.routes.js
│   │   ├── analytics.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── customOrder.routes.js     V2
│   │   ├── externalDelivery.routes.js V2
│   │   └── deliveryStaff.routes.js   V2
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   │
│   ├── validations/
│   │   ├── auth.validation.js
│   │   └── order.validation.js
│   │
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── AppError.js
│   │   ├── apiResponse.js
│   │   ├── tokenUtils.js
│   │   ├── logger.js
│   │   ├── emailUtils.js
│   │   ├── invoiceGenerator.js
│   │   ├── pagination.js
│   │   ├── seeder.js       V1 seed data
│   │   └── seedV2.js       V2 seed data
│   │
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── nodemon.json
│
└── frontend/
    └── src/
        ├── App.jsx             All routes + guards
        ├── main.jsx
        ├── index.css           Design tokens + utilities
        │
        ├── animations/
        │   └── variants.js     Framer Motion variants
        │
        ├── components/
        │   ├── ui/
        │   │   ├── Button.jsx
        │   │   ├── Input.jsx
        │   │   ├── Modal.jsx
        │   │   ├── Badge.jsx
        │   │   ├── Toggle.jsx
        │   │   ├── Skeleton.jsx
        │   │   ├── EmptyState.jsx
        │   │   ├── Pagination.jsx
        │   │   └── StatCard.jsx
        │   ├── common/
        │   │   ├── ProductCard.jsx
        │   │   ├── SearchBar.jsx
        │   │   ├── CategoryFilter.jsx
        │   │   ├── NotificationBell.jsx
        │   │   ├── CartDrawer.jsx
        │   │   ├── PageHeader.jsx
        │   │   ├── StatusBadges.jsx
        │   │   └── ConfirmDialog.jsx
        │   ├── charts/
        │   │   ├── RevenueChart.jsx
        │   │   └── CategoryPieChart.jsx
        │   └── delivery/         V2 components
        │       ├── DeliveryTimeline.jsx
        │       ├── DeliveryCard.jsx
        │       ├── CustomOrderCard.jsx
        │       ├── PlatformBadge.jsx
        │       └── PriorityBadge.jsx
        │
        ├── hooks/
        │   ├── index.js          useDebounce, useAuth, useSocket, etc.
        │   ├── useProducts.js
        │   ├── useCart.js
        │   ├── useOrders.js
        │   ├── useNotifications.js
        │   ├── useWishlist.js
        │   ├── useAdminData.js
        │   ├── useCustomOrders.js V2
        │   └── useDeliveries.js   V2
        │
        ├── layouts/
        │   ├── PublicLayout.jsx
        │   ├── StudentLayout.jsx
        │   └── AdminLayout.jsx
        │
        ├── pages/
        │   ├── public/
        │   │   ├── LandingPage.jsx
        │   │   ├── LoginPage.jsx
        │   │   └── RegisterPage.jsx
        │   ├── student/
        │   │   ├── StudentDashboard.jsx
        │   │   ├── ProductsPage.jsx
        │   │   ├── ProductDetailPage.jsx
        │   │   ├── CartPage.jsx
        │   │   ├── CheckoutPage.jsx
        │   │   ├── OrdersPage.jsx
        │   │   ├── NotificationsPage.jsx
        │   │   ├── WishlistPage.jsx
        │   │   ├── ProfilePage.jsx
        │   │   ├── CustomOrderPage.jsx    V2
        │   │   ├── ExternalDeliveryPage.jsx V2
        │   │   └── DeliveryTrackingPage.jsx V2
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── AdminProducts.jsx
        │       ├── AdminOrders.jsx
        │       ├── AdminInventory.jsx
        │       ├── AdminAnalytics.jsx
        │       ├── AdminCoupons.jsx
        │       ├── AdminUsers.jsx
        │       ├── AdminCustomRequests.jsx  V2
        │       ├── AdminDeliveryManagement.jsx V2
        │       ├── AdminDeliveryStaff.jsx   V2
        │       └── AdminPickupQueue.jsx     V2 (Kanban board)
        │
        ├── services/
        │   ├── api.js
        │   ├── socket.js
        │   ├── payment.service.js
        │   ├── product.service.js
        │   ├── order.service.js
        │   ├── user.service.js
        │   ├── notification.service.js
        │   ├── analytics.service.js
        │   ├── customOrder.service.js    V2
        │   ├── externalDelivery.service.js V2
        │   └── deliveryStaff.service.js  V2
        │
        ├── store/
        │   ├── index.js
        │   └── slices/
        │       ├── authSlice.js
        │       ├── cartSlice.js
        │       ├── productSlice.js
        │       ├── orderSlice.js
        │       ├── notificationSlice.js
        │       ├── wishlistSlice.js
        │       ├── adminSlice.js
        │       ├── uiSlice.js
        │       ├── customOrderSlice.js  V2
        │       └── deliverySlice.js     V2
        │
        └── utils/
            └── index.js
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Configure `.env`

```env
# backend/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/hostelease
JWT_SECRET=your_32_char_secret_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=HostelEase <your@gmail.com>
CLIENT_URL=http://localhost:5173
```

```env
# frontend/.env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 3. Seed Database

```bash
cd backend

# Seed V1 data (products, users, coupons)
npm run seed

# Seed V2 data (delivery staff, sample custom orders)
npm run seed:v2

# Or both at once
npm run seed:all
```

### 4. Run Dev Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hostelease.com | admin123 |
| Student | arjun@hostelease.com | student123 |

---

## 📡 API Reference

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/profile | Protected |
| PUT | /api/auth/profile | Protected |

### Products
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/products | Public |
| GET | /api/products/trending | Public |
| GET | /api/products/:id | Public |
| POST | /api/products | Admin |
| PUT | /api/products/:id | Admin |
| DELETE | /api/products/:id | Admin |
| POST | /api/products/:id/review | Student |
| GET | /api/products/low-stock | Admin |

### Orders
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/orders | Student |
| GET | /api/orders | Admin |
| GET | /api/orders/my-orders | Student |
| PATCH | /api/orders/:id/status | Admin |
| DELETE | /api/orders/:id | Student |
| GET | /api/orders/:id/invoice | Protected |

### Payments
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/payments/create-order | Protected |
| POST | /api/payments/verify | Protected |
| GET | /api/payments/history | Protected |
| GET | /api/payments/analytics | Admin |

### Cart
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/cart | Protected |
| POST | /api/cart | Protected |
| PUT | /api/cart/:productId | Protected |
| DELETE | /api/cart/:productId | Protected |
| DELETE | /api/cart/clear | Protected |

### V2 — Custom Orders
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/custom-orders | Student |
| GET | /api/custom-orders/my | Student |
| GET | /api/custom-orders | Admin |
| GET | /api/custom-orders/analytics | Admin |
| GET | /api/custom-orders/:id | Protected |
| PATCH | /api/custom-orders/:id/status | Admin |
| DELETE | /api/custom-orders/:id | Student |

### V2 — External Deliveries
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/external-deliveries | Student |
| GET | /api/external-deliveries/my | Student |
| GET | /api/external-deliveries | Admin |
| GET | /api/external-deliveries/analytics | Admin |
| GET | /api/external-deliveries/:id | Protected |
| PATCH | /api/external-deliveries/:id/status | Admin |
| PATCH | /api/external-deliveries/:id/assign | Admin |
| POST | /api/external-deliveries/:id/verify-otp | Protected |
| DELETE | /api/external-deliveries/:id | Student |

### V2 — Delivery Staff
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/delivery-staff | Admin |
| GET | /api/delivery-staff | Protected |
| GET | /api/delivery-staff/performance | Admin |
| GET | /api/delivery-staff/:id | Protected |
| PUT | /api/delivery-staff/:id | Admin |
| PATCH | /api/delivery-staff/:id/availability | Admin |
| PATCH | /api/delivery-staff/:id/active | Admin |
| GET | /api/delivery-staff/:id/deliveries | Admin |
| DELETE | /api/delivery-staff/:id | Admin |

---

## 🐳 Docker

```bash
docker-compose up --build
# App at http://localhost:80
```

---

## ☁️ Deployment

### Backend → Render
- Build command: `npm install`
- Start command: `node server.js`
- Add all env variables from `.env.example`

### Frontend → Netlify
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Add `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_RAZORPAY_KEY_ID`

### Database → MongoDB Atlas
Create free cluster → get connection string → set as `MONGO_URI`

---

## ✨ Feature Summary

### V1 Features
- JWT auth with role-based access (Student / Admin)
- Product browsing with search, filter, sort
- Shopping cart with persistence
- Razorpay + COD payment integration
- Order tracking (Pending → Processing → Delivered)
- Admin dashboard with KPI charts
- Inventory management with restock
- Coupon system with discount codes
- Wishlist and product reviews
- Real-time notifications via Socket.IO
- Email confirmations via Nodemailer
- Analytics dashboard with revenue charts

### V2 Features
- Custom order requests with images and priority
- External parcel pickup (Amazon, Flipkart, Zepto, etc.)
- Gate pickup → room delivery workflow
- 6-step live delivery tracker
- OTP-based delivery confirmation
- Delivery staff management
- Kanban-style pickup queue dashboard
- Real-time delivery status via Socket.IO
- Staff performance leaderboard
- Platform analytics (most used delivery apps)

---

## 📄 License
MIT — Built for hostel students everywhere 🎓
