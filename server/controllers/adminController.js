const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');
const { sendEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const eventBus = require('../events/eventBus');
const { encrypt, decrypt } = require('../utils/encryption');

const inviteStudent = async (req, res) => {
    try {
        const { email, phone, programId } = req.body;

        if (!email || !programId) {
            return res.status(400).json({ message: 'Email and Program ID are required' });
        }

        // 1. Verify Program
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // 2. Check User
        let user = await User.findOne({ email });
        let isNewUser = false;
        let passwordString = '';

        if (!user) {
            isNewUser = true;
            passwordString = crypto.randomBytes(4).toString('hex'); // 8 char hex
            const username = email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);

            user = await User.create({
                name: username,
                email,
                phone,
                password: passwordString, // Pre-hash handled by model? Need to check.
                // User model hash password in pre-save hook? YES, checked in step 250.
                encryptedPassword: encrypt(passwordString),
                role: 'student'
            });
        }

        // 3. Create Enrollment
        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ userId: user._id, programId });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'User is already enrolled in this program' });
        }

        const enrollment = await Enrollment.create({
            userId: user._id,
            programId,
            status: 'active', // Direct active for invites
            enrolledAt: Date.now()
        });

        // 4. Send Notification (Email)
        const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173/login';
        const emailSubject = `You’ve been invited to join your program at EdinzTech LMS`;
        const emailBody = `
            <h3>Hello ${user.name},</h3>
            <p>You have been added to the program: <strong>${program.title}</strong></p>
            <p>Login here: <a href="${loginUrl}">${loginUrl}</a></p>
            ${isNewUser ? `
            <p><strong>Your Login Credentials:</strong></p>
            <p>Username: ${email}</p>
            <p>Password: ${passwordString}</p>
            <p><em>Please change your password after logging in.</em></p>
            ` : `<p>You can login with your existing credentials.</p>`}
        `;

        // Send Email (Soft Fail)
        let emailSent = false;
        try {
            // Check if email creds are real
            if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@')) {
                const info = await sendEmail(user.email, emailSubject, emailBody);
                if (info) emailSent = true;
            } else {
                console.log("Skipping email send: Mock credentials detected.");
            }
        } catch (emailError) {
            console.error("Failed to send invite email (Non-fatal):", emailError);
        }

        // 5. Trigger Event
        eventBus.emit('USER_INVITED', { user, program, enrollment });

        res.status(201).json({
            success: true,
            message: emailSent ? 'Invitation sent successfully' : 'User enrolled (Email skipped - Config missing)',
            userId: user._id,
            programId
        });

    } catch (error) {
        console.error("Invite Error Details:", error);
        res.status(500).json({ message: 'Server Error inviting student: ' + error.message });
    }
};

