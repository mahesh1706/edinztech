const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
    constructor() {
        this.instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    async createOrder(amount, receiptId) {
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: receiptId,
        };

        try {
            const order = await this.instance.orders.create(options);
            return order;
        } catch (error) {
            console.error("Razorpay Error:", error);
            throw new Error('Razorpay Order Creation Failed');
        }
    }

    verifySignature(orderId, paymentId, signature) {
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(orderId + '|' + paymentId);
        const generatedSignature = hmac.digest('hex');

        return generatedSignature === signature;
    }
}

module.exports = new RazorpayService();
