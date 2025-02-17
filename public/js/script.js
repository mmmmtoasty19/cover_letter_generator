document.getElementById('uploadForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const resumePreviewSection = document.getElementById('resumePreviewSection');
  const resumeTextPreview = document.getElementById("resumeTextOutput")
  const generateBtn = document.getElementById('generateCoverLetterBtn');



  generateBtn.disabled = true;
  resumePreviewSection.value = "";  //This clear any previous generated output
  resumePreviewSection.style.display = "grid";

  const fileInput = document.getElementById('resume');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload a resume.");
    return;
  }

  const formData = new FormData();
  formData.append("resume", file);

  try {
    const response = await fetch('/generate/extract-resume', {
      method: "POST",
      body: formData,
  });

    const data = await response.json();
    if (data.error) {
      alert("Error: " + data.error)
    } else {
      resumeTextPreview.value = data.extractedText;
      generateBtn.disabled = false;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong. Please try again.');
    resumePreviewSection.style.display = "none";
  }

});

// Send Resume and Job Description to Generate Cover Letter
document.getElementById("generateCoverLetterBtn").addEventListener("click", async function () {
  const extractedResumeText = document.getElementById("resumeTextOutput").value;
  const jobDescription = document.getElementById("jobDescription").value;
  const keyPoints = document.getElementById("keyPoints").value;
  const generateBtn = document.getElementById("generateCoverLetterBtn")

  if (!extractedResumeText.trim()) {
      alert("Please confirm the extracted resume text.");
      return;
  }

  if (!jobDescription.trim()) {
      alert("Please enter a job description.");
      return;
  }

  const requestData = {
      extractedResumeText,
      jobDescription,
      keyPoints,
  };

  generateBtn.textContent = "Generating Cover Letter...."

  try {
      const response = await fetch("/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (data.error) {
          alert("Error: " + data.error);
      } else {
          document.getElementById("coverLetterOutput").innerText = data.coverLetter;
          document.getElementById("coverLetterSection").style.display = "grid"; // Show cover letter section
          generateBtn.textContent = "Generate New Cover Letter"
      }
  } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("Something went wrong. Please try again.");
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