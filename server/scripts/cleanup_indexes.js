const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanupIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const collection = mongoose.connection.collection('certificates');

        // List existing indexes
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Check for the problematic index 'certificateCode_1'
        const conflictingIndex = indexes.find(idx => idx.name === 'certificateCode_1');

        if (conflictingIndex) {
            console.log('Found stale index: certificateCode_1. Dropping it...');
            await collection.dropIndex('certificateCode_1');
            console.log('Successfully dropped certificateCode_1 index.');
        } else {
            console.log('Index certificateCode_1 not found. No action needed.');
        }

        console.log('Index cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning up indexes:', error);
        process.exit(1);
    }
};

cleanupIndexes();
