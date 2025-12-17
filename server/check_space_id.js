const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    // Check various formats
    const targetIdClean = 'EDZ-CERT-2025-afb68442';
    const targetIdSpace = 'EDZ-CERT-2025- afb68442';

    const certClean = await Certificate.findOne({ certificateId: targetIdClean });
    console.log(`Searching '${targetIdClean}': ${!!certClean}`);

    const certSpace = await Certificate.findOne({ certificateId: targetIdSpace });
    console.log(`Searching '${targetIdSpace}': ${!!certSpace}`);

    await mongoose.disconnect();
}).catch(err => console.error(err));
