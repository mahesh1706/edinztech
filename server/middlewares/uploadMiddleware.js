const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        // Use absolute path to 'server/uploads'
        const uploadPath = path.join(__dirname, '../uploads');

        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|svg|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Mimetype check: 
    // jpeg/png etc are straightforward.
    // doc: application/msword
    // docx: application/vnd.openxmlformats-officedocument.wordprocessingml.document
    // The regex /doc|docx/ will match 'document' in the docx mimetype, and possibly 'msword' doesn't match 'doc' unless we start checking carefully.
    // 'application/msword' does NOT contain 'doc'.
    // So we should relax or improve the check.

    // Let's just trust extension for now or add specific mimetypes if needed.
    // Given the simple regex approach, I'll assume valid mimetypes. 
    // Actually, let's fix the logic to be safer.

    const validMimeTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const isMimeValid = validMimeTypes.some(type => file.mimetype.includes(type)) || filetypes.test(file.mimetype);

    if (extname && isMimeValid) {
        return cb(null, true);
    } else {
        cb('Error: Images, PDFs, and Word Documents only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
