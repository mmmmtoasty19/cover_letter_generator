// Load Modules
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const Anthropic = require('@anthropic-ai/sdk');

// Load Environment Variables
require('dotenv').config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// initialize LLM
//TODO Update to have User Provide their own key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Extract resume text and return it for preview
router.post('/extract-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    let extractedText = '';
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;

    if (fileType === 'application/pdf') {
      const pdfData = await pdf(fileBuffer);
      extractedText = pdfData.text;
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }
    // Load Resume Parser API Prompt Template
    const resume_parser_api = require('../data/resume_parser_api.json');

    // Replace placeholder with extracted resume text
    resume_parser_api.messages[0].content[0].text = resume_parser_api.messages[0].content[0].text.replace('{{resume}}', extractedText);

    // Send the extracted resume text to AI model
    const resumeResponse = await anthropic.messages.create(resume_parser_api);
    
    // Extract JSON-formatted profile from the response
    const candidateProfile = resumeResponse.content[0].text.split('```json')[1].split('```')[0].trim();

    res.json({candidateProfile: JSON.parse(candidateProfile) });
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error extracting resume text' });
  }
});

// Handle Resume upload and user input for Job Description
router.post('/', async (req, res) => {
  try {
    const { candidateProfile, jobDescription, keyPoints } = req.body;

    const cover_letter_api = require('../data/cover_letter_api.json');

    cover_letter_api.messages[0].content[0].text = cover_letter_api.messages[0].content[0].text
      .replace('{{resume_json}}', candidateProfile)
      .replace('{{job_description}}', jobDescription)
      .replace('{{key_points}}', keyPoints )
      .replace('{{date}}', new Date().toDateString());

    const coverLetterResponse = await anthropic.messages.create(cover_letter_api);
    const coverLetterRawText = coverLetterResponse.content[0].text.split('<cover_letter>')[1].split('</cover_letter>')[0].trim();

    res.json({ coverLetter: coverLetterRawText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating cover letter' });
  }
});

router.post('/download', async (req, res) => {
  try {
    const { coverLetterText } = req.body;

    // Generate .docx file dynamically
    const docBuffer = await generateCoverLetter(coverLetterText);

    // Set response headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename="cover_letter.docx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    res.send(docBuffer);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating document' });
  }
});

function generateCoverLetter(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Invalid cover letter text provided.");
  }

  // Convert text into paragraphs, splitting by double newlines
  const paragraphs = rawText.split("\n\n").map(text => 
    new Paragraph({
      children: [
        new TextRun(text),
        new TextRun("\n") // Ensures spacing between paragraphs
      ]
    })
  );

  // Create the document
  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }]
  });

  return Packer.toBuffer(doc);
}



module.exports = router;