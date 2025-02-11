const fs = require('fs');
const pdf = require('pdf-parse');

// Path to the PDF file you want to extract text from
const pdfPath = 'data/kyle_resume.pdf';

// Function to extract text from the PDF and return it as a string
async function extractTextFromPDF(pdfPath) {
  try {
    const data = await fs.promises.readFile(pdfPath);  // Use promises with fs
    const pdfData = await pdf(data);  // Parse the PDF
    return pdfData.text;  // Return the extracted text
  } catch (error) {
    throw new Error('Error extracting text from PDF: ' + error.message);
  }
}

(async () => {
  try {
    const extractedText = await extractTextFromPDF(pdfPath); // Waits for PDF extraction to complete
    // console.log('Extracted Text:', extractedText); // Logs the extracted text
  } catch (error) {
    console.error(error.message); // Catches and logs any errors that occurred
  }
})();

