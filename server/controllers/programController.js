const asyncHandler = require('express-async-handler');
const Program = require('../models/Program');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public
const getPrograms = asyncHandler(async (req, res) => {
    // Basic filtering
    const keyword = req.query.keyword ? {
        title: {
            $regex: req.query.keyword,
            $options: 'i',
        },
    } : {};

    // Filter by type if provided (Course, Internship, Workshop)
    const typeFilter = req.query.type ? { type: req.query.type } : {};

    // Filter active/published
    const activeFilter = { isArchived: false };

    const programs = await Program.find({ ...keyword, ...typeFilter, ...activeFilter }).sort({ createdAt: -1 });
    res.json(programs);
});

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Public
const getProgramById = asyncHandler(async (req, res) => {
    const program = await Program.findById(req.params.id);

    if (program) {
        res.json(program);
    } else {
        res.status(404);
        throw new Error('Program not found');
    }
});

// @desc    Create a program
// @route   POST /api/admin/programs
// @access  Private/Admin
const createProgram = asyncHandler(async (req, res) => {
    const { title, description, type, code, startDate, endDate, fee, mode } = req.body;

    // Check if code exists
    if (code) {
        const programExists = await Program.findOne({ code });
        if (programExists) {
            res.status(400);
            throw new Error('Program with this code already exists');
        }
    }

    const program = new Program({
        ...req.body,
        // user: req.user._id, // if we want to track creator
    });

    const createdProgram = await program.save();
    res.status(201).json(createdProgram);
});

// @desc    Update a program
// @route   PUT /api/admin/programs/:id
// @access  Private/Admin
const updateProgram = asyncHandler(async (req, res) => {
    const program = await Program.findById(req.params.id);

    if (program) {
        // Merge body into program
        Object.assign(program, req.body);

        const updatedProgram = await program.save();
        res.json(updatedProgram);
    } else {
        res.status(404);
        throw new Error('Program not found');
    }
});

// @desc    Delete/Archive a program
// @route   DELETE /api/admin/programs/:id
// @access  Private/Admin
const deleteProgram = asyncHandler(async (req, res) => {
    const program = await Program.findById(req.params.id);

    if (program) {
        program.isArchived = true; // Soft delete
        await program.save();
        res.json({ message: 'Program archived' });
    } else {
        res.status(404);
        throw new Error('Program not found');
    }
});

module.exports = {
    getPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
};
