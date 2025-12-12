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

module.exports = {
    inviteStudent
};
