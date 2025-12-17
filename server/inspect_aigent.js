const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    // Program ID from user debug popup
    const programId = '69402c4b0be5b3159a693edf';

    const certs = await Certificate.find({ program: programId });
    console.log(`Found ${certs.length} certificates for Program ${programId}`);

    certs.forEach(c => {
        console.log(`ID: ${c.certificateId} | Status: '${c.status}' | User: ${c.user}`);
    });

    await mongoose.disconnect();
}).catch(err => console.error(err));
