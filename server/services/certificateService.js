const sharp = require('sharp');
const path = require('path');
const QRCode = require('qrcode');
const fs = require('fs');

const generateCertificate = async (user, program, certificateCode) => {
    try {
        // Paths
        // If program has a custom template, use it, else default
        const templatePath = program.certificateTemplate
            ? path.join(__dirname, '../..', program.certificateTemplate) // stored relative path?
            : path.join(__dirname, '../uploads/templates/default_certificate.png'); // Fallback

        // Check if template exists, elese fail or use strict default
        if (!fs.existsSync(templatePath)) {
            // Log error, maybe create a blank canvas if critical
            console.error("Certificate Template Invalid:", templatePath);
            throw new Error("Template not found");
        }

        // Generate QR Code
        const verificationUrl = `${process.env.FRONTEND_URL}/verify/${certificateCode}`;
        const qrCodeBuffer = await QRCode.toBuffer(verificationUrl);

        // Load Image
        const image = sharp(templatePath);
        const metadata = await image.metadata();

        // Check placeholder config (mock logic here, real app would store coords in DB)
        // Hardcoded coords for "Default" template 1920x1080
        const textConfig = {
            name: { x: metadata.width / 2, y: metadata.height / 2 - 50, fontSize: 60, color: '#000000' },
            program: { x: metadata.width / 2, y: metadata.height / 2 + 50, fontSize: 40, color: '#333333' },
            date: { x: metadata.width / 2, y: metadata.height / 2 + 150, fontSize: 30, color: '#555555' },
            qr: { x: 100, y: metadata.height - 250, size: 150 }
        };

        // Create SVG for Text (Sharp doesn't support direct text easily, SVG composition is best)
        const svgImage = `
        <svg width="${metadata.width}" height="${metadata.height}">
            <style>
            .title { fill: ${textConfig.name.color}; font-size: ${textConfig.name.fontSize}px; font-weight: bold; font-family: sans-serif; text-anchor: middle; }
            .program { fill: ${textConfig.program.color}; font-size: ${textConfig.program.fontSize}px; font-family: sans-serif; text-anchor: middle; }
            .date { fill: ${textConfig.date.color}; font-size: ${textConfig.date.fontSize}px; font-family: sans-serif; text-anchor: middle; }
            </style>
            <text x="${textConfig.name.x}" y="${textConfig.name.y}" class="title">${user.name}</text>
            <text x="${textConfig.program.x}" y="${textConfig.program.y}" class="program">${program.title}</text>
            <text x="${textConfig.date.x}" y="${textConfig.date.y}" class="date">Issued: ${new Date().toLocaleDateString()}</text>
        </svg>
        `;

        // Composite
        const outputPath = `server/uploads/certificates/${certificateCode}.png`;

        await image
            .composite([
                { input: Buffer.from(svgImage), top: 0, left: 0 },
                { input: qrCodeBuffer, top: textConfig.qr.y, left: textConfig.qr.x } // Valid for Buffer?
            ])
            .toFile(outputPath);

        return {
            filePath: outputPath,
            fileName: `${certificateCode}.png`
        };

    } catch (error) {
        console.error("Certificate Generation Error:", error);
        throw error;
    }
};

module.exports = { generateCertificate };
