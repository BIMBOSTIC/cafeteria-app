# School Cafe Ordering System

A web-based ordering system for school cafeterias that streamlines food ordering and pickup management.

## Features

### Student Features (Phase 1 MVP)
- Authentication with Student ID and password
- Browse menu items with real-time availability
- Place orders with card payment (Paystack)
- View current order status

### Admin Features (Phase 1 MVP)
- Admin authentication
- View and manage orders
- Update order status
- Menu management (add/edit items)

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Axios
- Tailwind CSS
- Firebase Authentication
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Firebase Admin SDK
- JWT Authentication
- Helmet (security)
- Express Validator

### External Services
- **Database:** MongoDB Atlas (Free Tier)
- **Authentication:** Firebase Authentication
- **Payments:** Stripe
- **Hosting:** Vercel
- **Images:** Cloudinary (Phase 2)
- **Notifications:** Firebase Cloud Messaging (Phase 2)

## Project Structure

```
cafeteria-app/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
├── package.json       # Root package.json for workspace
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Firebase project set up
- Stripe account (test mode)

### Installation

1. Install dependencies for all workspaces:
```bash
npm run install:all
```

Or install individually:
```bash
# Root dependencies
npm install

# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

2. Set up environment variables:

**Backend (.env file in backend/)**
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend (.env file in frontend/)**
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
# Stripe Checkout doesn't require publishable key (uses hosted checkout page)
# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key (optional)
```

### Running the Application

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run individually:
```bash
# Frontend only (http://localhost:5173)
npm run dev:frontend

# Backend only (http://localhost:5000)
npm run dev:backend
```

### Building for Production

```bash
npm run build
```

## Development Phases

- **Phase 1 (Current):** MVP - Basic ordering system with card payments
- **Phase 2:** Push notifications, order history, "Pay on Pickup" option
- **Phase 3:** Defaulter management system
- **Phase 4:** Polish, testing, optimization
- **Phase 5:** Future enhancements (see PRD)

## Documentation

See [school-cafe-prd.md](./school-cafe-prd.md) for complete product requirements and specifications.

## API Endpoints

### Authentication
- `POST /api/auth/student/register` - Register student
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/admin/login` - Admin login

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/admin/menu` - Add menu item (admin)
- `PUT /api/admin/menu/:id` - Update menu item (admin)
- `DELETE /api/admin/menu/:id` - Delete menu item (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/student/:studentId` - Get student orders
- `GET /api/admin/orders` - Get all orders (admin)
- `PATCH /api/admin/orders/:orderId/status` - Update order status (admin)

### Payments
- `POST /api/payment/initialize` - Initialize payment
- `POST /api/payment/verify` - Verify payment

## License

MIT
