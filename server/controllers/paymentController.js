const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Program = require('../models/Program');
const { createOrUpdateEnrollment } = require('../services/enrollmentService');
const { sendEmail } = require('../services/emailService');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', programId, notes } = req.body;

    const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
            ...notes,
            programId
        }
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
});

// @desc    Free Enrollment for Price 0 Programs
// @route   POST /api/payments/enroll-free
// @access  Private
const enrollFree = asyncHandler(async (req, res) => {
    const { programId } = req.body;
    const userId = req.user._id;

    const program = await Program.findById(programId);
    if (!program) {
        res.status(404);
        throw new Error('Program not found');
    }

    if (program.fee > 0 && program.paymentMode !== 'Free') {
        res.status(400);
        throw new Error('This program is not free');
    }

    // Create a "free" payment record for consistency
    const payment = await Payment.create({
        user: userId,
        program: programId,
        amount: 0,
        status: 'captured',
        razorpayPaymentId: `free_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        razorpayOrderId: `free_order_${Date.now()}`
    });

    await createOrUpdateEnrollment({
        userId,
        programId,
        source: 'free',
        paymentId: payment._id
    });

    await sendEmail({
        email: req.user.email,
        subject: 'Enrollment Confirmed - EdinzTech',
        message: `Hi ${req.user.name}, you have been successfully enrolled in ${program.title} for free.`
    });

    res.json({ status: 'success', message: 'Enrolled successfully' });
});

// @desc    Handle Razorpay Webhook
// @route   POST /api/payments/webhook
// @access  Public (Webhook)
const handleWebhook = asyncHandler(async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Validate signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured') {
            const paymentEntity = payload.payment.entity;
            const { notes, email, contact, order_id, id: paymentId, amount } = paymentEntity;

            const userEmail = notes.email || email;
            const userPhone = notes.phone || contact;
            const userName = notes.name || 'Student';
            const programId = notes.programId;

            if (userEmail && programId) {
                // 1. Find or Create User
                let user = await User.findOne({ email: userEmail });
                let isNewUser = false;
                let autoPassword = '';

                if (!user) {
                    isNewUser = true;
                    autoPassword = crypto.randomBytes(4).toString('hex');

                    user = await User.create({
                        name: userName,
                        email: userEmail,
                        phone: userPhone,
                        password: autoPassword,
                        role: 'student',
                        isActive: true
                    });
                }

                // 2. Create Payment Record (check if exists first for idempotency?)
                // Webhooks can send duplicates. IDempotency key usually header, but here simplify.
                const existingPayment = await Payment.findOne({ razorpayPaymentId: paymentId });

                if (!existingPayment) {
                    const newPayment = await Payment.create({
                        razorpayOrderId: order_id,
                        razorpayPaymentId: paymentId,
                        user: user._id,
                        program: programId,
                        amount: amount / 100,
                        status: 'captured'
                    });

                    // 3. Enroll User
                    await createOrUpdateEnrollment({
                        userId: user._id,
                        programId,
                        source: 'razorpay',
                        paymentId: newPayment._id
                    });

                    // 4. Send Email
                    if (isNewUser) {
                        await sendEmail({
                            email: user.email,
                            subject: 'Welcome to EdinzTech - Login Credentials',
                            message: `Welcome ${user.name}! You have successfully enrolled. Your login details: \nUsername: ${user.email}\nPassword: ${autoPassword}\nLog in here: ${process.env.FRONTEND_URL}/login`
                        });
                    } else {
                        await sendEmail({
                            email: user.email,
                            subject: 'Enrollment Confirmed - EdinzTech',
                            message: `Hi ${user.name}, your payment was successful and you have been enrolled.`
                        });
                    }
                }
            }
        }
        res.json({ status: 'ok' });
    } else {
        res.status(400).json({ error: 'Invalid signature' });
    }
});

module.exports = { createOrder, handleWebhook, enrollFree };
