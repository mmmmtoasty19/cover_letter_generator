const profileJsonTextarea = document.getElementById("profileJson");

// Handle "Use Saved Profile" button
document.getElementById('useSavedProfileBtn').addEventListener('click', async function() {
  const resumePreviewSection = document.getElementById('resumePreviewSection');
  const generateBtn = document.getElementById('generateCoverLetterBtn');
  const profileJson = document.getElementById('profileJson');
  const quickStartSection = document.getElementById('quickStartSection');
  const uploadForm = document.getElementById('uploadForm');

  profileJson.textContent = "Loading saved profile...";
  resumePreviewSection.style.display = "grid";

  try {
    const response = await fetch('/load-saved-profile');
    const data = await response.json();
    
    if (data.error) {
      alert('No saved profile found. Please upload a resume first.');
      resumePreviewSection.style.display = "none";
      return;
    }

    profileJson.value = JSON.stringify(data.candidateProfile, null, 2);
    generateBtn.disabled = false;
    
    // Hide the upload options once profile is loaded
    quickStartSection.style.display = "none";
    uploadForm.style.display = "none";
    
  } catch (error) {
    console.error('Error loading saved profile:', error);
    alert('Failed to load saved profile. Please try uploading a resume.');
    resumePreviewSection.style.display = "none";
  }
});


// Function to validate JSON input live
function validateJsonInput() {
  const errorText = document.getElementById("jsonError");

  try {
      // Try parsing JSON
      // TODO Update these styles to be correct tailwind classes for constancy
      JSON.parse(profileJsonTextarea.value);
      profileJsonTextarea.style.border = "2px solid green"; // Green border on valid input
      errorText.style.display = "none";
  } catch (e) {
      profileJsonTextarea.style.border = "2px solid red"; // Red border on error
      errorText.style.display = "block";
  }
}

profileJsonTextarea.addEventListener("input", validateJsonInput);


document.getElementById('uploadForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const resumePreviewSection = document.getElementById('resumePreviewSection');
  const generateBtn = document.getElementById('generateCoverLetterBtn');
  const profileJson = document.getElementById('profileJson');



  generateBtn.disabled = true;  
  resumePreviewSection.style.display = "grid";
  profileJson.textContent = "Parsing Resume....."

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

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to process the resume.');
  }

  const data = await response.json();
  generateBtn.disabled = false;  
  profileJson.textContent = JSON.stringify(data.candidateProfile, null, 2);
  document.getElementById('quickStartSection').style.display = "none";
  document.getElementById('uploadForm').style.display = "none";

  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong. Please try again.');
    resumePreviewSection.style.display = "none";
  }

});

// Send Resume and Job Description to Generate Cover Letter
document.getElementById("generateCoverLetterBtn").addEventListener("click", async function () {
  const candidateProfile = document.getElementById("profileJson").value;
  const jobDescription = document.getElementById("jobDescription").value;
  const keyPoints = document.getElementById("keyPoints").value;
  const generateBtn = document.getElementById("generateCoverLetterBtn")

  if (!candidateProfile.trim()) {
      alert("Please confirm the extracted resume text.");
      return;
  }

  if (!jobDescription.trim()) {
      alert("Please enter a job description.");
      return;
  }

  const requestData = {
      candidateProfile,
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
          const formattedText = formatCoverLetter(data.coverLetter);
          document.getElementById("coverLetterOutput").value = formattedText;
          document.getElementById("coverLetterSection").style.display = "grid"; // Show cover letter section
          document.getElementById("tailoredResumeSection").style.display = "grid";
          document.getElementById("tailoredResumeOutput").value = data.tailoredResumeText;
          document.getElementById("keyResumeUpdates").textContent = data.resumeChanges;
          generateBtn.textContent = "Generate New Cover Letter"
      }
  } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("Something went wrong. Please try again.");
  }
});


async function downloadDocument(content, endpoint, filename) {
  try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });

    if (!response.ok) throw new Error('Failed to download document.');

    // Convert response to blob
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create a temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
      console.error('Error:', error);
      alert('Failed to download document.');
  }
}

// Event listener for cover letter download
document.getElementById('downloadCoverLetterBtn').addEventListener('click', function () {
  const coverLetterText = document.getElementById('coverLetterOutput').value;
  if (!coverLetterText.trim()) {
      alert("Cover letter is empty!");
      return;
  }
  downloadDocument(coverLetterText, '/generate/download-cover-letter', 'cover_letter.docx');
});

// Event listener for tailored resume download
document.getElementById('downloadResumeBtn').addEventListener('click', function () {
  const tailoredResumeText = document.getElementById('tailoredResumeOutput').value;
  if (!tailoredResumeText.trim()) {
      alert("Tailored resume is empty!");
      return;
  }
  downloadDocument(tailoredResumeText, '/generate/download-resume', 'tailored_resume.docx');
});

// document.getElementById('downloadBtn').addEventListener('click', async function () {
//   const coverLetterText = document.getElementById('coverLetterOutput').value;

//   try {
//       const response = await fetch('/generate/download', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ coverLetterText })
//       });

//       if (!response.ok) throw new Error('Failed to download document.');

//       // Convert response to blob
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);

//       // Create a temporary download link
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'cover_letter.docx';
//       document.body.appendChild(a);
//       a.click();

//       // Cleanup
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//   } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to download document.');
//   }
// });


function formatCoverLetter(rawText) {
  return rawText
    .replace(/<\/header>/g, '') 
    .replace(/<\/greeting>/g, '') 
    .replace(/<\/introduction>/g, '') 
    .replace(/<\/body>/g, '') 
    .replace(/<\/conclusion>/g, '') 
    .replace(/<\/signature>/g, '') 
    .replace(/<[^>]+>/g, ''); // Remove all XML-like tags
}


