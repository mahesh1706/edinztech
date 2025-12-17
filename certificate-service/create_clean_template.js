const { Document, Packer, Paragraph, TextRun, AlignmentType, UnderlineType } = require("docx");
const fs = require("fs");
const path = require("path");

const doc = new Document({
    sections: [{
        properties: {},
        children: [
            // Header / Date
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                    new TextRun({
                        text: "{{today}}",
                        bold: true,
                        font: "Times New Roman"
                    })
                ],
            }),
            new Paragraph({ text: "" }), // Spacer

            // To Address
            new Paragraph({
                children: [new TextRun({ text: "To", font: "Times New Roman", size: 24 })]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [new TextRun({ text: "   {{name}}", font: "Times New Roman", bold: true, size: 24 })]
            }),
            new Paragraph({
                children: [new TextRun({ text: "   {{registerNumber}}", font: "Times New Roman", bold: true, size: 24 })]
            }),
            new Paragraph({
                children: [new TextRun({ text: "   {{year}} & {{department}}", font: "Times New Roman", bold: true, size: 24 })]
            }),
            new Paragraph({
                children: [new TextRun({ text: "   {{institutionName}}", font: "Times New Roman", bold: true, size: 24 })]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            // Title
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "Internship Offer Letter",
                        bold: true,
                        underline: { type: UnderlineType.SINGLE },
                        font: "Times New Roman",
                        size: 28
                    })
                ],
            }),
            new Paragraph({ text: "" }),

            // Salutation
            new Paragraph({
                children: [
                    new TextRun({ text: "Dear ", font: "Times New Roman", size: 24 }),
                    new TextRun({ text: "{{name}}", font: "Times New Roman", bold: true, size: 24 }),
                    new TextRun({ text: ",", font: "Times New Roman", size: 24 })
                ]
            }),
            new Paragraph({ text: "" }),

            // Body
            new Paragraph({
                children: [
                    new TextRun({ text: "We ", font: "Times New Roman", size: 24 }),
                    new TextRun({ text: "Inspire Softech Solutions", font: "Times New Roman", bold: true, size: 24 }),
                    new TextRun({
                        text: " are very pleased to offer you an AICTE – INSPIRE internship on ",
                        font: "Times New Roman",
                        size: 24
                    }),
                    new TextRun({
                        text: "“BUSINESS INTELLIGENCE & DATA SCIENCE FOUNDATIONS: EXCEL TO AI”",
                        bold: true,
                        font: "Times New Roman",
                        size: 24
                    }),
                    new TextRun({
                        text: " in our organization. Please find the following confirmation that specifies about your internship.",
                        font: "Times New Roman",
                        size: 24
                    })
                ]
            }),
            new Paragraph({ text: "" }),

            // Details
            new Paragraph({
                children: [
                    new TextRun({ text: "Position Title:      ", font: "Times New Roman", size: 24 }),
                    new TextRun({ text: "Technical Intern", font: "Times New Roman", size: 24 })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Start Date:          ", font: "Times New Roman", size: 24 }),
                    new TextRun({ text: "{{startDate}}", font: "Times New Roman", bold: true, size: 24 })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "End Date:            ", font: "Times New Roman", size: 24 }),
                    new TextRun({ text: "{{endDate}}", font: "Times New Roman", bold: true, size: 24 })
                ]
            }),
            new Paragraph({ text: "" }),

            // Closing
            new Paragraph({
                children: [new TextRun({ text: "Wish you all the best", font: "Times New Roman", size: 24 })]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [new TextRun({ text: "For any queries reach or mail the undersigned.", font: "Times New Roman", size: 24 })]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [new TextRun({ text: "For Inspire Softech Solutions", font: "Times New Roman", bold: true, size: 24 })]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            // Sign
            new Paragraph({
                children: [new TextRun({ text: "Dr. R. Karthiya Banu", font: "Times New Roman", size: 24 })]
            }),
            new Paragraph({
                children: [new TextRun({ text: "Business Head", font: "Times New Roman", size: 24 })]
            }),
        ],
    }],
});

// Save to server/uploads
// Ensure dir exists
const uploadDir = path.join(__dirname, "..", "server", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const filePath = path.join(uploadDir, "clean_offer_letter.docx");

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(filePath, buffer);
    console.log("Generated Clean Template at:", filePath);
});
