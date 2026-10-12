# Product Requirements Document
## School Cafe Ordering System

**Version:** 1.0  
**Last Updated:** October 23, 2025  
**Project Status:** Planning Phase

---

## Executive Summary

A web-based ordering system designed to streamline food ordering and pickup management for school cafes. Students can browse menus, place orders, and receive notifications when their food is ready. Administrators can manage menu items, track orders, and identify payment defaulters.

**Key Objectives:**
- Reduce wait times and queue congestion at the cafe
- Provide flexible payment options (card or cash)
- Enable real-time order status notifications
- Track order history and payment compliance
- Minimize operational costs using free-tier services

---

## Stakeholders

- **Primary Users:** Students (buyers)
- **Secondary Users:** Cafe administrators/staff
- **Development Team:** [To be specified]
- **School Administration:** [To be specified]

---

## Core Features

### 1. Student Interface

#### 1.1 Authentication
- **Student ID Login:** Simple login using school-issued student ID
- **Password/PIN:** Secure password or PIN-based authentication
- **Session Management:** Remember login for returning users
- **Password Recovery:** Reset password via student email

#### 1.2 Menu Browsing
- View all available food items with images, descriptions, and prices
- Filter by categories (breakfast, lunch, snacks, drinks)
- View real-time item availability
- See preparation time estimates

#### 1.3 Order Placement
- Add items to cart
- Modify quantities
- View order summary with total cost
- Select payment method:
  - **Pay Now:** Card payment via Stripe/Paystack
  - **Pay on Pickup:** Cash payment option
- Submit order with order number confirmation

#### 1.4 Order Tracking
- View current order status:
  - Pending
  - Preparing
  - Ready for Pickup
- Receive push notification when order is ready
- Active ring/alert sound when cafe staff notifies them
- View estimated pickup time

#### 1.5 Order History
- View past orders with dates, items, and amounts
- Filter by date range
- View payment status (paid/unpaid)
- Reorder previous items with one click

#### 1.6 Notifications
- Browser push notifications for order ready status
- In-app visual indicator when order is ready
- Audio notification option (ring/alert)

### 2. Admin Interface

#### 2.1 Dashboard
- Overview of today's orders (total, pending, completed)
- Revenue summary (card payments vs cash)
- Quick stats on active orders
- Pending cash payments count

#### 2.2 Order Management
- View all orders in real-time with filters:
  - All Orders
  - Pending
  - In Progress
  - Ready
  - Completed
  - Cancelled
- Update order status
- **Ring Student Button:** Send push notification to student's device
- Mark orders as picked up
- Handle order cancellations
- Search orders by student ID or order number

#### 2.3 Menu Management
- **Add New Items:**
  - Name, description, price
  - Category assignment
  - Upload item image
  - Set availability status
  - Set preparation time
- **Edit Existing Items:**
  - Update prices
  - Modify descriptions
  - Change availability
  - Update images
- **Remove Items:**
  - Soft delete (archive) items
  - Hard delete with confirmation
- **Bulk Operations:**
  - Mark multiple items as unavailable
  - Update category for multiple items

#### 2.4 Order History (Admin View)
- Complete order history with advanced filters:
  - Date range
  - Student ID
  - Payment method
  - Order status
- Export order data to CSV
- View revenue analytics by day/week/month
- Track popular items

#### 2.5 Defaulters Management
- **Defaulters List:** Students who ordered with "pay on pickup" but didn't collect food
- Display:
  - Student ID and name
  - Order number and date
  - Items ordered
  - Amount owed
  - Days since order
- Filter by date range or amount owed
- Mark resolved when payment is collected
- Send reminder notifications
- Export defaulters list

#### 2.6 User Management
- View registered students
- Block/unblock students from ordering
- Admin account management
- Role assignment (if multiple staff members)

---

## Technical Architecture

### 3.1 Frontend
**Technology:** React  
**Hosting:** Vercel (Free Tier)

