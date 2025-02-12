const promises = require('fs/promises');
const pdf = require('pdf-parse');
const Anthropic = require('@anthropic-ai/sdk');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');

require('dotenv').config();

const today = new Date();
let jobDescription = '';
let coverLetterRawText = '';


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})



// Path to the PDF file you want to extract text from
const pdfPath = 'data/kyle_resume.pdf';

// Function to extract text from the PDF and return it as a string
async function extractTextFromPDF(pdfPath) {
  try {
    const data = await promises.readFile(pdfPath);  // Use promises with fs
    const pdfData = await pdf(data);  // Parse the PDF
    return pdfData.text;  // Return the extracted text
  } catch (error) {
    throw new Error('Error extracting text from PDF: ' + error.message);
  }
}

async function readJobDescription(filePath) {
  try {
    const data = await promises.readFile(filePath, 'utf8');
    jobDescription = data;  // Save content to the global variable
  } catch (err) {
    console.error('Error reading the file:', err);
  }
}


function generateCoverLetter(rawText, outputFilename) {
  // Parse the raw markup
  const header = rawText.match(/<header>(.*?)<\/header>/s)[1].trim();
  const greeting = rawText.match(/<greeting>(.*?)<\/greeting>/s)[1].trim();
  const introduction = rawText.match(/<introduction>(.*?)<\/introduction>/s)[1].trim();
  const body = rawText.match(/<body>(.*?)<\/body>/s)[1].trim();
  const conclusion = rawText.match(/<conclusion>(.*?)<\/conclusion>/s)[1].trim();
  const signature = rawText.match(/<signature>(.*?)<\/signature>/s)[1].trim();

  // Create a new document using docx
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun(header),
              new TextRun("\n\n"), // Add line breaks between sections
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(greeting),
              new TextRun("\n\n"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(introduction),
              new TextRun("\n\n"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(body),
              new TextRun("\n\n"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(conclusion),
              new TextRun("\n\n"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(signature),
              new TextRun("\n\n"),
            ],
          }),
        ],
      },
    ],
  });

  // Create a packer to generate the .docx file
  Packer.toBuffer(doc).then((buffer) => {
    // Save the document as a .docx file
    fs.writeFileSync(outputFilename, buffer);
    console.log(`${outputFilename} created successfully!`);
  }).catch(error => {
    console.error("Error generating the document:", error);
  });
}



async function main() {
  try {
    const resume_parser_api = require('./data/resume_parser_api.json');
    const cover_letter_api = require('./data/cover_letter_api.json');
    const extractedResumeText = await extractTextFromPDF(pdfPath); // Waits for PDF extraction to complete
    


    // used to replace the variables in the resume parser api
    resume_parser_api.messages[0].content[0].text = resume_parser_api.messages[0].content[0].text.replace("{{resume}}", extractedResumeText)

    const resume_response = await anthropic.messages.create(resume_parser_api);
    const candidateProfile = resume_response.content[0].text.split('```json')[1].split('```')[0].trim();  // pulls just the json structure out of LLM response

    // replace variables in cover_letter_api
    cover_letter_api.messages[0].content[0].text = cover_letter_api.messages[0].content[0].text
    .replace('{{resume_json}}', candidateProfile)
    .replace('{{job_description}}', jobDescription)
    .replace('{{date}}', today);

    const cover_letter_response = await anthropic.messages.create(cover_letter_api);

    coverLetterRawText = cover_letter_response.content[0].text.split('<cover_letter>')[1].split('</cover_letter>')[0].trim()
    // console.log(coverLetterRawText)

    generateCoverLetter(coverLetterRawText, 'test.docx')


   




  } catch (error) {
    console.error(error.message); // Catches and logs any errors that occurred
  }
}






readJobDescription('./data/job_description.txt')
// Call the main function
main();