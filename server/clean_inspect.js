const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    const cert = await Certificate.findOne({ certificateId: 'EDZ-CERT-2025-befc4707' });
    if (cert) {
        console.log(`Program ID: ${cert.program}`);
        console.log(`User ID: ${cert.user}`);
    } else {
        console.log("Not found");
    }
    await mongoose.disconnect();
}).catch(err => console.error(err));
