const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("Connected to MongoDB");
        // Find the most recent enrollment
        const Enrollment = require('../models/Enrollment');
        const enrollment = await Enrollment.findOne().sort({ createdAt: -1 }).populate('user');

        console.log("Latest Enrollment for User:", enrollment.user.name);
        console.log("User Email:", enrollment.user.email);
        console.log("User Code (from User):", enrollment.user.userCode);
        console.log("User Code (from Enrollment):", enrollment.userCode);

        if (!enrollment.userCode) {
            console.error("❌ CRITICAL: userCode MISSING in Enrollment!");
        } else {
            console.log("✅ SUCCESS: userCode present in Enrollment.");
        }

        process.exit();
    })
    .catch(err => console.error(err));
