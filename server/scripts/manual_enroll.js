const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { createOrUpdateEnrollment } = require('../services/enrollmentService');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const manualEnroll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const email = 'jayasrirajkumar0206@gmail.com';
        const programId = '693c31cf8266638789640d9d';

        console.log(`Enrolling ${email} into Program ${programId}...`);

        // 1. Find User
        const user = await User.findOne({ email });
        if (!user) {
            console.error("User not found! Please ensure the user has signed up or provide name/phone to create one.");
            // Actually, we can create one if needed, but safer to ask.
            // But based on logs, they might be logged in? 
            // "Name": "JAYASRI RAJKUMAR"
            // Let's create if missing.
            const newUser = await User.create({
                name: 'JAYASRI RAJKUMAR',
                email: email,
                phone: '09894565662',
                password: 'manual_fix_password', // They can reset later
                role: 'student'
            });
            console.log("Created missing user:", newUser._id);
            await performEnrollment(newUser._id, programId);
        } else {
            console.log("Found User:", user._id);
            await performEnrollment(user._id, programId);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
};

const performEnrollment = async (userId, programId) => {
    try {
        const enrollment = await createOrUpdateEnrollment({
            userId,
            programId,
            source: 'admin', // Fixed enum
            paymentId: null
        });
        console.log("---------------------------------------------------");
        console.log("SUCCESS! User enrolled.");
        console.log("Enrollment ID:", enrollment._id);
        console.log("Status:", enrollment.status);
        console.log("Valid Until:", enrollment.validUntil);
        console.log("---------------------------------------------------");
    } catch (e) {
        console.error("Enrollment Service Error:", e.message);
    }
}

manualEnroll();