const getEnrollments = async (req, res) => {
    try {
        console.log('[DEBUG] getEnrollments called'); // Debug Log
        const { type, programId, search } = req.query;

        let query = {};

        // Filter by Program Type
        if (type && type !== 'All') {
            query.programType = type;
        }

        // Filter by Specific Program
        if (programId) {
            query.programId = programId;
        }

        console.log('[DEBUG] Query:', query); // Debug Log

        // Fetch Enrollments with populated data
        // We need deep population: user, program, and payment info
        const enrollments = await Enrollment.find(query)
            .populate('user', 'name email phone userCode')
            .populate('program', 'title type fee')
            .populate('paymentId', 'amount status')
            .sort({ createdAt: -1 });

        console.log(`[DEBUG] Found ${enrollments.length} enrollments`); // Debug Log

        // Auto-fix: Check for missing userCodes and generate them on the fly
        // This ensures the table never shows N/A for valid users
        const updates = [];
        try {
            for (const enrollment of enrollments) {
                if (enrollment.user && !enrollment.user.userCode) {
                    // Generate code
                    if (!enrollment.user.userCode) {
                        // WARNING: saving a partial document (populated with select) can be risky.
                        // Skipping save for reliability during debug.
                        // enrollment.user.userCode = generateUserCode();
                        // updates.push(enrollment.user.save());
                        console.warn(`[DEBUG] Skipping auto-fix for user ${enrollment.user._id} due to partial doc risk.`);
                    }
                }
            }
            if (updates.length > 0) {
                await Promise.all(updates);
                console.log(`[Admin] Backfilled userCodes for ${updates.length} users in enrollment list.`);
            }
        } catch (autoFixError) {
            console.error('[DEBUG] Auto-fix failed:', autoFixError);
        }

        // Search Logic (Done in memory for simplicity/performance on populated fields)
        let results = enrollments;
        if (search) {
            const searchLower = search.toLowerCase();
            results = enrollments.filter(e =>
                (e.user?.name?.toLowerCase().includes(searchLower)) ||
                (e.user?.email?.toLowerCase().includes(searchLower)) ||
                (e.program?.title?.toLowerCase().includes(searchLower))
            );
        }

        // Format for frontend
        const formatted = results.map(e => ({
            _id: e._id, // Enrollment ID
            userId: e.user?._id, // Student User ID for actions
            userCode: e.userCode || e.user?.userCode || 'N/A', // Denormalized > Populated
            studentName: e.user?.name || 'Unknown',
            email: e.user?.email || 'Unknown',
            phone: e.user?.phone || 'N/A',
            programName: e.program?.title || 'Unknown',
            programType: e.programType || e.program?.type || 'N/A',
            amount: e.paymentId?.amount ? `₹${e.paymentId.amount}` : (e.program?.fee ? `₹${e.program.fee}` : 'Free'),
            status: e.paymentId?.status || 'Active', // Fallback
            enrolledAt: e.enrolledAt
        }));

        res.json(formatted);

    } catch (error) {
        console.error("Get Enrollments Error:", error);
        res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
};

const AccessLog = require('../models/AccessLog');
// const { decrypt } = require('../utils/encryption'); // Removed redundant import

const getStudentCredentials = async (req, res) => {
    try {
        const { studentId, adminPassword } = req.body;
        const adminUser = await User.findById(req.user._id).select('+password');

        if (!adminUser || !await adminUser.matchPassword(adminPassword)) {
            return res.status(401).json({ message: 'Invalid Admin Password' });
        }

        const student = await User.findById(studentId).select('+encryptedPassword');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        let decryptedPassword = 'Not Available';
        if (student.encryptedPassword) {
            try {
                decryptedPassword = decrypt(student.encryptedPassword);
            } catch (decErr) {
                console.error("Decryption Failed for user:", student._id, decErr);
                decryptedPassword = "Error: Decryption Failed";
            }
        }

        // Audit Log
        await AccessLog.create({
            adminId: req.user._id,
            targetUserId: student._id,
            action: 'VIEW_CREDENTIALS',
            ipAddress: req.ip,
            metadata: { userCode: student.userCode }
        });

        res.json({
            userCode: student.userCode || 'N/A',
            username: student.email,
            password: decryptedPassword
        });

    } catch (error) {
        console.error("Get Credentials Error:", error);
        res.status(500).json({ message: 'Failed to retrieve credentials' });
    }
};

// ... existing code ...

const resendCredentials = async (req, res) => {
    try {
        const { studentId, adminPassword } = req.body;
        const adminUser = await User.findById(req.user._id).select('+password');

        if (!adminUser || !await adminUser.matchPassword(adminPassword)) {
            return res.status(401).json({ message: 'Invalid Admin Password' });
        }

        const student = await User.findById(studentId).select('+encryptedPassword');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        let decryptedPassword = 'Not Available';
        if (student.encryptedPassword) {
            decryptedPassword = decrypt(student.encryptedPassword);
        }

        // Send Email
        const emailSent = await sendEmail({
            to: student.email,
            subject: 'Login Credentials (Resent) - EdinzTech',
            html: `<h3>Login Credentials</h3>
                   <p>Hello ${student.name},</p>
                   <p>Here are your login details as requested:</p>
                   <p><b>Username:</b> ${student.email}</p>
                   <p><b>Password:</b> ${decryptedPassword}</p>
                   <p><a href="${process.env.FRONTEND_URL}/login">Login Here</a></p>`
        });

        if (emailSent) {
            res.json({ message: 'Credentials sent successfully to ' + student.email });
        } else {
            res.status(500).json({ message: 'Failed to send email. Check server logs.' });
        }

    } catch (error) {
        console.error("Resend Credentials Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    inviteStudent,
    getEnrollments,
    getStudentCredentials,
    resendCredentials
};
