const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const mammoth = require('mammoth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// transporter configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Serve static files
app.use('/files', express.static(path.join(__dirname, 'temp')));

app.post('/api/generate', async (req, res) => {
    console.log('[Certificate Service] Received request');
    const { studentData, courseData, certificateId, callbackUrl, templateId, templateUrl, type, qrCode } = req.body;

    if (!studentData || !certificateId || !callbackUrl) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    res.status(202).json({ message: 'Request accepted. Processing started.' });

    processCertificate({ studentData, courseData, certificateId, callbackUrl, templateId, templateUrl, type, qrCode });
});

async function processCertificate({ studentData, courseData, certificateId, callbackUrl, templateId, templateUrl, type, qrCode }) {
    console.log(`[Processing] ${type || 'Certificate'}: ${certificateId} for ${studentData.name}`);
    const filePath = path.join(tempDir, `${certificateId}.pdf`);

    try {
        const isOfferLetter = type === 'offer-letter';

        // 1. Resolve Template Path
        let templatePath = null;
        let isDocx = false;

        // A. Try User Provided Template URL
        if (templateUrl) {
            // Normalize path (server sends 'uploads/file.docx' or similar)
            const cleanUrl = templateUrl.replace(/\\/g, '/');
            let relativePath;

            // Adjust path to reach server/uploads from certificate-service
            if (cleanUrl.startsWith('uploads/')) {
                relativePath = path.join('..', 'server', cleanUrl);
            } else {
                relativePath = path.join('..', 'server', 'uploads', cleanUrl);
            }

            const absPath = path.resolve(__dirname, relativePath);

            if (fs.existsSync(absPath)) {
                templatePath = absPath;
                isDocx = templatePath.toLowerCase().endsWith('.docx') || templatePath.toLowerCase().endsWith('.doc');
            } else {
                console.warn(`[Warning] Provided template not found at ${absPath} (URL: ${templateUrl})`);
            }
        }

        // B. Fallback to Local Defaults (Only if no user template found)
        if (!templatePath) {
            if (isOfferLetter) {
                if (fs.existsSync(path.join(__dirname, 'templates', 'offer-letter.docx'))) {
                    templatePath = path.join(__dirname, 'templates', 'offer-letter.docx');
                    isDocx = true;
                } else {
                    templatePath = path.join(__dirname, 'templates', 'offer-letter.png');
                }
            } else {
                templatePath = path.join(__dirname, 'templates', 'default.jpg');
            }
        }

        console.log(`[Template] Using: ${templatePath} (Docx: ${isDocx})`);

        let htmlContent = '';

        if (isDocx) {
            // --- DOCX PROCESSING WITH AUTO-REPAIR ---
            const content = fs.readFileSync(templatePath, 'binary');
            const zip = new PizZip(content);

            // AUTO-REPAIR LOGIC (Advanced Tokenizer)
            try {
                const docXmlPath = "word/document.xml";
                if (zip.files[docXmlPath]) {
                    const xml = zip.files[docXmlPath].asText();
                    let newXml = "";
                    let lastIndex = 0;
                    let openMatch = null; // { index: number, value: string }

                    // Regex to find all delimiter occurrences
                    const regex = /\{\{|\}\}/g;
                    let match;

                    while ((match = regex.exec(xml)) !== null) {
                        if (match[0] === '{{') {
                            if (openMatch) {
                                // We found {{ but we already had one open!
                                // It means the previous one was a spurious/duplicate open.
                                // Append everything from lastIndex up to this new matches index
                                // BUT skip the previous open tag itself if we haven't appended it yet?
                                // Actually, standard logic:
                                // "Previous open" was at openMatch.index.
                                // We have NOT appended anything from openMatch.index yet.
                                // We should append the CONTENT between them, but IGNORE the previous {{.
                                // So append xml.slice(openMatch.index + 2, match.index)
                                newXml += xml.slice(openMatch.index + 2, match.index);
                            } else {
                                // No open tag, valid start.
                                // Append text before this tag
                                newXml += xml.slice(lastIndex, match.index);
                            }
                            // Set new open
                            openMatch = { index: match.index };
                            lastIndex = match.index; // We haven't appended this {{ yet
                        } else if (match[0] === '}}') {
                            if (openMatch) {
                                // Valid Pair found: openMatch.index to match.index + 2
                                const rawContent = xml.slice(openMatch.index + 2, match.index);
                                // Clean the content: Strip all XML tags
                                const cleanContent = rawContent.replace(/<[^>]+>/g, "");
                                newXml += "{{" + cleanContent + "}}";

                                openMatch = null;
                                lastIndex = match.index + 2;
                            } else {
                                // Orphan }} (Duplicate close).
                                // Append text before this, but SKIP this }}
                                newXml += xml.slice(lastIndex, match.index);
                                lastIndex = match.index + 2; // Skip the }}
                            }
                        }
                    }
                    // Append remainder
                    newXml += xml.slice(lastIndex);

                    // Also strip any completely empty {{}} if any
                    // newXml = newXml.replace(/\{\{\}\}/g, ""); 

                    zip.file(docXmlPath, newXml);
                    console.log("[Auto-Repair] Advanced tokenizer cleanup applied.");
                }
            } catch (repairErr) {
                console.warn("[Auto-Repair] Failed:", repairErr);
            }

            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                nullGetter: () => ""
            });

            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            doc.render({
                name: studentData.name,
                registerNumber: studentData.registerNumber || '',
                department: studentData.department || '',
                year: studentData.year || '',
                institutionName: studentData.institutionName || '',
                pincode: studentData.pincode || '',
                city: studentData.city || '',
                state: studentData.state || '',
                title: courseData.title,
                startDate: courseData.startDate ? new Date(courseData.startDate).toLocaleDateString() : '',
                endDate: courseData.endDate ? new Date(courseData.endDate).toLocaleDateString() : '',
                today: today,
                Name: studentData.name,
                NAME: studentData.name.toUpperCase()
            });

            const buf = doc.getZip().generate({ type: 'nodebuffer' });
            const result = await mammoth.convertToHtml({ buffer: buf });

            htmlContent = `
                <html>
                    <head>
                        <style>
                            @page { size: A4 portrait; margin: 2cm; }
                            body { font-family: 'Times New Roman', serif; line-height: 1.5; font-size: 12pt; color: #000; }
                            table { width: 100%; border-collapse: collapse; }
                            td, th { border: 1px solid #ddd; padding: 4px; }
                        </style>
                    </head>
                    <body>
                        ${result.value}
                    </body>
                </html>
            `;

        } else {
            // --- IMAGE TEMPLATE PROCESSING (Fallback) ---
            let templateBase64 = '';
            if (fs.existsSync(templatePath)) {
                const imageBuffer = fs.readFileSync(templatePath);
                const mimeType = templatePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
                templateBase64 = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
            }

            if (isOfferLetter) {
                // HYBRID APPROACH: HTML Text Overlay on Background Image
                const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

                // Content based on the "Clean Template" text
                htmlContent = `
                <html>
                    <head>
                        <style>
                            @page { size: A4 portrait; margin: 0; }
                            body { 
                                margin: 0; 
                                padding: 0; 
                                width: 210mm; 
                                height: 297mm; 
                                position: relative; 
                                font-family: 'Times New Roman', serif; 
                                font-size: 12pt; 
                                color: #000;
                                box-sizing: border-box;
                            }
                            .bg { 
                                width: 100%; 
                                height: 100%; 
                                position: absolute; 
                                top: 0; 
                                left: 0; 
                                z-index: -2; 
                                object-fit: cover; 
                            }
                            /* Auto-Mask: Covers the middle content of the template image (e.g. old text) */
                            .mask {
                                position: absolute;
                                top: 4.5cm;     /* Leave space for Header/Logo */
                                bottom: 2.5cm;  /* Leave space for Footer */
                                left: 1cm;      /* Side margins for cleanliness */
                                right: 1cm;
                                background: white;
                                z-index: -1;
                            }
                            .container {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                padding: 3.5cm 2.5cm 2.5cm 2.5cm; /* Margins: Top space for Header Logo */
                                box-sizing: border-box;
                                z-index: 1;
                            }
                            .date { text-align: right; font-weight: bold; margin-bottom: 20px; margin-top: 40px; }
                            .to-address { margin-bottom: 30px; line-height: 1.4; }
                            .to-label { font-size: 14pt; margin-bottom: 5px; }
                            .student-details { font-weight: bold; font-size: 13pt; margin-left: 10px; }
                            .title { 
                                text-align: center; 
                                font-weight: bold; 
                                text-decoration: underline; 
                                font-size: 16pt; 
                                margin: 20px 0; 
                                text-transform: uppercase;
                            }
                            .salutation { font-size: 13pt; margin-bottom: 15px; }
                            .body-text { 
                                text-align: justify; 
                                font-size: 13pt; 
                                line-height: 1.6; 
                                margin-bottom: 20px; 
                            }
                            .details-table { margin: 20px 0; margin-left: 20px; font-size: 13pt; }
                            .details-table td { padding: 5px 15px 5px 0; vertical-align: top; }
                            .closing { font-size: 13pt; margin-top: 30px; }
                            .signature-section { margin-top: 60px; font-weight: bold; font-size: 13pt; }
                            .sign-name { margin-top: 50px; }
                            .qr-code {
                                position: absolute;
                                top: 3.5cm; /* Aligned with Header space */
                                right: 2cm;
                                width: 2.5cm;
                                height: 2.5cm;
                                z-index: 10;
                            }
                            .cert-id-text {
                                position: absolute;
                                top: 6.2cm; /* Just below QR (3.5 + 2.5 + margin) */
                                right: 1.25cm; /* Adjusted to center relative to QR */
                                width: 4cm; /* Wider to prevent wrapping */
                                text-align: center;
                                font-size: 8pt;
                                font-family: 'Helvetica', sans-serif;
                                z-index: 10;
                                background: rgba(255,255,255,0.8); /* readable on bg */
                            }
                        </style>
                    </head>
                    <body>
                        ${templateBase64 ? `<img src="${templateBase64}" class="bg" />` : ''}
                        ${qrCode ? `<img src="${qrCode}" class="qr-code" />` : ''}
                        ${certificateId ? `<div class="cert-id-text">${certificateId}</div>` : ''}
                        <!-- <div class="mask"></div> -->
                        <div class="container">
                            <div class="date">${today}</div>
                            
                            <div class="to-address">
                                <div class="to-label">To</div>
                                <div class="student-details">
                                    ${studentData.name}<br>
                                    ${studentData.registerNumber || ''}<br>
                                    ${studentData.year ? studentData.year + ' & ' : ''}${studentData.department || ''}<br>
                                    ${studentData.institutionName || ''}
                                </div>
                            </div>

                            <div class="title">Internship Offer Letter</div>

                            <div class="salutation">
                                Dear <b>${studentData.name}</b>,
                            </div>

                            <div class="body-text">
                                We <b>Inspire Softech Solutions</b> are very pleased to offer you an AICTE – INSPIRE internship on 
                                <b>"${courseData.title.toUpperCase()}"</b> in our organization. Please find the following confirmation that specifies about your internship.
                            </div>

                            <table class="details-table">
                                <tr>
                                    <td>Position Title:</td>
                                    <td>Technical Intern</td>
                                </tr>
                                <tr>
                                    <td>Start Date:</td>
                                    <td><b>${courseData.startDate ? new Date(courseData.startDate).toLocaleDateString() : 'Immediate'}</b></td>
                                </tr>
                                <tr>
                                    <td>End Date:</td>
                                    <td><b>${courseData.endDate ? new Date(courseData.endDate).toLocaleDateString() : 'TBD'}</b></td>
                                </tr>
                            </table>

                            <div class="closing">
                                Wish you all the best.<br><br>
                                For any queries reach or mail the undersigned.
                            </div>

                            <div class="signature-section" style="margin-top: 150px;">
                                <div class="sign-name">
                                    Dr. R. Karthiya Banu<br>
                                    <span style="font-weight: normal; font-size: 11pt;">Business Head, Ph: 8667493679 | Email karthiya@inspriess.in</span>
                                </div>
                            </div>

                        </div>
                    </body>
                </html>
                `;
            } else {
                const parts = [studentData.name];
                if (studentData.registerNumber) parts.push(studentData.registerNumber);
                if (studentData.year) parts.push(studentData.year);
                const line1Text = parts.join(' - ');
                const line2Text = studentData.institutionName || '';

                htmlContent = `
                <html>
                    <head>
                        <style>
                            @page { size: A4 landscape; margin: 0; }
                            body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; position: relative; font-family: 'Helvetica', sans-serif; }
                            .bg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: -1; object-fit: cover; }
                            .line1-container { position: absolute; top: 38%; left: 10%; width: 80%; text-align: center; }
                            .line1 { font-size: 28px; font-weight: bold; color: #000; text-transform: uppercase; font-family: 'Times New Roman', serif; }
                            .line2-container { position: absolute; top: 48%; left: 10%; width: 80%; text-align: center; }
                            .line2 { font-size: 24px; color: #333; font-weight: bold; text-transform: uppercase; font-family: 'Times New Roman', serif; }
                            .qr-code {
                                position: absolute;
                                top: 40px;
                                right: 40px;
                                width: 100px;
                                height: 100px;
                                z-index: 10;
                            }
                            .cert-id-text {
                                position: absolute;
                                top: 145px; /* Just below QR (40 + 100 + 5) */
                                right: 15px; /* Centered relative to QR area */
                                width: 150px; /* Wider */
                                text-align: center;
                                font-size: 10px;
                                font-family: 'Helvetica', sans-serif;
                                z-index: 10;
                                background: rgba(255,255,255,0.7);
                                padding: 2px 0;
                            }
                        </style>
                    </head>
                    <body>
                        ${templateBase64 ? `<img src="${templateBase64}" class="bg" />` : ''}
                        ${qrCode ? `<img src="${qrCode}" class="qr-code" />` : ''}
                        ${certificateId ? `<div class="cert-id-text">${certificateId}</div>` : ''}
                        <div class="line1-container"><div class="line1">${line1Text}</div></div>
                        <div class="line2-container"><div class="line2">${line2Text}</div></div>
                    </body>
                </html>
                `;
            }
        }

        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent);

        await page.pdf({
            path: filePath,
            format: 'A4',
            landscape: !isOfferLetter && !isDocx,
            printBackground: true,
            margin: isDocx ? { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' } : undefined
        });

        await browser.close();
        console.log(`[Generated] PDF created at ${filePath}`);

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"EdinzTech Cert" <noreply@edinztech.com>',
            to: studentData.email,
            subject: isOfferLetter ? `Your Offer Letter: ${courseData.title}` : `Your Certificate: ${courseData.title}`,
            text: isOfferLetter
                ? `Dear ${studentData.name},\n\nPlease find your Internship Offer Letter attached.\n\nBest,\nEdinzTech Team`
                : `Congratulations ${studentData.name}!\n\nPlease find your certificate attached.\n\nBest,\nEdinzTech Team`,
            attachments: [{
                filename: `${isOfferLetter ? 'OfferLetter' : 'Certificate'}_${studentData.name.replace(/\s/g, '_')}.pdf`,
                path: filePath
            }]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Sent] Message ID: ${info.messageId}`);

        const downloadUrl = `${process.env.SERVICE_URL || `http://localhost:${PORT}`}/files/${certificateId}.pdf`;

        await axios.post(callbackUrl, {
            certificateId,
            status: 'sent',
            metadata: {
                messageId: info.messageId,
                generatedAt: new Date(),
                email: studentData.email,
                fileUrl: downloadUrl
            }
        });
        console.log(`[Callback] Success reported to ${callbackUrl}`);

    } catch (error) {
        console.error(`[Error] Processing failed for ${certificateId}:`, error);
        try {
            await axios.post(callbackUrl, { certificateId, status: 'failed', error: error.message });
        } catch (cbError) { console.error('[Error] Callback failed:', cbError.message); }
    } finally {
        if (fs.existsSync(filePath)) {
            // fs.unlinkSync(filePath);
        }
    }
}

app.get('/health', (req, res) => res.send('Certificate Service Operational'));

app.listen(PORT, () => {
    console.log(`Certificate Service running on port ${PORT}`);
});
