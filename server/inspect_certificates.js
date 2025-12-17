const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    // Dump all certificates for this program
    const certs = await Certificate.find({ program: '6941653c6ada56863d916455' });
    console.log(`Certificates for program 6941653c6ada56863d916455: ${certs.length}`);

    certs.forEach(c => {
        console.log(`Cert ID: ${c.certificateId}`);
        console.log(`User Field: ${c.user} (Type: ${typeof c.user})`);
        console.log(`User ID (String): ${c.user.toString()}`);
        console.log(`Status: ${c.status}`);
        console.log('---');
    });

    await mongoose.disconnect();
}).catch(err => console.error(err));
