document.getElementById('uploadForm').addEventListener('submit', async function (event) {
  event.preventDefault();

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


  const fileInput = document.getElementById('resume');
  const jobDescriptionInput = document.getElementById('jobDescription');

  if (!fileInput || !jobDescriptionInput) {
    console.error("Form elements not found.");
    return;
  }

  const file = fileInput.files[0];
  const jobDescription = jobDescriptionInput.value;

  if (!file) {
    alert("Please upload a resume.");
    return;
  }

  if (!jobDescription.trim()) {
    alert("Please enter a job description.");
    return;
  } 

  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobDescription", jobDescription);

  try {
    const response = await fetch('/generate', {
      method: "POST",
      body: formData,
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

document.getElementById('downloadBtn').addEventListener('click', async function () {
  const coverLetterText = document.getElementById('coverLetterOutput').value;

  try {
      const response = await fetch('/generate/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coverLetterText })
      });

      if (!response.ok) throw new Error('Failed to download document.');

      // Convert response to blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary download link
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cover_letter.docx';
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  } catch (error) {
      console.error('Error:', error);
      alert('Failed to download document.');
  }
});