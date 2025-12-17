const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    const count = await Certificate.countDocuments();
    console.log(`Total Certificates in DB: ${count}`);

    const certs = await Certificate.find().limit(10).sort({ _id: -1 });
    certs.forEach(c => {
        console.log(`ID: ${c.certificateId} | User: ${c.user} | Prog: ${c.program} | Status: ${c.status}`);
    });

    await mongoose.disconnect();
}).catch(err => console.error(err));
