// Load Modules
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');
const promises = require('fs/promises');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const { runInNewContext } = require('vm');

// Load Environment Variables
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: 'uploads/'});

// initialize LLM
//TODO Update to have User Provide their own key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


// Handle Resume upload and user input for Job Description
router.post('/', upload.single('resume'), async (req, res) =>{
  try{
    const resumePath = req.file.path;
    const jobDescription = req.body.jobDescription;

    // Load the LLM APi Messages
    // These include placeholders to be replaced later in function
    const resume_parser_api = require('../data/resume_parser_api.json');
    const cover_letter_api = require('../data/cover_letter_api.json');


    // Extract Data from PDF (includes text and meta data if needed for later development)
    const resumeData = await promises.readFile(resumePath);
    const extractedResumeText = await pdf(resumeData);

    // Replace placeholder in resume api with extracted text 
    resume_parser_api.messages[0].content[0].text = resume_parser_api.messages[0].content[0].text.replace("{{resume}}", extractedResumeText.text);

    // Send resume to LLM 
    const resumeResponse = await anthropic.messages.create(resume_parser_api);
    const candidateProfile = resumeResponse.content[0].text.split('```json')[1].split('```')[0].trim();

    // Replace variables in cover letter API prompt
    cover_letter_api.messages[0].content[0].text = cover_letter_api.messages[0].content[0].text
      .replace('{{resume_json}}', candidateProfile)
      .replace('{{job_description}}', jobDescription)
      .replace('{{date}}', new Date().toDateString());
  
    //Send data to LLM to generate Cover Letter
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
    const { coverLetterText } = res.body;

    const outputFilename = path.join(__dirname, '../uploads/cover_letter.docx');
    generateCoverLetter(coverLetterText, outputFilename);

    res.json({downloadLink: '/uploads/cover_letter.docx'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating document' });
  }
});

function generateCoverLetter(rawText, outputFilename) {
  const doc = new Document({
    sections: [
      {
        children: [new Paragraph({ children: [new TextRun(rawText)] })],
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outputFilename, buffer);
    console.log(`Cover letter saved to ${outputFilename}`);
  }).catch(error => console.error("Error generating document:", error));
}



module.exports = router;