const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Explicit absolute-ish path from script location

const sendTestEmail = async () => {
    console.log("Testing Email Service...");
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Pass: ${process.env.EMAIL_PASS ? '******' : 'MISSING'}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from EdinzTech',
            text: 'If you see this, the email service is working!',
        });
        console.log("Email Sent Successfully!", info.messageId);
    } catch (error) {
        console.error("Email Failed:", error);
    }
};

sendTestEmail();
