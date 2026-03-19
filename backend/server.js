require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Resume = require('./models/Resume');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected successfully.');
    // Start Server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    // Exit process with failure code if DB doesn't connect
    process.exit(1);
  });

/**
 * Basic NLP Matching Algorithm
 * Calculates percentage of requiredSkills found in extractedSkills
 */
const calculateMatchScore = (extractedSkills, requiredSkills, education = '', experience = '') => {
  if (!requiredSkills || requiredSkills.length === 0) return 0;
  if (!extractedSkills || extractedSkills.length === 0) return 0;
  
  let matches = 0;
  const extrStr = extractedSkills.join(' ').toLowerCase();
  
  requiredSkills.forEach(skill => {
    const term = skill.toLowerCase().trim();
    // Strict word boundary matching
    const strictRegex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (strictRegex.test(extrStr)) {
      matches += 1;
    }
  });

  let score = (matches / requiredSkills.length) * 100;
  
  // STRICT PENALTY: If they meet less than 50% of the required skills, slash their score in half.
  if (matches < requiredSkills.length / 2) {
    score = score * 0.5;
  }
  
  // STRICT BONUS: A slight boost if they have advanced education parsing
  if (education && (education.toLowerCase().includes('master') || education.toLowerCase().includes('phd'))) {
     score += 5;
  }
  
  return Math.min(Math.round(score), 100);
};

// POST /api/resumes-batch - Batch insert multiple backend-parsed resumes
app.post('/api/resumes-batch', async (req, res) => {
  try {
    const candidates = req.body;
    
    if (!Array.isArray(candidates)) {
      return res.status(400).json({ error: "Payload must be an array of candidates." });
    }

    const resumesToSave = candidates.map(c => {
      const skillsArray = c.requiredSkills 
        ? c.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      
      const matchScore = calculateMatchScore(c.extractedSkills || [], skillsArray, c.education, c.experience);

      return {
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        jobDescription: c.jobDescription,
        requiredSkills: skillsArray,
        extractedSkills: c.extractedSkills || [],
        education: c.education,
        experience: c.experience,
        matchScore,
        notes: c.notes
      };
    });

    const savedResumes = await Resume.insertMany(resumesToSave);
    
    res.status(201).json({
      message: 'Batch saved successfully!',
      count: savedResumes.length,
      results: savedResumes
    });
  } catch (error) {
    console.error('Error saving batch resumes:', error);
    if (error.name === 'ValidationError') {
       return res.status(400).json({ error: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: error.message || 'Failed to process and save batch resumes' });
  }
});

// POST /api/resumes - Add a new backend-parsed resume
app.post('/api/resumes', async (req, res) => {
  try {
    const { 
      name, email, phone, role, jobDescription, 
      requiredSkills, education, experience, extractedSkills, notes 
    } = req.body;
    
    // Parse the required skills correctly (sent as string from React form)
    const skillsArray = requiredSkills 
      ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    // Strict Match Score based on penalties, bonuses, and exact overlapping
    const matchScore = calculateMatchScore(extractedSkills || [], skillsArray, education, experience);

    const newResume = new Resume({
      name,
      email,
      phone,
      role,
      jobDescription,
      requiredSkills: skillsArray,
      extractedSkills: extractedSkills || [],
      education,
      experience,
      matchScore,
      notes
    });

    const savedResume = await newResume.save();
    res.status(201).json({
      message: 'Resume saved successfully!',
      data: savedResume,
      matchScore
    });
  } catch (error) {
    console.error('Error saving resume:', error);
    if (error.name === 'ValidationError') {
       return res.status(400).json({ error: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: error.message || 'Failed to process and save resume' });
  }
});

// GET /api/resumes - Get all resumes
app.get('/api/resumes', async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Server listening is now handled inside the MongoDB connection success callback
