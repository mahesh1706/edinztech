const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const fixEnrollments = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected.');

        // Access the raw collection
        const collection = mongoose.connection.collection('enrollments');

        console.log('Running migration to fix userId/programId mismatch...');

        // Update documents that have userId but missing or null user
        const result = await collection.updateMany(
            { $or: [{ userId: { $exists: true } }, { programId: { $exists: true } }] },
            [
                {
                    $set: {
                        user: { $ifNull: ["$user", "$userId"] },
                        program: { $ifNull: ["$program", "$programId"] }
                    }
                },
                {
                    $unset: ["userId", "programId"]
                }
            ]
        );

        console.log(`Migration Complete.`);
        console.log(`Matched & Modified: ${result.modifiedCount} documents.`);
        console.log(`(If 0, then all documents were already correct)`);

    } catch (error) {
        console.error('Migration Failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

fixEnrollments();
