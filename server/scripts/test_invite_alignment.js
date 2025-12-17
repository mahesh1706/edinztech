const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require(path.join(__dirname, '../models/User'));
const Enrollment = require(path.join(__dirname, '../models/Enrollment'));
const Program = require(path.join(__dirname, '../models/Program'));
const { inviteStudent } = require(path.join(__dirname, '../controllers/adminController'));

dotenv.config({ path: path.join(__dirname, '../.env') });

const fs = require('fs');
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) throw new Error("MONGO_URI is undefined");
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        const logPath = path.join(__dirname, 'debug_error.log');
        fs.writeFileSync(logPath, `Error: ${error.message}\nStack: ${error.stack}`);
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const runTest = async () => {
    await connectDB();

    // Mock Req/Res
    const randomSuffix = Math.floor(Math.random() * 10000);
    const testEmail = `test_invite_${randomSuffix}@example.com`;

    // Find a program
    const program = await Program.findOne();
    if (!program) {
        console.error("No programs found to test with.");
        process.exit(1);
    }
    console.log(`Using Program: ${program.title} (${program._id})`);

    const req = {
        body: {
            email: testEmail,
            programId: program._id,
            name: `Test User ${randomSuffix}`,
            phone: '1234567890',
            year: '3',
            department: 'CSE'
        }
    };

    const res = {
        status: (code) => ({
            json: (data) => console.log(`[Response ${code}]`, data)
        }),
        json: (data) => console.log(`[Response OK]`, data)
    };

    console.log("--- Inviting Student ---");
    await inviteStudent(req, res);

    console.log("--- Verifying DB ---");
    const user = await User.findOne({ email: testEmail });
    const enrollment = await Enrollment.findOne({ user: user._id, program: program._id });

    if (user) {
        console.log("User Created:", user.email);
        console.log("User Code:", user.userCode ? "PASS" : "FAIL", `(${user.userCode})`);
        console.log("Is Active:", user.isActive ? "PASS" : "FAIL");
        console.log("Role:", user.role);
    } else {
        console.error("User NOT Found!");
    }

    if (enrollment) {
        console.log("Enrollment Created:", enrollment._id);
        console.log("Source:", enrollment.source === 'invite' ? "PASS" : "FAIL", `(${enrollment.source})`);
        console.log("Valid Until:", enrollment.validUntil ? "PASS" : "FAIL", `(${enrollment.validUntil})`);
        console.log("Program Type:", enrollment.programType ? "PASS" : "FAIL", `(${enrollment.programType})`);
        console.log("User Code in Enrollment:", enrollment.userCode ? "PASS" : "FAIL");
    } else {
        console.error("Enrollment NOT Found!");
    }

    process.exit();
};

runTest();
