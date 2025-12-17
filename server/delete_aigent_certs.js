const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    // Program ID 'aigent' from debug popup
    const programId = '69402c4b0be5b3159a693edf';

    // HARD DELETE to ensure !exists logic triggers
    const result = await Certificate.deleteMany({ program: programId });

    console.log(`Deleted ${result.deletedCount} certificates for Program ${programId}.`);

    const count = await Certificate.countDocuments({ program: programId });
    console.log(`Verification: Remaining certificates = ${count}`);

    await mongoose.disconnect();
}).catch(err => console.error(err));
