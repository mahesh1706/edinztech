const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Certificate = require('../models/Certificate');

const FeedbackRegistry = require('../models/FeedbackRegistry');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkCertificate(id) {
    console.log(`Querying "${id}":`);
    const cert = await Certificate.findOne({ certificateId: id });
    const feedback = await FeedbackRegistry.findOne({ certificateId: id });

    if (cert) {
        console.log(` -> Cert FOUND | Status: ${cert.verification.status}`);
    } else {
        console.log(` -> Cert NOT FOUND`);
    }

    if (feedback) {
        console.log(` -> Feedback FOUND | Name: ${feedback.name} | Flag: ${feedback.feedbackFlag}`);
    } else {
        console.log(` -> Feedback NOT FOUND`);
    }
}

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const idsToCheck = [
            // Check for normalized IDs (no trailing dashes)
            'ISS-BXL-09-2022',
            'ISS--PYSQL--06--252',
            'ISS-ML-12-2022',
            'ISS-ML-12-2022-'
        ];

        for (const id of idsToCheck) {
            await checkCertificate(id);
        }

        // List top 5 certs to see what IS there
        const first5 = await Certificate.find().limit(5);
        console.log('First 5 records in DB:');
        first5.forEach(c => console.log(`- "${c.certificateId}"`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