**Key Libraries:**
- React Router (navigation)
- Axios (API calls)
- React Context API or Redux Toolkit Lite (state management)
- Tailwind CSS or Material-UI (styling)
- React Toastify (notifications)

**Free Tier Limits:**
- Unlimited deployments
- Automatic SSL
- 100GB bandwidth/month
- Serverless functions included

### 3.2 Backend
**Technology:** Node.js + Express.js  
**Hosting Options:**
- **Option 1:** Vercel Serverless Functions (recommended for simplicity)
- **Option 2:** Railway.app (Free tier: 500 hours/month)
- **Option 3:** Render.com (Free tier with limitations)

**Key Dependencies:**
- Express.js (framework)
- CORS (cross-origin requests)
- dotenv (environment variables)
- Helmet (security)
- Express Validator (input validation)

**Free Tier Considerations:**
- Vercel serverless functions: 100GB bandwidth, 100 hours execution
- Railway: $5 credit/month (about 500 hours)
- Render: Spins down after inactivity (slower cold starts)

### 3.3 Database
**Primary Choice:** MongoDB Atlas (Free Tier)

**Free Tier Specs:**
- 512MB storage
- Shared cluster
- No credit card required initially
- Suitable for small to medium projects

**Alternative:** Firebase Firestore
- 1GB storage free
- 50K reads/day, 20K writes/day
- Good for real-time features but more complex pricing

**Collections Structure:**
```
- users (students)
- admins
- menuItems
- orders
- defaulters
- notifications
```

### 3.4 Authentication
**Primary Choice:** Firebase Authentication (Free)

**Benefits:**
- 10K verifications/month free
- Multiple auth methods
- Secure token management
- Easy integration

**Free Tier Limits:**
- Phone auth: First 10K/month free
- Email/password: Unlimited in free tier
- Social auth: Unlimited in free tier

**Alternative:** Custom JWT authentication (completely free, but more development work)

### 3.5 Payment Processing
**Implemented:** Stripe (Better for international payments)

**Stripe:**
- 2.9% + $0.30 per transaction
- Better for international payments
- Test mode available
- No setup fees
- Comprehensive security features
- Easy integration

**Alternative Options (Not Implemented):**
- **Paystack:** 1.5% + ₦100 (Nigerian cards), 3.9% (international cards)
- **Flutterwave:** 1.4% per transaction (African-focused)

**Note:** All payment gateways charge per successful transaction only, no monthly fees.

### 3.6 Notifications/Ring Feature
**Primary Choice:** Firebase Cloud Messaging (FCM) - Free

**Features:**
- Browser push notifications
- Unlimited messages
- Works on Chrome, Firefox, Safari
- In-app notifications

**Implementation:**
- Service worker for background notifications
- Foreground notification handling
- Custom sound/ring on notification

**Alternative:** Twilio (SMS)
- Costs: $0.0075 per SMS (not free, but cheap)
- More reliable but adds cost
- Use only if push notifications insufficient

### 3.7 File Storage (Images)
**Option 1:** Cloudinary (Free Tier)
- 25GB storage
- 25GB bandwidth/month
- Image transformation included
- **Recommended for menu item images**

**Option 2:** Firebase Storage
- 5GB storage free
- 1GB download/day
- Good integration with Firebase ecosystem

**Option 3:** MongoDB GridFS
- Uses database storage
- Good for small files
- No additional service needed

---

## User Flows

### 4.1 Student Order Flow
1. Login with student ID and password
2. Browse available menu items
3. Add items to cart
4. Review cart and select payment method
5. If "Pay Now": Complete card payment → Order confirmed
6. If "Pay on Pickup": Order confirmed → Reminder to pay cash
7. Receive order number
8. Wait for notification
9. Receive push notification + ring alert when ready
10. Go to cafe and collect order
11. If cash payment: Pay and receive food

