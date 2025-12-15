const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' }); // Adjust path if needed

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'balaji@gmail.com' });
        if (user) {
            console.log('User Found:', JSON.stringify(user.toJSON(), null, 2));
            console.log('Specific Fields:');
            console.log('Year:', user.year);
            console.log('Dept:', user.department);
            console.log('RegNo:', user.registerNumber);
            console.log('Inst:', user.institutionName);
        } else {
            console.log('User not found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
