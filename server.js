const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;  //TODO DO NOT HARDCODE THIS

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


// Routes
const generateRoute = require('./routes/generate');
app.use('/generate', generateRoute);

app.get('/env', (req,res) => {
  res.json({TEST_MODE: process.env.TEST_MODE || false})
})

app.get('/load-saved-profile', (req, res) => {
  try {
    const savedProfile = require('./data/saved_candidate_profile.json');
    res.json({ candidateProfile: savedProfile });
  } catch (error) {
    res.status(404).json({ error: 'No saved profile found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

