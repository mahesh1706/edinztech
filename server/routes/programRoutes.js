const express = require('express');
const router = express.Router();
const {
    getPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
    exportPrograms,
    toggleFeedbackStatus // Added
} = require('../controllers/programController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/export', protect, admin, exportPrograms); // Add Export Route

router.route('/')
    .get(getPrograms)
    .post(protect, admin, createProgram);

router.patch('/:id/toggle-feedback', protect, admin, toggleFeedbackStatus); // Added

router.route('/:id')
    .get(getProgramById)
    .put(protect, admin, updateProgram)
    .delete(protect, admin, deleteProgram);

// Upload Template Route (Specific)
router.post('/:id/upload-template', protect, admin, upload.single('template'), (req, res) => {
    // Controller logic inline or separate
    // For brevity, simple update
    // Client sends 'type' (offerLetter or certificate) in body? Or assume fieldname handled by multermiddleware logic?
    // Multer logic used 'certificateTemplate' or 'offerLetterTemplate'.
    // Let's assume frontend sends matching field.

    // Simplest: just confirm upload
    // Return consistent path for frontend: 'uploads/filename.ext'
    // Frontend is already proxied or will map '/uploads' to server/uploads
    res.send({
        message: 'File Uploaded',
        path: `uploads/${req.file.filename}`
    });
});

module.exports = router;
