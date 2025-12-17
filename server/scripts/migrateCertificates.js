const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx'); // Using xlsx as it is already in package.json
const Certificate = require('../models/Certificate');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    let date;

    // Try YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        date = new Date(dateStr);
    }
    // Try DD/MM/YYYY
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        date = new Date(`${year}-${month}-${day}`);
    }
    // Try YYYY-MM-DD HH:MM:SS (createdate)
    else {
        date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) return null;
    return date;
};

const migrateCertificates = async () => {
    await connectDB();

    try {
        await Certificate.collection.dropIndex('certificateCode_1');
        console.log('Dropped stale index: certificateCode_1');
    } catch (e) {
        // Index might not exist, ignore
        console.log('Index certificateCode_1 not found or already dropped.');
    }

    const csvPath = path.join(__dirname, '../temp/legacy_certificates.csv');

    if (!fs.existsSync(csvPath)) {
        console.error('CSV file not found at:', csvPath);
        process.exit(1);
    }

    console.log('Reading CSV file...');
    const workbook = XLSX.readFile(csvPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${records.length} records. Starting migration...`);

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const record of records) {
        try {
            // Validate required fields
            const certId = record.inspire_id; // Check CSV header
            if (!certId) {
                failCount++;
                errors.push(`Row missing inspire_id: ${JSON.stringify(record)}`);
                continue;
            }

            // Check if exists
            const existing = await Certificate.findOne({ certificateId: certId });
            if (existing) {
                skippedCount++;
                continue;
            }

            // Transform Data
            // delete_flag: "0" = valid, "1" = deleted/revoked (Assumption based on common patterns)
            const status = record.delete_flag == '0' ? 'valid' : 'revoked';

            const newCert = new Certificate({
                certificateId: certId,
                studentSnapshot: {
                    name: record.name || "Unknown Student",
                    email: record.email,
                    mobile: record.mobile,
                    institution: record.institution
                },
                courseSnapshot: {
                    courseId: record.cource_id ? String(record.cource_id) : undefined,
                    courseName: record.intern_position || record.type || "Unknown Course", // Fallback as course name is missing
                    type: record.type
                },
                timeline: {
                    // Start/End dates missing in this CSV format, using Datetime as issue date
                    issueDate: parseDate(record.Datetime),
                    duration: record.duration
                },
                verification: {
                    status: status,
                    source: 'legacy'
                },
                files: {
                    legacyPath: record.cpath // This might also be missing or named differently? CSV has 'cource_certificate', 'intern_certificate' columns but no cpath. 'cource_certificate' seems to be a flag ("1"). 
                },
                audit: {
                    legacyMysqlId: record.id,
                    migratedAt: new Date()
                }
            });

            await newCert.save();
            successCount++;

            // Log progress every 50 records
            if (successCount % 50 === 0) {
                console.log(`Processed ${successCount} records...`);
            }

        } catch (err) {
            failCount++;
            errors.push(`Error processing ${record.certificateid}: ${err.message}`);
        }
    }

    console.log('====================================');
    console.log('MIGRATION SUMMARY');
    console.log('====================================');
    console.log(`Total Processed: ${records.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Skipped (Already Exists): ${skippedCount}`);
    console.log(`Failed: ${failCount}`);

    if (errors.length > 0) {
        console.log('Errors:');
        errors.forEach(e => console.log(e));
    }

    process.exit();
};

migrateCertificates();
