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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

