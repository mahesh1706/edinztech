const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const adminEmail = 'admin@edinztech.com';
        const user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log('Admin user already exists.');
            // We cannot show password as it is hashed.
            // But we can reset it if needed. For now, let's assume standard logic.
            console.log(`Email: ${adminEmail}`);
            console.log('If you do not know the password, I can reset it to "admin123".');
            // Let's just reset it to ensure the user can login.
            user.password = 'admin123';
            user.role = 'admin';
            user.isAdmin = true;
            await user.save();
            console.log('Password reset to: admin123');
        } else {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'admin123', // Model checks isModified and hashes it
                role: 'admin',
                isAdmin: true,
                phone: '0000000000'
            });
            console.log('Admin user created successfully.');
            console.log(`Email: ${adminEmail}`);
            console.log('Password: admin123');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
