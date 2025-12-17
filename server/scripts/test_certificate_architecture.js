const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require(path.join(__dirname, '../models/User'));
const Enrollment = require(path.join(__dirname, '../models/Enrollment'));
const Certificate = require(path.join(__dirname, '../models/Certificate'));
const Program = require(path.join(__dirname, '../models/Program'));
const { publishCertificates } = require(path.join(__dirname, '../controllers/certificateController'));

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const runTest = async () => {
    await connectDB();

    console.log("--- Starting Certificate Architecture Test ---");

    // 1. Setup Data
    const program = await Program.findOne();
    const user = await User.findOne({ role: 'student' });

    if (!program || !user) {
        console.error("Missing Program or User for test");
        process.exit(1);
    }

    // Ensure Enrollment
    let enrollment = await Enrollment.findOne({ user: user._id, program: program._id });
    if (!enrollment) {
        enrollment = await Enrollment.create({
            user: user._id,
            program: program._id,
            status: 'completed',
            programType: 'Course'
        });
        console.log("Created Mock Enrollment");
    } else {
        enrollment.status = 'completed';
        await enrollment.save();
    }

    // Clear existing certs for clean test
    await Certificate.deleteMany({ user: user._id, program: program._id });

    // 2. Trigger Publish (Controller)
    const req = {
        params: { id: program._id }
    };
    const res = {
        json: (data) => console.log(`[Controller Response]`, data),
        status: (code) => ({
            json: (data) => console.log(`[Controller Error ${code}]`, data)
        })
    };

    console.log(`Triggering for User: ${user.email}, Program: ${program.title}`);
    await publishCertificates(req, res);

    // 3. Poll for Status Update
    console.log("--- Polling for Status Update (Pending -> Sent) ---");
    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(async () => {
        attempts++;
        const cert = await Certificate.findOne({ user: user._id, program: program._id });

        if (cert) {
            console.log(`[Attempt ${attempts}] Status: ${cert.status}`);
            if (cert.status === 'sent') {
                console.log("SUCCESS: Certificate status updated to 'sent' via webhook!");
                clearInterval(interval);
                process.exit(0);
            } else if (cert.status === 'failed') {
                console.log("FAILURE: Certificate status is 'failed'. Check service logs.", cert.error);
                clearInterval(interval);
                process.exit(1);
            }
        } else {
            console.log(`[Attempt ${attempts}] Certificate not found yet...`);
        }

        if (attempts >= maxAttempts) {
            console.log("TIMEOUT: Status did not update to 'sent' in time.");
            clearInterval(interval);
            process.exit(1);
        }
    }, 2000); // Check every 2 seconds
};

runTest();
