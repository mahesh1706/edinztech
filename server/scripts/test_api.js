const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testApi = async () => {
    // 1. Get Admin Token
    await mongoose.connect(process.env.MONGO_URI);
    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
        console.error('No admin found in DB');
        process.exit(1);
    }

    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    await mongoose.disconnect();

    console.log(`Testing with Admin: ${adminUser.email}`);

    // 2. Call API
    try {
        console.log('Connecting to http://127.0.0.1:5000/api/admin/dashboard...');
        const res = await axios.get('http://127.0.0.1:5000/api/admin/dashboard', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('API Response Status:', res.status);
        console.log('API Response Data:', res.data);
    } catch (error) {
        if (error.response) {
            console.error('API Error Status:', error.response.status);
            console.error('API Error Data:', error.response.data);
        } else {
            console.error('Network/Server Error:', error.code, error.message);
        }
    }
};

testApi();
