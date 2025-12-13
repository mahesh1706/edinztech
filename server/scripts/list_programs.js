const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Program = require('../models/Program');

const listPrograms = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const targetId = '693c31cf8266638789640d9d';
        console.log(`Checking for Program ID: ${targetId}`);
        const p = await Program.findById(targetId);

        if (p) {
            console.log(`FOUND: ${p.title} (Type: ${p.type})`);
        } else {
            console.log("NOT FOUND. Listing all others:");
            const programs = await Program.find({});
            programs.forEach(prog => console.log(`[${prog._id}] ${prog.title}`));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

listPrograms();
