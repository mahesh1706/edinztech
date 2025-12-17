const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    const email = 'immaheshwaran17@gmail.com';
    const users = await User.find({ email: email });

    console.log(`Users with email ${email}:`, users.length);
    users.forEach(u => {
        console.log(`ID: ${u._id}, Name: ${u.name}, Created: ${u._id.getTimestamp()}`);
    });

    await mongoose.disconnect();
}).catch(err => console.error(err));
