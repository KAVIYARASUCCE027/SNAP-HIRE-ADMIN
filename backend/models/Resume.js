const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  
  // NLP & HR Additions
  jobDescription: { type: String },
  requiredSkills: { type: [String] },
  matchScore: { type: Number, default: 0 },
  phone: { type: String, required: false },
  education: { type: String, required: false },
  experience: { type: String, required: false },
  extractedSkills: { type: [String], required: false },
  
  status: { type: String, default: 'shortlisted' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
