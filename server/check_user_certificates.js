const mongoose = require('mongoose');
const User = require('./models/User');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    const email = 'assuvarcloud@gmail.com'; // User 2 email
    const user = await User.findOne({ email });

    if (!user) {
        console.log("User not found:", email);
    } else {
        console.log("User found:", user._id, user.name);
        const certs = await Certificate.find({ user: user._id });
        console.log("Certificates found:", certs.length);
        certs.forEach(c => {
            console.log(`ID: ${c.certificateId}, Status: ${c.status}, Type: ${c.metadata?.type}`);
        });
    }

    await mongoose.disconnect();
}).catch(err => console.error(err));
