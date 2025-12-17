const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    // Dump specific certificate
    const cert = await Certificate.findOne({ certificateId: 'EDZ-CERT-2025-befc4707' });

    if (cert) {
        console.log("Certificate Found:");
        console.log(JSON.stringify(cert, null, 2));
    } else {
        console.log("Certificate NOT Found");
    }

    await mongoose.disconnect();
}).catch(err => console.error(err));
