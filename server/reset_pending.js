const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    // Update ALL certs (Blanket Reset for Dev)
    const result = await Certificate.updateMany(
        {},
        { $set: { status: 'pending' } }
    );

    console.log(`Reset ${result.modifiedCount} certificates to 'pending' status.`);

    // Safety check: count how many are now pending
    const count = await Certificate.countDocuments({ program: programId, status: 'pending' });
    console.log(`Verification: ${count} certificates are now pending.`);

    await mongoose.disconnect();
}).catch(err => console.error(err));
