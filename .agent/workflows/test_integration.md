---
description: How to connect and test the full stack
---

# Full Stack Integration Test Guide

## 1. Start the Backend
1.  Open a new terminal.
2.  Navigate to the server directory:
    ```bash
    cd server
    ```
3.  Install dependencies (if you haven't):
    ```bash
    npm install
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    *Ensure MongoDB is running locally or your `MONGO_URI` is set correctly in `.env`.*

## 2. Start the Frontend
1.  Open another terminal.
2.  Navigate to the project root:
    ```bash
    cd ..
    ```
    *(or stay in root if you were there)*
3.  Start the vite server:
    ```bash
    npm run dev
    ```

## 3. Verify Connection
1.  Go to `http://localhost:5173/login`.
2.  Open Browser Console (F12).
3.  Attempt to login as a Student or Admin.
    *   **Note**: Since the DB is likely empty, you might need to create a user first via Postman or seed data, OR rely on the Razorpay flow to create students.
    *   **For Admin**: You can manually insert an admin user into MongoDB or use a registration endpoint if you created one (standard MERN usually has a seed script).

## 4. Troubleshooting
*   **CORS Error?** Check if `vite.config.js` has the proxy set up correctly.
*   **Connection Refused?** Ensure Backend is running on port 5000.
