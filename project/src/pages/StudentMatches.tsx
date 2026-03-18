import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Mail, 
  Github, 
  Download, 
  MessageCircle,
  Filter,
  Search,
  GraduationCap,
  Award
} from 'lucide-react';

export default function StudentMatches() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  
  const [dbCandidates, setDbCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/resumes')
      .then(res => res.json())
      .then(data => {
        // Automatically filter for High Matches ONLY (e.g. score >= 50 or accepted)
        const topTier = data.filter((c: any) => c.matchScore >= 50 || c.status === 'accepted');
        setDbCandidates(topTier);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch resumes:', err);
        setLoading(false);
      });
  }, []);

  const uniqueRoles = Array.from(new Set(dbCandidates.map(c => c.role).filter(Boolean)));
  const projects = [
    { id: 'all', name: 'All Roles' },
    ...uniqueRoles.map(r => ({ id: r, name: r }))
  ];

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContactMessages = (studentId: string) => {
    // Navigate straight to the dedicated DM Page
    navigate('/messages');
  };

  const filteredStudents = dbCandidates.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = filterSkill === '' || 
                         student.extractedSkills?.some((s: string) => s.toLowerCase().includes(filterSkill.toLowerCase()));
    const matchesProject = selectedProject === 'all' || student.role === selectedProject;
    
    return matchesSearch && matchesSkill && matchesProject;
  });

  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="Top AI Student Matches" 
        subtitle="Discover the highest-scoring candidate extractions parsed by the FastAPI engine."
      />
      
      <div className="p-6">
        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Filter by NLP skill..."
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <Button variant="outline" className="justify-center">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </Card>

        {loading ? (
           <div className="flex justify-center py-12">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student._id} className="hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Award className="w-4 h-4 mr-1 text-purple-500" />
                        {student.role}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${getMatchScoreColor(student.matchScore || 0)}`}>
                    <Star className="w-4 h-4 inline mr-1" />
                    {student.matchScore || 0}%
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{student.education || 'Education not parsed'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{student.email || 'No Email'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{student.phone || 'No Phone'}</span>
                  </div>
                </div>

                <div className="mb-4 text-xs">
                  <p className="font-semibold text-gray-500 uppercase mb-2 tracking-wider">Top NLP Skills:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(student.extractedSkills || []).slice(0, 6).map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                    {(student.extractedSkills?.length || 0) > 6 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-md">
                        +{(student.extractedSkills?.length || 0) - 6}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 mt-auto">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status || 'shortlisted')}`}>
                    {(student.status || 'Valuable').toUpperCase()}
                  </span>
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800">
                    View Full JSON
                  </Button>
                </div>

                <div className="flex space-x-2 pt-2 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => handleContactMessages(student._id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    DM Student
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    Shortlist
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredStudents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No candidates matching your search or score thresholds ({'>'}50%).
          </div>
        )}
      </div>
    </div>
  );
}