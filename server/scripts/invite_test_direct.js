const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { inviteStudent } = require('../controllers/adminController');
const Program = require('../models/Program');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Find a program
    const program = await Program.findOne({ isArchived: false });
    if (!program) {
        console.log("No program found.");
        process.exit();
    }
    console.log(`Using program: ${program.title} (${program._id})`);

    const fs = require('fs');
    const originalLog = console.log;
    console.log = function(...args) {
        originalLog(...args);
        const msg = args.join(' ');
        if (msg.includes('[DEBUG] Invite Password:')) {
             fs.writeFileSync('server/scripts/temp_creds.txt', `Email: ${email}\nPassword: ${msg.split(':')[1].trim()}`);
        }
    };

    const email = `teststudent_${Date.now()}@example.com`;
    console.log("Test Email:", email);
    const req = {
        body: {
            programId: program._id,
            email: email,
            name: "Test Student",
            phone: "1234567890",
            year: "1",
            department: "CSE",
            institutionName: "Test Inst",
            city: "Test City",
            state: "Test State",
            pincode: "123456"
        },
        user: { _id: "admin_dummy_id" } // Mock admin user if needed (not used in inviteStudent logic except maybe logs)
    };

    const res = {
        status: (code) => ({
            json: (data) => console.log(`Response ${code}:`, data)
        }),
        json: (data) => console.log(`Response 200:`, data)
    };

    await inviteStudent(req, res);
    
    // We cannot capture the password from here unless we modified controller to return it or write it.
    // But I modified controller to console.log it.
    // And I can't see console log.
    
    // Wait! logic flaw.
    // I can't capture the console.log from the controller INSIDE the script calling it, 
    // UNLESS I hijack console.log.
    
    const fs = require('fs');
    // I'll intercept console.log
    const originalLog = console.log;
    console.log = function(...args) {
        originalLog(...args);
        const msg = args.join(' ');
        if (msg.includes('Invite Password:')) {
             fs.writeFileSync('server/scripts/temp_creds.txt', `Email: ${email}\nPassword: ${msg.split(':')[1].trim()}`);
        }
    };

    setTimeout(() => {
        process.exit();
    }, 2000);
};

run();
```
