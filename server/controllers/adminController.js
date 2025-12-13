const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Program = require('../models/Program');
const sendEmail = require('../services/emailService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const eventBus = require('../events/eventBus');

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

        // Fetch Enrollments with populated data
        // We need deep population: user, program, and payment info
        const enrollments = await Enrollment.find(query)
            .populate('user', 'name email phone userCode')
            .populate('program', 'title type fee')
            .populate('paymentId', 'amount status')
            .sort({ createdAt: -1 });

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
const { decrypt } = require('../utils/encryption');

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
            decryptedPassword = decrypt(student.encryptedPassword);
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

module.exports = {
    inviteStudent,
    getEnrollments,
    getStudentCredentials
};
