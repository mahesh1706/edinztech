const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateCertificate = async (user, program, enrollment) => {
    try {
        // 1. Resolve Template Path
        // If program has custom template, use it; else use default
        let templatePath;
        if (program.certificateTemplate) {
            templatePath = path.join(__dirname, '../..', program.certificateTemplate);
            // Verify existence, else fallback
            if (!fs.existsSync(templatePath)) {
                templatePath = path.join(__dirname, '../assets/certificate_template.png');
            }
        } else {
            // Fallback default
            templatePath = path.join(__dirname, '../assets/certificate_default.png');
        }

        // Ensure assets dir exists or error handled
        // For now, let's assume valid paths are provided or we fail gracefully
        if (!fs.existsSync(templatePath)) {
            console.warn("Certificate template not found:", templatePath);
            return null;
        }

        // 2. Generate QR Code
        // URL: /verify/certificate/:code
        const certificateCode = `CERT-${uuidv4().substring(0, 8).toUpperCase()}`;
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?code=${certificateCode}`;

        const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 150, margin: 1 });

        // 3. Define Text Overlays
        // This is highly dependent on the template layout.
        // Assuming a standard layout for now:
        // Name: Centered, Y=500
        // Program: Centered, Y=700
        // Date: Bottom Right

        const svgImage = `
        <svg width="2000" height="1414">
          <style>
            .title { fill: #000; font-size: 80px; font-family: sans-serif; font-weight: bold; }
            .subtitle { fill: #333; font-size: 40px; font-family: sans-serif; }
            .date { fill: #555; font-size: 30px; font-family: sans-serif; }
          </style>
          
          <!-- Name -->
          <text x="50%" y="40%" text-anchor="middle" class="title">${user.name}</text>
          
          <!-- Program -->
          <text x="50%" y="55%" text-anchor="middle" class="subtitle">For successfully completing: ${program.title}</text>
          
          <!-- Date -->
          <text x="80%" y="80%" text-anchor="middle" class="date">Issued: ${new Date().toLocaleDateString()}</text>
        </svg>
        `;

        const svgBuffer = Buffer.from(svgImage);

        // 4. Composite
        const outputFilename = `cert_${certificateCode}.png`;
        const outputDir = path.join(__dirname, '../uploads/certificates');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, outputFilename);

        await sharp(templatePath)
            .resize(2000, 1414) // Resize template to standard IF needed, or fit overlay to it
            .composite([
                { input: svgBuffer, top: 0, left: 0 },
                { input: qrBuffer, top: 1100, left: 100 } // QR Position
            ])
            .toFile(outputPath);

        // 5. Return File Info
        return {
            filename: outputFilename,
            path: `/uploads/certificates/${outputFilename}`,
            code: certificateCode
        };

    } catch (error) {
        console.error("Certificate Generation Error:", error);
        throw error;
    }
};

module.exports = { generateCertificate };
