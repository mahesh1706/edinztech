const axios = require('axios');
const crypto = require('crypto');

const secret = 'testmode'; // Must match .env
const url = 'http://localhost:5000/api/payments/webhook';

// Mock Payload matching Razorpay structure
const payload = {
    "entity": "event",
    "account_id": "acc_test",
    "event": "payment.captured",
    "contains": ["payment"],
    "payload": {
        "payment": {
            "entity": {
                "id": "pay_test_final_" + Date.now(),
                "entity": "payment",
                "amount": 100,
                "currency": "INR",
                "status": "captured",
                "order_id": "order_test_final_" + Date.now(),
                "email": "simulation_final_" + Date.now() + "@test.com",
                "contact": "9999999999",
                "notes": {
                    "programId": "693bf5a1ed29a0116cadaf8b",
                    "programType": "Course",
                    "name": "Final Fix User",
                    "email": "simulation_final_" + Date.now() + "@test.com",
                    "phone": "9999999999"
                }
            }
        }
    },
    "created_at": Date.now() / 1000
};

const body = JSON.stringify(payload);
const shasum = crypto.createHmac('sha256', secret);
shasum.update(body);
const digest = shasum.digest('hex');

console.log(`Sending Webhook to ${url}`);
console.log(`Signature: ${digest}`);

axios.post(url, payload, {
    headers: {
        'x-razorpay-signature': digest,
        'Content-Type': 'application/json'
    }
})
    .then(res => {
        console.log("Response:", res.data);
        console.log("✅ Webhook Simulated Successfully");
    })
    .catch(err => {
        console.error("❌ Failed:", err.response ? err.response.data : err.message);
    });
