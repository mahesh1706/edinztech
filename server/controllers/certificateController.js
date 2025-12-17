const asyncHandler = require('express-async-handler');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');
const User = require('../models/User'); // Ensure User model is loaded
const InspireRegistry = require('../models/InspireRegistry');
const FeedbackRegistry = require('../models/FeedbackRegistry'); // Added
const Course = require('../models/Course'); // Added Course model
const { normalizeCertId } = require('../utils/normalization');

// @desc    Publish certificates for a program
// @route   POST /api/admin/programs/:id/publish-certificates
// @access  Private/Admin
const axios = require('axios'); // Add axios
const QRCode = require('qrcode'); // New Architecture


// @desc    Publish certificates for a program (Trigger Service)
// @route   POST /api/admin/programs/:id/publish-certificates
// @access  Private/Admin
const publishCertificates = asyncHandler(async (req, res) => {
    const programId = req.params.id;
    const CERT_SERVICE_URL = process.env.CERT_SERVICE_URL || 'http://localhost:5002/api/generate';
    const CALLBACK_URL = process.env.CALLBACK_BASE_URL
        ? `${process.env.CALLBACK_BASE_URL}/api/webhooks/certificate-status`
        : `http://localhost:5000/api/webhooks/certificate-status`;

    // 1. Verify Program
    const program = await Program.findById(programId);
    if (!program) {
        res.status(404);
        throw new Error('Program not found');
    }

    // 2. Find Active/Completed Enrollments
    const enrollments = await Enrollment.find({
        program: programId,
        status: { $in: ['active', 'completed'] }
    }).populate('user', 'name email registerNumber year institutionName');

    if (enrollments.length === 0) {
        res.status(400);
        throw new Error('No enrolled students found for this program');
    }

    let triggeredCount = 0;
    let failedCount = 0;
    const errors = [];

    // 3. Process Each Enrollment
    for (const enrollment of enrollments) {
        try {
            const user = enrollment.user;
            if (!user) continue;

            // Check availability (Idempotency)
            const exists = await Certificate.findOne({
                user: user._id,
                program: programId
            });
            console.log(`[DEBUG] User: ${user.email}, Exists: ${!!exists}, Status: ${exists ? exists.status : 'null'}`);

            if (!exists || exists.status === 'failed' || exists.status === 'pending') {
                // NEW ARCHITECTURE: Generate EDZ- format ID
                const year = new Date().getFullYear();
                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                const certificateId = `EDZ-CERT-${year}-${user._id.toString().slice(-4)}${randomSuffix}`;

                // Generate Local QR (URL for standard cameras)
                const verifyUrl = process.env.FRONTEND_URL
                    ? `${process.env.FRONTEND_URL}/verify?id=${certificateId}`
                    : `http://localhost:5173/verify?id=${certificateId}`;

                const qrData = verifyUrl;
                const qrCodeImage = await QRCode.toDataURL(qrData);

                let certDoc;
                if (!exists) {
                    certDoc = await Certificate.create({
                        user: user._id,
                        program: programId,
                        certificateId: certificateId,
                        qrCode: qrCodeImage, // Store Base64
                        courseName: program.title,
                        timeline: {
                            startDate: program.startDate,
                            endDate: program.endDate,
                            duration: program.duration
                        },
                        verification: {
                            status: 'valid',
                            source: 'new'
                        },
                        status: 'pending', // Pending PDF generation
                        audit: {
                            migratedAt: Date.now()
                        }
                    });
                } else {
                    certDoc = exists;
                    certDoc.status = 'pending';
                    certDoc.error = undefined;

                    // BACKFILL/UPDATE: Ensure required fields are present
                    // Even if ID is EDZ, we must ensure new schema fields exist
                    if (!certDoc.certificateId.startsWith('EDZ-')) {
                        certDoc.certificateId = certificateId;
                        certDoc.qrCode = qrCodeImage;
                    }

                    // Always update/ensure these required fields
                    certDoc.courseName = program.title;
                    if (!certDoc.verification || !certDoc.verification.status) {
                        certDoc.verification = { status: 'valid', source: 'new' };
                    }
                    // Always update QR to ensure it points to the valid URL
                    certDoc.qrCode = qrCodeImage;

                    await certDoc.save();
                }

                // Success: Certificate is Issued in DB (Verifiable regardless of PDF)
                triggeredCount++;

                // Call Microservice for PDF Generation (Non-blocking for "Count")
                try {
                    await axios.post(CERT_SERVICE_URL, {
                        studentData: {
                            name: user.name,
                            email: user.email,
                            id: user._id,
                            registerNumber: user.registerNumber || '',
                            year: user.year || '',
                            institutionName: user.institutionName || ''
                        },
                        courseData: {
                            title: program.title,
                            id: program._id
                        },
                        certificateId: certDoc.certificateId,
                        callbackUrl: CALLBACK_URL,
                        templateId: program.certificateTemplate || 'default',
                        // PASS QR CODE TO SERVICE
                        qrCode: qrCodeImage
                    });
                } catch (err) {
                    console.error(`PDF Service Warning for ${user.email}:`, err.message);
                    // Note: We do NOT mark status as failed. The cert IS valid and verifiable. 
                    // We just record the PDF trigger error if we want, or leave it valid.
                    // Keeping it 'valid' in verification.source means it verifies.
                    // Maybe update metadata about PDF failure?
                    if (certDoc.status === 'pending') {
                        // Keep pending if you strictly need PDF, OR set to valid?
                        // Requirement: "Verification API... If found -> return verified payload"
                        // So DB presence = Valid.
                        // We'll leave it as is (pending PDF), but the Verification API checks 'verification.status', not root 'status'.
                        // My update set verification.status = 'valid'. So it works!
                    }
                }
            }

        } catch (innerErr) {
            console.error(`Processing Error for enrollment ${enrollment._id}:`, innerErr);
            failedCount++;
            errors.push(innerErr.message);
        }
    }

    res.json({
        success: true,
        message: `Processed. Issued: ${triggeredCount}, Failed: ${failedCount}. [Debug: Prog ${programId}, Found ${enrollments.length}, FirstStatus: ${enrollments.length > 0 ? 'Checked' : 'None'}]`,
        triggered: triggeredCount,
        failed: failedCount,
        errors: errors.length > 0 ? errors : undefined
    });
});

