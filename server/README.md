# LMS Backend

Complete Node.js/Express backend for the LMS platform.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```
   (This should have been done automatically).

2. **Environment Variables**:
   Check `.env` and update:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: Secret key for auth.
   - `RAZORPAY_KEY_ID` & `SECRET`: For payments.
   - `EMAIL_` vars: For Nodemailer.

3. **Required Files**:
   Ensure you place a default certificate template at:
   `server/uploads/templates/default_certificate.png`
   (1920x1080px Recommended).

4. **Run Server**:
   ```bash
   npm run dev
   ```

## Architecture
- `config/`: DB & other configs.
- `models/`: Mongoose Schemas.
- `controllers/`: Request handling logic.
- `services/`: Business logic (Payments, Email, Certificates).
- `events/`: Event-driven automation listeners.
- `routes/`: API route definitions.
- `middlewares/`: Auth & Upload middlewares.

## API Endpoints
- **Auth**: `/api/auth/login`, `/api/auth/admin/login`
- **Programs**: `/api/programs` (CRUD)
- **Payments**: `/api/payments/create-order`
- **Quiz**: `/api/quiz`
- **Certificates**: `/api/certificates/verify/:code`

## Automations
- **Enrollment**: Triggers Welcome Email & Offer Letter (if internship).
- **Completion**: Triggers Certificate Generation & Email.

