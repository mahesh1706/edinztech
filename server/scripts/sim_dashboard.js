const mongoose = require('mongoose');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program'); // Required for populate
const Quiz = require('../models/Quiz'); // Required for queries
const FeedbackTemplate = require('../models/FeedbackTemplate'); // Required for queries
const { getDashboard } = require('../controllers/dashboardController');
const { getMyQuizzes } = require('../controllers/meQuizController');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error("DB Error:", err);
        process.exit(1);
    }
};

const verifyDashboard = async () => {
    await connectDB();

    const user = await User.findOne().sort({ createdAt: -1 });
    if (!user) { console.log('No user found'); process.exit(); }
    console.log(`Testing with User: ${user.email} (${user._id})`);

    // Simple Mock Request/Response
    const req = {
        user: { _id: user._id, name: user.name, email: user.email },
        params: {},
        query: {}
    };

    const res = {
        statusCode: 200,
        data: null,
        status: function (code) { this.statusCode = code; return this; },
        json: function (d) {
            this.data = d;
            console.log("JSON Response Received");
            return this;
        }
    };

    try {
        console.log('--- Calling getDashboard ---');
        await getDashboard(req, res);
        console.log(JSON.stringify(res.data, null, 2));

        if (res.data.programs && res.data.programs.length > 0) {
            console.log('✅ Dashboard returns programs.');
        } else {
            console.log('⚠️ Dashboard returned no programs.');
        }

        console.log('--- Calling getMyQuizzes ---');
        await getMyQuizzes(req, res);
        console.log(JSON.stringify(res.data, null, 2));

    } catch (e) {
        console.error("Controller Error:", e);
    }

    process.exit();
};

verifyDashboard();