// @desc    Get my certificates
// @route   GET /api/certificates/me
// @access  Private
const getMyCertificates = asyncHandler(async (req, res) => {
    const certificates = await Certificate.find({ user: req.user._id })
        .populate('program', 'title type');
    res.json(certificates);
});

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:code
// @access  Public
// @desc    Verify a certificate
// @route   GET /api/certificates/verify/:code
// @access  Public
const verifyCertificate = asyncHandler(async (req, res) => {
    // 1. Normalize Input ID
    const normalizedId = normalizeCertId(req.params.code);

    // 2. Find Certificate ONLY in `certificates` using certificateId
    const certificate = await Certificate.findOne({ certificateId: normalizedId })
        .populate('user')
        .populate('program'); // Populate for CertificateView

    if (!certificate) {
        res.status(404);
        throw new Error('Invalid Certificate ID');
    }

    // 2. Join FeedbackRegistry (Priority 1 for Student Identity)
    const feedbackData = await FeedbackRegistry.findOne({ certificateId: normalizedId });

    // 3. Join inspire_registry (Priority 2 / Legacy Fallback)
    const inspireData = await InspireRegistry.findOne({ inspireId: certificate.certificateId });

    // 4. Join Course (Optional enrichment)
    let enrichedCourse = null;
    if (certificate.courseId) {
        enrichedCourse = await Course.findOne({ courseId: certificate.courseId });
    }

    // Determine Student Name (Priority: Feedback -> Inspire -> Fallback)
    let studentName = "Student details not available (legacy record)";
    if (feedbackData && feedbackData.name) {
        studentName = feedbackData.name;
    } else if (inspireData && inspireData.name) {
        studentName = inspireData.name;
    } else if (certificate.user && certificate.user.name) {
        studentName = certificate.user.name; // Fallback to relational user
    }

    const isValid = certificate.verification.status === 'valid';

    // Legacy PHP Behavior: "Certificate Successfully Verified !"
    const statusText = isValid ? "Certificate Successfully Verified !" : "Certificate Revoked";

    const response = {
        valid: isValid,
        certificateId: certificate.certificateId,

        // Student Identity (Resolved via Priority Logic)
        studentName: studentName,

        // Course Data: Prefer enriched title, fallback to snapshot
        courseName: enrichedCourse ? enrichedCourse.title : certificate.courseName,
        // Optional description if enriched
        description: enrichedCourse ? enrichedCourse.description : undefined,

        startDate: certificate.timeline.startDate,
        endDate: certificate.timeline.endDate,
        duration: certificate.timeline.duration,

        status: isValid ? 'valid' : 'revoked',
        statusText: statusText,
        issuedBy: "Inspiress.in", // Static as requested

        // Optional extra fields
        institution: (feedbackData && feedbackData.institution) || (inspireData && inspireData.institution) || (certificate.user && certificate.user.institutionName),
        issueDate: certificate.audit.migratedAt,

        // Full Reference for View Page
        certificate: certificate
    };

    res.json(response);
});

