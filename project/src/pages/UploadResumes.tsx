import React, { useState } from 'react';
import { UploadCloud, FileText, Cpu, Save, Users, Trash2 } from 'lucide-react';

export default function UploadResumes() {
  const [globalData, setGlobalData] = useState({
    role: '',
    jobDescription: '',
    requiredSkills: '',
  });

  // Array to hold state of multiple candidates
  const [candidates, setCandidates] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  
  const [loadingNLP, setLoadingNLP] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [message, setMessage] = useState('');

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGlobalData({ ...globalData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      // Clear previous candidates when new files are selected
      setCandidates([]);
    }
  };

  const handleCandidateChange = (index: number, field: string, value: string) => {
    const updated = [...candidates];
    updated[index] = { ...updated[index], [field]: value };
    setCandidates(updated);
  };

  const removeCandidate = (index: number) => {
    const updated = [...candidates];
    updated.splice(index, 1);
    setCandidates(updated);
  };

  const handleExtractNLP = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one resume file first.");
      return;
    }
    setLoadingNLP(true);
    setMessage('');
    
    try {
      // Concurrently extract all resumes!
      const promises = files.map(async (file) => {
        const nlpData = new FormData();
        nlpData.append('file', file);
        
        const response = await fetch('http://localhost:8000/parse-resume', {
          method: 'POST',
          body: nlpData
        });
        
        let data = { name: '', email: '', phone: '', skills: [], education: '', experience: '' };
        if (response.ok) {
           data = await response.json();
        }
        
        return {
          filename: file.name,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          extractedSkills: data.skills ? data.skills.join(', ') : '',
          education: data.education || '',
          experience: data.experience || '',
          notes: ''
        };
      });

      const results = await Promise.all(promises);
      setCandidates(results);
      setMessage(`Successfully extracted ${results.length} candidates via NLP!`);
      
    } catch (err) {
      setMessage('Failed to connect to Python NLP Microservice (port 8000). Ensure uvicorn is running.');
    } finally {
      setLoadingNLP(false);
    }
  };

  const handleSaveToDB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (candidates.length === 0) return;
    
    setLoadingSave(true);
    setMessage('');
    
    try {
      // Build a pure JSON array for Node.js
      const payloadArray = candidates.map(c => ({
         role: globalData.role,
         jobDescription: globalData.jobDescription,
         requiredSkills: globalData.requiredSkills,
         name: c.name,
         email: c.email,
         phone: c.phone,
         extractedSkills: c.extractedSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
         education: c.education,
         experience: c.experience,
         notes: c.notes
      }));

      const response = await fetch('http://localhost:5000/api/resumes-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadArray),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully saved ${data.count} candidates to MongoDB!`);
        // We can inject the returned Match Scores into local state so HR sees them finally
        if (data.results && data.results.length > 0) {
          const updatedWithScores = candidates.map((c, i) => ({
             ...c,
             matchScore: data.results[i]?.matchScore || 0
          }));
          setCandidates(updatedWithScores);
        }
        
        // Also clear files so they don't double submit by accident
        setFiles([]);
      } else {
        setMessage(data.error || 'Failed to save candidate batch.');
      }
    } catch (error) {
      setMessage('Error connecting to the Node.js backend server (port 5000).');
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto pb-20">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Resume NLP Extractor</h1>
          <p className="text-gray-500">Upload multiple PDF/DOCX resumes simultaneously for matching.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row gap-8">
        
        {/* Step 1: Global Settings & Upload */}
        <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center"><Cpu className="w-5 h-5 mr-2 text-indigo-500"/> Step 1: Target Role</h2>
          <div className="space-y-4 shadow-sm p-4 border rounded-xl bg-gray-50">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
              <input type="text" name="role" required value={globalData.role} onChange={handleGlobalChange} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" placeholder="e.g. Fullstack Engineer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (Comma Sep)</label>
              <textarea name="requiredSkills" required value={globalData.requiredSkills} onChange={handleGlobalChange} rows={2} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" placeholder="React, Python, AWS" />
              
              <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">Job Description</label>
              <textarea name="jobDescription" value={globalData.jobDescription} onChange={handleGlobalChange} rows={3} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" placeholder="Paste JD..." />
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center"><UploadCloud className="w-5 h-5 mr-2 text-indigo-500"/> Step 2: Upload Files</h2>
            <div className="pt-2">
              <input type="file" accept=".pdf,.doc,.docx" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer border border-gray-300 rounded-lg" />
              {files.length > 0 && <p className="text-xs text-green-600 mt-2 font-medium">{files.length} file(s) queued for extraction.</p>}
            </div>

            <button type="button" onClick={handleExtractNLP} disabled={loadingNLP || files.length === 0} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 mt-4 flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4 mr-2" />
              {loadingNLP ? 'Extracting Stack...' : 'Extract All Resumes'}
            </button>
          </div>
        </div>

        {/* Step 3: Candidate Grid Review & Batch Save */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-semibold text-gray-800 flex items-center"><Save className="w-5 h-5 mr-2 text-green-500"/> Step 3: Review Candidates</h2>
             <button onClick={handleSaveToDB} disabled={loadingSave || candidates.length === 0 || !globalData.role} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-sm flex items-center">
                {loadingSave ? 'Saving Batch...' : `Save ${candidates.length} Candidates`}
             </button>
          </div>

          {message && <p className={`text-sm font-medium mb-4 ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}

          <div className="flex-1 overflow-y-auto max-h-[600px] space-y-4 pr-2 custom-scrollbar">
            {candidates.length === 0 ? (
               <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                 No candidates uploaded yet.
               </div>
            ) : (
               candidates.map((c, idx) => (
                 <div key={idx} className="border border-gray-200 bg-white rounded-xl shadow-sm p-4 relative">
                    {/* Delete button */}
                    <button type="button" onClick={() => removeCandidate(idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                    
                    <div className="flex items-center mb-3">
                       <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold mr-2">File: {c.filename}</span>
                       {c.matchScore !== undefined && (
                         <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex items-center">
                           <FileText className="w-3 h-3 mr-1" /> Score: {c.matchScore}%
                         </span>
                       )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input type="text" value={c.name} onChange={(e) => handleCandidateChange(idx, 'name', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 bg-gray-50 rounded focus:bg-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                          <input type="email" value={c.email} onChange={(e) => handleCandidateChange(idx, 'email', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 bg-gray-50 rounded focus:bg-white" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                          <input type="text" value={c.phone} onChange={(e) => handleCandidateChange(idx, 'phone', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 bg-gray-50 rounded focus:bg-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Extracted NLP Skills</label>
                      <input type="text" value={c.extractedSkills} onChange={(e) => handleCandidateChange(idx, 'extractedSkills', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-200 bg-indigo-50 rounded text-indigo-800" />
                    </div>
                 </div>
               ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
