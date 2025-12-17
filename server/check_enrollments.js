const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/edinztech_lms').then(async () => {
    console.log("Connected to DB");
    const enrollments = await Enrollment.find({
        program: '6941653c6ada56863d916455',
        // status: { $in: ['active', 'completed'] }
    }).populate('user');

    console.log('Enrollments found:', enrollments.length);
    enrollments.forEach(e => {
        console.log(`Enrollment ${e._id}: Status=${e.status}, User ID=${e.user._id}, Program ID=${e.program}`);
        if (!e.user) console.log('Missing user for enrollment:', e._id);
    });

    await mongoose.disconnect();
}).catch(err => console.error(err));
