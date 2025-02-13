document.getElementById('uploadForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(this);
  const outputSection = document.getElementById('outputSection');
  const coverLetterOutput = document.getElementById('coverLetterOutput');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');


  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  coverLetterOutput.value = "";  //This clear any previous generated output
  
  // Show the Output Section while the program runs
  outputSection.style.display = "block";
  coverLetterOutput.value = "Generating cover letter...";


})