// @desc    Resolve Legacy QR Code to ISS ID
// @route   POST /api/certificates/resolve
// @access  Public
const resolveLegacyQR = asyncHandler(async (req, res) => {
    let { qrInput } = req.body;

    if (!qrInput) {
        res.status(400);
        throw new Error('QR Input is required');
    }

    // 1. Clean Input (Handle URLs)
    let identifier = qrInput.trim();
    try {
        if (identifier.startsWith('http')) {
            const url = new URL(identifier);
            if (url.searchParams.has('id')) {
                identifier = url.searchParams.get('id');
            } else {
                identifier = url.pathname.split('/').pop();
            }
        }
    } catch (e) {
        // Not a URL
    }

    // Normalize
    const normalizedIdentifier = normalizeCertId(identifier);

    // 2. Direct ISS Check
    if (identifier.startsWith('ISS') || (normalizedIdentifier && normalizedIdentifier.startsWith('ISS'))) {
        // If it looks like an ISS ID (even with trailing chars), valid.
        return res.json({ certificateId: normalizedIdentifier });
    }

    // 3. Feedback Registry Lookup (Priority: InspireId)
    // Note: Schema might miss legacyId if user reverted it. We check inspireId at least.
    const feedbackMatch = await FeedbackRegistry.findOne({
        $or: [
            { inspireId: normalizedIdentifier },
            // Safe lookup: checks if legacyId matches if it exists in schema/doc
            { legacyId: identifier }
        ]
    });

    if (feedbackMatch) {
        return res.json({ certificateId: feedbackMatch.certificateId });
    }

    // 4. Legacy Cert Object Lookup
    const legacyCertMatch = await Certificate.findOne({ legacyObjectId: identifier });
    if (legacyCertMatch) {
        return res.json({ certificateId: legacyCertMatch.certificateId });
    }

    // Default: Return normalized input
    return res.json({ certificateId: normalizedIdentifier });
});

