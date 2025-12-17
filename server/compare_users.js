const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");

    const id1 = '693bf802ed29a0116cadafb6';
    const id2 = '694260b79e53c925801ebefc';

    const u1 = await User.findById(id1);
    const u2 = await User.findById(id2);

    console.log("User 1 (Found by Email search):", u1 ? `${u1.name} | ${u1.email} | ${u1._id}` : 'Not Found');
    console.log("User 2 (Found in Enrollment):  ", u2 ? `${u2.name} | ${u2.email} | ${u2._id}` : 'Not Found');

    await mongoose.disconnect();
}).catch(err => console.error(err));
