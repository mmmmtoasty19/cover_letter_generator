// This script is used for Testing Purposes
// Will only load if ENV TEST_MODE is set to true
// Script loads test data, displays all elements as needs,  and stops LLM's from running

const MOCK_CANDIDATE_PROFILE ={
  name: "James Bond",
  location: "England",
  experience: "MI6 British Secret Intelligence Service",
  skills: ["Espionage", "Multilingual", "Cybersecurity", "Combat"]
};

const MOCK_JOB_DESCRIPTION = "A prestigious private security firm is seeking an experienced professional to provide elite security consulting for high-profile clients.";
const MOCK_KEY_POINTS = "Strong skills in security, business intelligence, and combat.";
const MOCK_COVER_LETTER = `
Dear Hiring Manager,

As a former MI6 operative, I have conducted global intelligence missions, 
provided executive protection under extreme conditions, 
and developed strategic security solutions for sensitive operations. 
My expertise in counter-surveillance, crisis management, 
and tactical response makes me uniquely suited to safeguarding elite clients and corporate assets. 
Additionally, my ability to navigate high-society settings while maintaining vigilance ensures seamless security without disruption.

Sincerely,  
James Bond
`;

const MOCK_TAILORED_RESUME = `
James Bond
England | bond.james@shakennotstired.com | (555)555-5555

PROFESSIONAL SUMMARY
Former MI6 intelligence officer with extensive experience in high-stakes security, risk assessment, and executive protection.

TECHNICAL SKILLS
• Executive Protection & Risk Mitigation 
• Counterintelligence & Surveillance
• Tactical & Evasive Driving
`;


// Function to populate test data
function populateTestData() {
  document.getElementById('resumePreviewSection').style.display = "grid"
  document.getElementById('profileJson').value = JSON.stringify(MOCK_CANDIDATE_PROFILE, null, 2);
  document.getElementById('jobDescription').value = MOCK_JOB_DESCRIPTION;
  document.getElementById('keyPoints').value = MOCK_KEY_POINTS;
}

 // Function to simulate cover letter and resume generation
function simulateGeneration() {
  document.getElementById('coverLetterOutput').value = MOCK_COVER_LETTER;
  document.getElementById('tailoredResumeOutput').value = MOCK_TAILORED_RESUME;
  document.getElementById('keyResumeUpdates').textContent = "• Skills section updated to emphasize SQL, R, and automation.\n• Summary tailored to match job description.";

  document.getElementById('coverLetterSection').style.display = "grid";
  document.getElementById('tailoredResumeSection').style.display = "grid";
}


// Override the generate button functionality
document.getElementById("generateCoverLetterBtn").addEventListener("click", function(event) {
  event.preventDefault();
  simulateGeneration();
});


populateTestData()
