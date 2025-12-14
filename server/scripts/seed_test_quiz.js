const mongoose = require('mongoose');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
// Ensure models are registered
require('../models/Program'); // Fixes Schema hasn't been registered for model "Program"
const Enrollment = require('../models/Enrollment');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedQuiz = async () => {
    await connectDB();

    // Find Jayasri's enrollment
    const student = await User.findOne({ email: 'jayasrirajkumar0206@gmail.com' });
    if (!student) {
        console.log("Student not found!");
        return;
    }

    const enrollment = await Enrollment.findOne({ user: student._id }).populate('program');
    if (!enrollment) {
        console.log("No enrollment found for student.");
        return;
    }

    const programId = enrollment.program._id;
    console.log(`Found Enrollment in Program: ${enrollment.program.title} (${programId})`);

    // Create a Test Quiz
    const quiz = await Quiz.create({
        title: "Introduction to " + enrollment.program.title,
        description: "A quick test of your knowledge.",
        program: programId,
        passingScore: 50,
        status: 'Published',
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        questions: [
            {
                question: "What is the primary goal of this course?",
                options: ["Learning", "Sleeping", "Eating", "Nothing"],
                correctOption: 0
            }
        ]
    });

    console.log(`Created Quiz: ${quiz.title}`);

    mongoose.disconnect();
};

seedQuiz();
