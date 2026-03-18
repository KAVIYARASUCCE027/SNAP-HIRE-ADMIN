import React, { useState } from 'react';
import { UploadCloud, FileText, Cpu, Save } from 'lucide-react';

export default function UploadResumes() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    notes: '',
    jobDescription: '',
    requiredSkills: '',
    education: '',
    experience: '',
    extractedSkills: '',
  });
  const [file, setFile] = useState<File | null>(null);
  
  const [loadingNLP, setLoadingNLP] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [message, setMessage] = useState('');
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtractNLP = async () => {
    if (!file) {
      setMessage("Please select a resume file first.");
      return;
    }
    setLoadingNLP(true);
    setMessage('');
    try {
      const nlpData = new FormData();
      nlpData.append('file', file);
      
      const response = await fetch('http://localhost:8000/parse-resume', {
        method: 'POST',
        body: nlpData
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessage('NLP Extraction successful! Please review the auto-populated fields.');
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          extractedSkills: data.skills ? data.skills.join(', ') : '',
          education: data.education || prev.education,
          experience: data.experience || prev.experience,
        }));
      } else {
        setMessage(data.detail || 'Extracting data failed via NLP Microservice.');
      }
    } catch (err) {
      setMessage('Failed to connect to Python NLP Microservice (port 8000). Ensure uvicorn is running.');
    } finally {
      setLoadingNLP(false);
    }
  };

  const handleSaveToDB = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSave(true);
    setMessage('');
    setMatchScore(null);
    
    try {
      const payload = {
        ...formData,
        extractedSkills: formData.extractedSkills.split(',').map(s => s.trim()).filter(Boolean)
      };

      const response = await fetch('http://localhost:5000/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Candidate saved successfully to MongoDB Atlas!');
        setMatchScore(data.matchScore);
        // Clear candidate-specific fields for the next upload
        setFormData(prev => ({ ...prev, name: '', email: '', phone: '', notes: '', education: '', experience: '', extractedSkills: '' }));
        setFile(null);
      } else {
        setMessage(data.error || 'Failed to save candidate details.');
      }
    } catch (error) {
      setMessage('Error connecting to the Node.js backend server (port 5000).');
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <UploadCloud className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Python NLP Candidate Matcher</h1>
          <p className="text-gray-500">FastAPI microservice extraction and MongoDB saving.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row gap-8">
        
        {/* Step 1: Document Upload & NLP Extraction */}
        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center"><Cpu className="w-5 h-5 mr-2 text-indigo-500"/> Step 1: AI Parse</h2>
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
              <input type="text" name="role" required value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. React Developer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills / JD</label>
              <textarea name="requiredSkills" required value={formData.requiredSkills} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Skills required for the role" />
              <textarea name="jobDescription" required value={formData.jobDescription} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-2" placeholder="Full job description" />
            </div>
            
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resume Document (PDF/DOCX)</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer border border-gray-300 rounded-lg" />
            </div>

            <button type="button" onClick={handleExtractNLP} disabled={loadingNLP || !file} className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 mt-4 flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4 mr-2" />
              {loadingNLP ? 'Extracting via FastAPI...' : 'Auto-Extract Resume'}
            </button>

            {message && <p className={`text-sm font-medium mt-4 ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
          </div>
        </div>

        {/* Step 2: Database Review & Save */}
        <div className="flex-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center"><Save className="w-5 h-5 mr-2 text-green-500"/> Step 2: Review & Save</h2>
          <form onSubmit={handleSaveToDB} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Extracted NLP Skills</label>
              <input type="text" name="extractedSkills" value={formData.extractedSkills} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-200 bg-indigo-50 rounded-lg text-indigo-800" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Education Snip</label>
                  <textarea name="education" value={formData.education} onChange={handleChange} rows={2} className="w-full px-3 py-2 text-xs border border-gray-200 bg-gray-50 rounded-lg focus:bg-white" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Experience Snip</label>
                  <textarea name="experience" value={formData.experience} onChange={handleChange} rows={2} className="w-full px-3 py-2 text-xs border border-gray-200 bg-gray-50 rounded-lg focus:bg-white" />
               </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
               {matchScore !== null ? (
                 <div className="flex items-center space-x-2 text-green-700 font-bold bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
                   <FileText className="w-4 h-4" />
                   <span>Score: {matchScore}%</span>
                 </div>
               ) : <span />}
              <button type="submit" disabled={loadingSave || !formData.name} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-sm flex items-center">
                {loadingSave ? 'Saving...' : 'Save Candidate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
