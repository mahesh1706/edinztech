const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');

const verifyFix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Get the known valid program 'aiml'
        const program = await Program.findOne({ title: { $regex: 'aiml', $options: 'i' } });
        if (!program) {
            console.log("Could not find 'aiml' program. Cannot verify.");
            return;
        }
        console.log(`Found Valid Program: ${program.title} (${program._id})`);

        // 2. Create a temporary user
        const email = `fix_test_${Date.now()}@test.com`;
        const user = await User.create({
            name: 'Fix Verify User',
            email: email,
            password: 'password123'
        });
        console.log(`Created User: ${user.name}`);

        // 3. Create Enrollment
        const enrollment = await Enrollment.create({
            user: user._id,
            program: program._id,
            status: 'active',
            programType: program.type
        });
        console.log(`Created Enrollment: ${enrollment._id}`);

        // 4. Populate and Check
        const fetched = await Enrollment.findById(enrollment._id).populate('program');
        console.log(`Fetched Program Title: ${fetched.program ? fetched.program.title : 'UNKNOWN (FAIL)'}`);

        if (fetched.program && fetched.program.title === program.title) {
            console.log("SUCCESS: Enrollment correctly links to Program.");
        } else {
            console.log("FAILURE: Enrollment does not link to Program.");
        }

        // Cleanup
        await Enrollment.deleteOne({ _id: enrollment._id });
        await User.deleteOne({ _id: user._id });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

verifyFix();
