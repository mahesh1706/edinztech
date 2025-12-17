const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    // Program ID 'jhkjchzkxczx' from screenshot popup
    const programId = '693cd63002007301c03127bf';

    // HARD DELETE
    const result = await Certificate.deleteMany({ program: programId });

    console.log(`Deleted ${result.deletedCount} certificates for Program ${programId}.`);

    await mongoose.disconnect();
}).catch(err => console.error(err));