### 4.2 Admin Order Processing Flow
1. Login to admin dashboard
2. View incoming orders
3. Update order status to "Preparing"
4. When food is ready, change status to "Ready"
5. Click "Ring Student" icon to send notification
6. When student arrives, verify order number
7. If cash payment: Collect payment
8. Mark order as "Completed"
9. If student doesn't show up (cash order): System auto-adds to defaulters after 30 minutes

### 4.3 Defaulter Management Flow
1. System automatically flags orders marked "Pay on Pickup" not collected after 30 minutes
2. Admin reviews defaulters list
3. Admin can send reminder notification to student
4. When student pays, admin marks as "Resolved"
5. Order removed from defaulters list

---

## Database Schema

### 5.1 Users Collection
```javascript
{
  _id: ObjectId,
  studentId: String (unique),
  name: String,
  email: String,
  password: String (hashed),
  phoneNumber: String (optional),
  fcmToken: String (for notifications),
  isBlocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 5.2 Admins Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String,
  password: String (hashed),
  role: String (admin, staff),
  createdAt: Date
}
```

### 5.3 Menu Items Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String (breakfast, lunch, snacks, drinks),
  imageUrl: String,
  isAvailable: Boolean,
  preparationTime: Number (minutes),
  createdAt: Date,
  updatedAt: Date
}
```

### 5.4 Orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  studentId: String (ref: Users),
  items: [{
    menuItemId: ObjectId (ref: MenuItems),
    name: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paymentMethod: String (card, cash),
  paymentStatus: String (paid, pending),
  orderStatus: String (pending, preparing, ready, completed, cancelled),
  transactionId: String (for card payments),
  notificationSent: Boolean,
  pickedUp: Boolean,
  createdAt: Date,
  updatedAt: Date,
  readyAt: Date (when marked ready)
}
```

### 5.5 Defaulters Collection
```javascript
{
  _id: ObjectId,
  orderId: ObjectId (ref: Orders),
  studentId: String (ref: Users),
  studentName: String,
  orderNumber: String,
  items: Array,
  amountOwed: Number,
  orderDate: Date,
  daysElapsed: Number (calculated),
  remindersSent: Number,
  status: String (pending, resolved),
  resolvedAt: Date,
  notes: String
}
```

---

## API Endpoints

