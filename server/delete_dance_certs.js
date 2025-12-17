const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    // Program ID 'dance' from screenshot
    const programId = '6941653c6ada56863d916455';

    // HARD DELETE to ensure !exists logic triggers
    const result = await Certificate.deleteMany({ program: programId });

    console.log(`Deleted ${result.deletedCount} certificates for Program ${programId}.`);

    await mongoose.disconnect();
}).catch(err => console.error(err));
