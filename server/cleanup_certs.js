const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    // Count broken certs (assuming all EDZ ones created recently are broken)
    const broken = await Certificate.find({ certificateId: /^EDZ-CERT-/ });
    console.log(`Found ${broken.length} EDZ certificates.`);

    // Safety check: print a few
    broken.slice(0, 3).forEach(c => console.log(`ID: ${c.certificateId}, User: ${c.user}, Program: ${c.program}`));

    if (broken.length > 0) {
        console.log("Deleting...");
        await Certificate.deleteMany({ certificateId: /^EDZ-CERT-/ });
        console.log("Deleted.");
    }

    await mongoose.disconnect();
}).catch(err => console.error(err));
