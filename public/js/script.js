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

  try {
    const response = await fetch('/generate', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.coverLetter) {
      coverLetterOutput.value = result.coverLetter;
      downloadBtn.style.display = 'block';
    } else {
      alert('Error Generating Cover Letter (Check Console for more details');
      outputSection.style.display = 'none' // Hides the output on erros
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong. Please try again.');
    outputSection.style.display = "none";
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Cover Letter';
  }

});

document.getElementById('downloadBtn').addEventListener('click', async function() {
  const coverLetterText = document.getElementById('coverLetterOutput').value;

  try {
    const response = await fetch('/generate/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverLetterText })
    });

    const result = await response.json();
    if (result.downloadLink) {
      window.location.href = result.downloadLink;
    } else {
      alert('Error downloading document.')
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to download document.')
  }

});