### 6.1 Authentication Endpoints
- `POST /api/auth/student/register` - Register new student
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/logout` - Logout (clear session)
- `POST /api/auth/refresh-token` - Refresh auth token
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### 6.2 Menu Endpoints
- `GET /api/menu` - Get all available menu items (public)
- `GET /api/menu/:id` - Get single menu item
- `POST /api/admin/menu` - Add new menu item (admin only)
- `PUT /api/admin/menu/:id` - Update menu item (admin only)
- `DELETE /api/admin/menu/:id` - Delete menu item (admin only)
- `PATCH /api/admin/menu/:id/availability` - Toggle availability (admin only)

### 6.3 Order Endpoints
- `POST /api/orders` - Create new order (student)
- `GET /api/orders/student/:studentId` - Get student's orders
- `GET /api/orders/:orderId` - Get specific order details
- `GET /api/admin/orders` - Get all orders with filters (admin)
- `PATCH /api/admin/orders/:orderId/status` - Update order status (admin)
- `POST /api/admin/orders/:orderId/notify` - Send notification to student (admin)
- `PATCH /api/admin/orders/:orderId/complete` - Mark order as completed (admin)
- `DELETE /api/orders/:orderId` - Cancel order (student, only if pending)

### 6.4 Payment Endpoints
- `POST /api/payment/initialize` - Initialize card payment
- `POST /api/payment/verify` - Verify payment callback
- `GET /api/payment/history/:studentId` - Get payment history

### 6.5 Defaulters Endpoints
- `GET /api/admin/defaulters` - Get all defaulters (admin)
- `POST /api/admin/defaulters/:defaulterId/remind` - Send reminder (admin)
- `PATCH /api/admin/defaulters/:defaulterId/resolve` - Mark as resolved (admin)
- `GET /api/admin/defaulters/export` - Export defaulters list (admin)

### 6.6 Notification Endpoints
- `POST /api/notifications/register-token` - Register FCM token
- `POST /api/admin/notifications/send` - Send custom notification (admin)

### 6.7 Analytics Endpoints
- `GET /api/admin/analytics/revenue` - Revenue analytics (admin)
- `GET /api/admin/analytics/popular-items` - Most ordered items (admin)
- `GET /api/admin/analytics/orders-summary` - Orders summary by period (admin)

---

## Security Requirements

### 7.1 Authentication & Authorization
- JWT tokens with expiration (15 min access, 7 day refresh)
- Password hashing using bcrypt (salt rounds: 10)
- Rate limiting on auth endpoints (5 attempts per 15 minutes)
- Role-based access control (student vs admin)
- Secure password requirements (min 8 characters, mix of letters/numbers)

### 7.2 Data Protection
- HTTPS only (enforced)
- Environment variables for sensitive data
- Input validation and sanitization on all endpoints
- SQL/NoSQL injection prevention
- XSS protection using Content Security Policy
- CORS configuration (whitelist allowed origins)

### 7.3 Payment Security
- PCI DSS compliance through payment gateway
- Never store card details on server
- Use payment gateway's tokenization
- Verify all payment callbacks with webhook signatures
- Test mode for development

### 7.4 Session Management
- Secure, httpOnly cookies for tokens
- CSRF token implementation
- Auto-logout after inactivity (30 minutes)
- Logout on all devices option

---

## Non-Functional Requirements

### 8.1 Performance
- Page load time: < 3 seconds on 3G
- API response time: < 500ms for 95% of requests
- Support 100 concurrent users minimum
- Image optimization (WebP format, lazy loading)

### 8.2 Scalability
- Horizontal scaling capability for backend
- Database indexing on frequently queried fields
- Caching strategy for menu items (Redis if needed)
- CDN for static assets (Vercel provides this)

### 8.3 Reliability
- 99% uptime target
- Automated database backups (MongoDB Atlas provides this)
- Error logging and monitoring (consider Sentry free tier)
- Graceful error handling with user-friendly messages

### 8.4 Usability
- Mobile-responsive design (most students use phones)
- Intuitive navigation (max 3 clicks to order)
- Clear call-to-action buttons
- Accessibility compliance (WCAG 2.1 Level AA)
- Support for Chrome, Firefox, Safari, Edge

### 8.5 Maintainability
- Clean, documented code
- Git version control with branching strategy
- Code review process
- Automated testing (unit and integration tests)
- CI/CD pipeline (GitHub Actions free tier)

---

## Development Phases

### Phase 1: MVP (Weeks 1-4)
**Student Features:**
- Basic authentication (student ID + password)
- View menu items
- Place order (card payment only)
- View current order status

**Admin Features:**
- Admin login
- View orders
- Update order status
- Basic menu management (add/edit items)

**Infrastructure:**
- MongoDB setup
- React frontend with basic UI
- Node.js API
- Firebase Auth integration
- Stripe payment integration
- Deploy to Vercel

### Phase 2: Enhanced Features (Weeks 5-6)
**Student Features:**
- Order history
- "Pay on Pickup" option
- Browser push notifications

**Admin Features:**
- Ring/notify student feature (FCM)
- Order history with filters
- Menu item images (Cloudinary)
- Dashboard with stats

### Phase 3: Defaulter Management (Week 7)
**Admin Features:**
- Defaulters tracking system
- Auto-flagging of uncollected cash orders
- Reminder notifications
- Export defaulters list
- Resolve defaulter functionality

### Phase 4: Polish & Testing (Week 8)
- Comprehensive testing
- Bug fixes
- Performance optimization
- Security audit
- User acceptance testing
- Documentation

### Phase 5: Optional Enhancements (Future)
- Reorder favorite items
- Item ratings and reviews
- Dietary filters (vegetarian, halal, etc.)
- Order scheduling (pre-order for later)
- Admin mobile app
- SMS notifications (using Twilio)
- Loyalty points system
- Multiple payment methods
- Analytics dashboard with charts

---

## Cost Analysis (Monthly Estimates)

### Free Tier Services
- **Vercel Hosting:** $0 (stays within limits for small school)
- **MongoDB Atlas:** $0 (512MB sufficient for starting)
- **Firebase Auth:** $0 (under 10K verifications)
- **Firebase Cloud Messaging:** $0 (unlimited)
- **Cloudinary:** $0 (25GB sufficient for menu images)
- **GitHub:** $0 (public or private repos)

### Pay-per-use Services (Transaction-based)
- **Stripe:** 2.9% + $0.30 per transaction
  - Example: 100 orders × $10 average = $1,000 revenue
  - Fees: ~$59 (2.9% + $0.30 per transaction)
  - For Nigerian Naira: Similar percentage applies

### Optional Paid Services (If Scaling)
- **MongoDB Atlas Upgrade:** $9/month (2GB, better performance)
- **Vercel Pro:** $20/month (if exceeding bandwidth)
- **Twilio SMS:** ~$0.0075 per SMS (only if push notifications aren't enough)
- **Domain Name:** $10-15/year (optional, can use Vercel subdomain free)

**Total Estimated Cost (Small Scale):**
- **Fixed Monthly Cost:** $0
- **Variable Cost:** 2.9% + $0.30 per transaction
- **Annual Cost:** ~$0-15 (if purchasing domain)

**Scaling Cost (100+ daily orders):**
- May need MongoDB paid tier: ~$9/month
- Total: ~$9/month + transaction fees

---

## Risk Assessment

### 10.1 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Free tier limits exceeded | High | Medium | Monitor usage, plan upgrade path |
| Payment gateway downtime | High | Low | Implement fallback (cash only mode) |
| Push notification failures | Medium | Medium | Fallback to in-app polling |
| Database performance issues | Medium | Low | Optimize queries, add indexes |
| Security breach | High | Low | Regular security audits, HTTPS |

### 10.2 Operational Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Students not adopting system | High | Medium | Training sessions, incentives |
| Increase in defaulters | Medium | Medium | Clear policies, block repeat offenders |
| Admin staff resistance | Medium | Low | Training, demonstrate time savings |
| Order rush during peak hours | Medium | High | Queue management, peak hour pricing |

### 10.3 Business Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low order volume | Medium | Medium | Marketing, promotions |
| Cash flow issues (defaulters) | Medium | Medium | Strict defaulter policies |
| Competition from other vendors | Low | Low | Better service, convenience |

---

## Success Metrics

### 11.1 User Adoption
- 60% of students registered within first month
- 40% active users (order at least once per week)
- 80% repeat order rate

### 11.2 Operational Efficiency
- 50% reduction in queue wait time
- 90% orders fulfilled within estimated time
- 95% payment success rate (for card payments)

### 11.3 Financial
- 70% orders paid via card (reduces cash handling)
- <5% defaulter rate
- 95% defaulter resolution within 7 days

### 11.4 Satisfaction
- User satisfaction score: >4/5
- <2% order error rate
- 90% of students would recommend system

---

## Launch Plan

### 12.1 Pre-Launch (Week -2 to 0)
- Complete all testing
- Load test with simulated users
- Train cafe staff on admin interface
- Create user guides and FAQs
- Set up monitoring and logging
- Prepare rollback plan

### 12.2 Soft Launch (Week 1-2)
- Invite 50-100 beta testers (volunteers)
- Monitor closely for issues
- Gather feedback
- Fix critical bugs
- Optimize based on real usage

### 12.3 Full Launch (Week 3)
- Announce to entire school via email/posters
- Demo sessions during lunch breaks
- Special launch promotion (discount on first order)
- Monitor server performance
- 24/7 support availability

### 12.4 Post-Launch (Week 4+)
- Weekly performance reviews
- Bi-weekly feature updates
- Monthly user surveys
- Quarterly roadmap updates
- Continuous optimization

---

## Support & Maintenance

### 13.1 Technical Support
- Help desk email: support@schoolcafe.example.com
- Response time: <24 hours for critical issues
- FAQ section in app
- Video tutorials for common tasks

### 13.2 Maintenance Schedule
- **Daily:** Monitor server health, check error logs
- **Weekly:** Database backup verification, performance review
- **Monthly:** Security updates, dependency updates
- **Quarterly:** Feature releases, major updates

### 13.3 Incident Response
- Critical bugs: Fix within 4 hours
- Major bugs: Fix within 24 hours
- Minor bugs: Fix in next release
- Feature requests: Review monthly

---

## Compliance & Legal

### 14.1 Data Protection
- Comply with local data protection laws
- Privacy policy clearly stating data usage
- Terms of service for users
- GDPR compliance (if applicable)
- Right to delete account and data

### 14.2 Student Data
- Minimal data collection (only necessary info)
- No sharing of student data with third parties
- Parental consent if required by school policy
- Secure storage of student records

### 14.3 Payment Compliance
- PCI DSS through payment gateway
- Clear refund policy
- Transaction records retention (minimum 2 years)
- Dispute resolution process

---

## Future Roadmap

### Year 1
- Mobile app (React Native)
- Integration with school's existing student database
- Advanced analytics dashboard
- Automated inventory management

### Year 2
- AI-based demand forecasting
- Personalized recommendations
- Multiple cafe locations support
- White-label solution for other schools

### Beyond
- Nutrition tracking
- Social features (group orders)
- Integration with student meal plans
- Vendor marketplace model

---

## Appendix

### A. Technology Stack Summary
```
Frontend:
  - React 18+
  - React Router
  - Axios
  - Tailwind CSS
  - React Context API

