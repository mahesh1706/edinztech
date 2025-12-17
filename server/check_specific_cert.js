const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    const targetId = 'EDZ-CERT-2025-afb61224';
    console.log(`Searching for: '${targetId}'`);

    const cert = await Certificate.findOne({ certificateId: targetId });

    if (cert) {
        console.log("FOUND:");
        console.log(JSON.stringify(cert, null, 2));
    } else {
        console.log("NOT FOUND in DB.");
    }

    await mongoose.disconnect();
}).catch(err => console.error(err));
