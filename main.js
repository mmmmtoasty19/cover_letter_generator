const promises = require('fs/promises');
const pdf = require('pdf-parse');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const today = new Date();
let jobDescription = '';

console.log(today);

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

    console.log(cover_letter_response)
   




  } catch (error) {
    console.error(error.message); // Catches and logs any errors that occurred
  }
}

readJobDescription('./data/job_description.txt')
// Call the main function
main();