Backend:
  - Node.js 18+
  - Express.js
  - MongoDB/Mongoose

Authentication:
  - Firebase Authentication

Payments:
  - Stripe (implemented)

Notifications:
  - Firebase Cloud Messaging

Storage:
  - Cloudinary (images)
  - MongoDB (data)

Hosting:
  - Vercel (frontend + serverless functions)

Version Control:
  - Git + GitHub

CI/CD:
  - GitHub Actions (free tier)
```

### B. Recommended Development Tools
- **IDE:** VS Code with ESLint, Prettier
- **API Testing:** Postman or Insomnia
- **Database GUI:** MongoDB Compass
- **Git Client:** GitKraken or GitHub Desktop
- **Design:** Figma (free tier)
- **Project Management:** Notion or Trello (free tier)

### C. Learning Resources
- **Node.js:** NodeJS.org documentation
- **React:** React.dev official docs
- **MongoDB:** MongoDB University (free courses)
- **Firebase:** Firebase documentation
- **Paystack:** Paystack developer docs
- **Git:** GitHub Skills (free interactive course)

### D. References
- [Paystack API Docs](https://paystack.com/docs/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/)
- [Vercel Deployment](https://vercel.com/docs)
- [React Best Practices](https://react.dev/learn)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 23, 2025 | [Your Name] | Initial PRD |

**Approval**

- [ ] Technical Lead
- [ ] School Administration
- [ ] Cafe Management
- [ ] Budget Approval

**Next Steps:**
1. Review and approve PRD
2. Set up development environment
3. Create Git repository
4. Begin Phase 1 development
5. Schedule weekly stand-up meetings

---

*This is a living document and will be updated as the project evolves.*
