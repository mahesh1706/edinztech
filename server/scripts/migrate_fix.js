const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Certificate = require('../models/Certificate');
const InspireRegistry = require('../models/InspireRegistry');
const FeedbackRegistry = require('../models/FeedbackRegistry'); // Added FeedbackRegistry
const Course = require('../models/Course'); // Added Course model
const { normalizeCertId } = require('../utils/normalization');

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
    // Try ISO/Datetime
    else {
        date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) return null;
    return date;
};

const migrateFix = async () => {
    await connectDB();

    try {
        console.log('!!! WARNING: DROPPING EXISTING COLLECTIONS !!!');
        try {
            await Certificate.collection.drop();
            await InspireRegistry.collection.drop();
            await FeedbackRegistry.collection.drop();
            await Course.collection.drop();
            console.log('Collections dropped. Starting fresh import.');
        } catch (e) {
            console.log('Collections clear (partial/fresh start).');
        }

        const certFile = path.join(__dirname, '../temp/certificateId.csv');
        const inspireFile = path.join(__dirname, '../temp/Inspire_Id.csv');
        const coursesFile = path.join(__dirname, '../temp/Course_list.csv'); // Added Course filePath

        // 0. Import Courses (New)
        if (fs.existsSync(coursesFile)) {
            const courseWorkbook = XLSX.read(fs.readFileSync(coursesFile), { type: 'buffer' });
            const courseSheet = courseWorkbook.Sheets[courseWorkbook.SheetNames[0]];
            const courseRecords = XLSX.utils.sheet_to_json(courseSheet);

            console.log(`Processing ${courseRecords.length} Courses from Course_list.csv...`);

            for (const rec of courseRecords) {
                if (!rec.course_id) continue;

                await Course.create({
                    courseId: rec.course_id.toString(),
                    title: rec.title,
                    description: rec.description,
                    duration: rec.duration,
                    timing: {
                        startDate: parseDate(rec.sdate),
                        endDate: parseDate(rec.edate),
                        startTime: rec.stime,
                        endTime: rec.etime
                    },
                    image: rec.image,
                    price: rec.price,
                    link: rec.link,
                    status: rec.status,
                    deleteFlag: rec.delete_flag
                });
            }
            console.log('Courses imported.');
        } else {
            console.warn('Course_list.csv not found. Skipping course import.');
        }

        // 1. Import Certificates (ISS IDs)
        if (!fs.existsSync(certFile)) throw new Error(`File not found: ${certFile}`);

        const certWorkbook = XLSX.readFile(certFile);
        const certSheet = certWorkbook.Sheets[certWorkbook.SheetNames[0]];
        const certRecords = XLSX.utils.sheet_to_json(certSheet);

        console.log(`Processing ${certRecords.length} Certificates from certificates_iss.csv...`);
        let certCount = 0;

        for (const record of certRecords) {
            if (!record.certificateid) continue;

            // Task 5: Safety Assertion
            if (!record.certificateid.startsWith('ISS')) {
                console.warn(`SAFETY WARNING: Certificate ID does not start with 'ISS': ${record.certificateid}`);
            }

            const newCert = new Certificate({
                certificateId: normalizeCertId(record.certificateid),
                courseName: record.coursename || "Unknown Course",
                courseId: record.courseid ? record.courseid.toString() : undefined, // Map courseId for potential linking
                timeline: {
                    startDate: parseDate(record.startdate),
                    endDate: parseDate(record.enddate),
                    duration: record.duration
                },
                verification: {
                    // Logic Correction: Legacy CSV uses '0' for active/valid (delete_flag logic)
                    // Prompt said 1, but data shows 0. Switching to 0 = valid to match reality.
                    status: (record.flag == 0 || record.flag == '0') ? 'valid' : 'revoked',
                    source: 'legacy'
                },
                files: {
                    legacyPath: record.cpath
                },
                audit: {
                    legacyMysqlId: record.id,
                    migratedAt: new Date()
                }
            });
            try {
                await newCert.save();
                certCount++;
            } catch (err) {
                if (err.code === 11000) {
                    console.warn(`Duplicate certificateId skipped: ${normalizeCertId(record.certificateid)}`);
                } else {
                    throw err;
                }
            }
        }
        console.log(`Imported ${certCount} Certificates.`);

        // 2. Import Inspire Registry (Student Data)
        const studentCsvPath = path.join(__dirname, '../temp/Inspire_Id.csv');
        if (!fs.existsSync(studentCsvPath)) throw new Error(`File not found: ${studentCsvPath}`);

        const studentWorkbook = XLSX.readFile(studentCsvPath);
        const studentSheet = studentWorkbook.Sheets[studentWorkbook.SheetNames[0]];
        const studentRecords = XLSX.utils.sheet_to_json(studentSheet);

        console.log(`Processing ${studentRecords.length} Student Records from inspire_registry.csv...`);
        let studentCount = 0;

        for (const record of studentRecords) {
            if (!record.inspire_id) continue;

            // Check duplicate invite_id ? Schema has unique index.
            // Some students might have multiple entries? Schema says unique inspireId.
            // If inspire_id is the foreign key to certificateId, it should be unique PER CERTIFICATE.
            // So we just insert.

            try {
                const newStudent = new InspireRegistry({
                    inspireId: normalizeCertId(record.inspire_id), // This matches certificateId
                    name: record.name,
                    email: record.email,
                    mobile: record.mobile,
                    institution: record.institution,
                    legacyId: record.id,
                    rawMetadata: record
                });
                await newStudent.save();
                studentCount++;
            } catch (e) {
                if (e.code === 11000) {
                    // Duplicate inspireId, skip or log
                    // console.warn(`Duplicate inspireId skipped: ${record.inspire_id}`);
                } else {
                    console.error(`Error saving student ${record.inspire_id}:`, e.message);
                }
            }
        }
        console.log(`Imported ${studentCount} Student Records.`);

        // 4. Import Feedback Registry (Priority Identity Source)
        const feedbackPath = path.join(__dirname, '../temp/feedback.csv');
        let feedbackCount = 0;
        if (fs.existsSync(feedbackPath)) {
            const feedbackWorkbook = XLSX.readFile(feedbackPath);
            const feedbackSheet = feedbackWorkbook.Sheets[feedbackWorkbook.SheetNames[0]];
            const feedbackRecords = XLSX.utils.sheet_to_json(feedbackSheet);

            console.log(`Processing ${feedbackRecords.length} Feedback Records from feedback.csv...`);

            for (const record of feedbackRecords) {
                if (!record.certificateid && !record.inspireid) continue;

                // normalize IDs
                const normCertId = normalizeCertId(record.certificateid);
                const normInspireId = normalizeCertId(record.inspireid);

                // Skip if no useful ID
                if (!normCertId && !normInspireId) continue;

                const newFeedback = new FeedbackRegistry({
                    certificateId: normCertId,
                    inspireId: normInspireId,
                    name: record.name || "Unknown Student",
                    email: record.email,
                    mobile: record.mobile,
                    institution: record.institution,
                    courseName: record.coursename,
                    courseId: record.courseid,
                    startDate: record.startdate ? parseDate(record.startdate) : undefined,
                    endDate: record.enddate ? parseDate(record.enddate) : undefined,
                    duration: record.duration,
                    feedbackFlag: record.flag,
                    place: record.place,
                    state: record.state,
                    comment: record.comment,
                    createdAt: record.createdate ? parseDate(record.createdate) : undefined
                });

                try {
                    await newFeedback.save();
                    feedbackCount++;
                } catch (err) {
                    console.warn(`Feedback import warning: ${err.message}`);
                }
            }
            console.log(`Imported ${feedbackCount} Feedback Records.`);
        } else {
            console.warn('feedback.csv not found, skipping feedback import.');
        }

        console.log('Migration Complete.');
        process.exit(0);

    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
};

migrateFix();