// @desc    Issue New Certificate (EDZ- Format)
// @route   POST /api/certificates/issue
// @access  Private (Admin)
const issueCertificate = asyncHandler(async (req, res) => {
    const { userId, programId, issueDate, duration } = req.body;

    // 1. Validate Input
    if (!userId || !programId) {
        res.status(400);
        throw new Error('User ID and Program ID are required');
    }

    // 2. Fetch Data
    const user = await User.findById(userId);
    const program = await Program.findById(programId);

    if (!user || !program) {
        res.status(404);
        throw new Error('User or Program not found');
    }

    // 3. Generate New ID (EDZ-CERT-YYYY-XXXX)
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    const certificateId = `EDZ-CERT-${year}-${user._id.toString().slice(-4)}${randomSuffix}`;

    // 4. Generate QR Code (CERT:<ID>)
    const qrData = `CERT:${certificateId}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // 5. Create Certificate Record
    const certificate = await Certificate.create({
        certificateId,
        user: userId,
        program: programId,
        courseName: program.title, // Snapshot
        qrCode: qrCodeImage, // Store Base64
        timeline: {
            startDate: program.startDate,
            endDate: program.endDate,
            duration: duration || program.duration,
        },
        verification: {
            status: 'valid',
            source: 'new'
        },
        audit: {
            migratedAt: issueDate || Date.now()
        }
    });

    res.status(201).json(certificate);
});

// @desc    Verify New Certificate (Strict EDZ- Flow)
// @route   GET /api/new-certificates/verify/:certificateId
// @access  Public
const verifyNewCertificate = asyncHandler(async (req, res) => {
    const { certificateId } = req.params;

    // 1. Strict ID Check
    if (!certificateId.startsWith('EDZ-')) {
        res.status(400);
        throw new Error('Invalid Certificate Format. This endpoint supports new EDZ certificates only.');
    }

    // 2. Find Certificate
    const certificate = await Certificate.findOne({ certificateId })
        .populate('user', 'name email institutionName')
        .populate('program', 'title');

    if (!certificate) {
        res.status(404);
        throw new Error('Certificate Not Found');
    }

    // 3. Return Clean Payload
    const response = {
        certificateId: certificate.certificateId,
        studentName: certificate.user?.name || 'Unknown Student',
        email: certificate.user?.email, // Sensitive? Requirements asked for it.
        institution: certificate.user?.institutionName,
        programName: certificate.program?.title || certificate.courseName,
        enrolledDate: certificate.timeline?.startDate,
        issueDate: certificate.audit?.migratedAt, // or any specific issue date field if added
        duration: certificate.timeline?.duration,
        status: certificate.verification.status,
        issuedBy: "EdinzTech",
        valid: certificate.verification.status === 'valid' // Frontend expects this boolean
    };

    res.json(response);
});

// @desc    Publish Offer Letters for a program
// @route   POST /api/admin/programs/:id/publish-offer-letters
// @access  Private/Admin
const publishOfferLetters = asyncHandler(async (req, res) => {
    const programId = req.params.id;
    const CERT_SERVICE_URL = process.env.CERT_SERVICE_URL || 'http://localhost:5002/api/generate';
    const CALLBACK_URL = process.env.CALLBACK_BASE_URL
        ? `${process.env.CALLBACK_BASE_URL}/api/webhooks/certificate-status`
        : `http://localhost:5000/api/webhooks/certificate-status`;

    // 1. Verify Program
    const program = await Program.findById(programId);
    if (!program) {
        res.status(404);
        throw new Error('Program not found');
    }

    // 2. Find Active/Completed Enrollments
    const enrollments = await Enrollment.find({
        program: programId,
        status: { $in: ['active', 'completed'] }
    }).populate('user', 'name email registerNumber year institutionName department pincode city state');

    if (enrollments.length === 0) {
        res.status(400);
        throw new Error('No enrolled students found for this program');
    }

    let triggeredCount = 0;

    // 3. Trigger Service for Each
    for (const enrollment of enrollments) {
        const user = enrollment.user;
        if (!user) continue;

        // Check availability (Idempotency) - Check if Offer Letter already exists? 
        // We can reuse Certificate model but maybe distinguish by certificateId prefix or added metadata
        // For now, let's treat it as a special "Certificate" type to reuse the DB schema.
        const exists = await Certificate.findOne({
            user: user._id,
            program: programId,
            certificateId: { $regex: /^OFFER-/ } // Check for existing offer letter
        });

        if (!exists || exists.status === 'failed') {
            // Create pending record
            const certificateId = `OFFER-${program.code || 'PROG'}-${user._id.toString().slice(-4)}-${Date.now().toString().slice(-4)}`;

            let certDoc;
            if (!exists) {
                certDoc = await Certificate.create({
                    user: user._id,
                    program: programId,
                    certificateId: certificateId,
                    status: 'pending',
                    metadata: { type: 'offer-letter' } // Mark as offer letter
                });
            } else {
                certDoc = exists;
                certDoc.status = 'pending';
                certDoc.error = undefined;
                await certDoc.save();
            }

            // Call Microservice
            try {
                await axios.post(CERT_SERVICE_URL, {
                    type: 'offer-letter', // Specify type
                    studentData: {
                        name: user.name,
                        email: user.email,
                        id: user._id,
                        registerNumber: user.registerNumber || '',
                        year: user.year || '',
                        institutionName: user.institutionName || '',
                        department: user.department || '',
                        pincode: user.pincode || '',
                        city: user.city || '',
                        state: user.state || ''
                    },
                    courseData: {
                        title: program.title,
                        id: program._id,
                        startDate: program.startDate,
                        endDate: program.endDate
                    },
                    certificateId: certDoc.certificateId,
                    callbackUrl: CALLBACK_URL,
                    templateId: 'offer-letter',
                    templateUrl: program.offerLetterTemplate // Pass the actual template path (e.g., uploads/template-....docx)
                });
                triggeredCount++;
            } catch (err) {
                console.error(`Failed to trigger offer letter service for ${user.email}:`, err.message);
                certDoc.status = 'failed';
                certDoc.error = `Trigger Failed: ${err.message}`;
                await certDoc.save();
            }
        }
    }

    res.json({
        success: true,
        message: `Offer Letter generation triggered. Requests sent: ${triggeredCount}`,
        totalEnrollments: enrollments.length,
        triggered: triggeredCount
    });
});

module.exports = {
    publishCertificates,
    publishOfferLetters,
    getMyCertificates,
    verifyCertificate,
    issueCertificate,
    resolveLegacyQR,
    verifyNewCertificate
};
