const mongoose = require('mongoose');
const User = require('../models/User');
const { encrypt } = require('../utils/encryption');
const path = require('path');
const dotenv = require('dotenv');

// Explicit logic used in server.js
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const fixUser = async () => {
    await connectDB();

    const email = 'jayasrirajkumar0206@gmail.com';
    const tempPassword = 'TempPassword123!';

    console.log(`Fixing user: ${email}`);
    // Debug ENV
    console.log("Using Secret: ", (process.env.JWT_SECRET || 'FALLBACK').substring(0, 5) + "...");

    try {
        const user = await User.findOne({ email });

        if (user) {
            user.password = tempPassword;
            user.encryptedPassword = encrypt(tempPassword);

            await user.save();

            console.log('SUCCESS: User password updated.');
            console.log(`New Password: ${tempPassword}`);

        } else {
            console.log('User NOT found.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

fixUser();
