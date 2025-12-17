const mongoose = require('mongoose');
const Program = require('./models/Program');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    const programs = await Program.find({}, 'title _id');
    console.log("Programs:");
    programs.forEach(p => {
        console.log(`${p.title}: ${p._id}`);
    });

    await mongoose.disconnect();
}).catch(err => console.error(err));
