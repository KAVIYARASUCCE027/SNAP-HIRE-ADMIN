import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  Filter,
  Calendar,
  User,
  FileText
} from 'lucide-react';

export default function Applications() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [dbCandidates, setDbCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/resumes')
      .then(res => res.json())
      .then(data => {
        setDbCandidates(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch resumes:', err);
        setLoading(false);
      });
  }, []);

  // Generate dynamic roles/projects based on the DB
  const uniqueRoles = Array.from(new Set(dbCandidates.map(c => c.role).filter(Boolean)));
  const projects = [
    { id: 'all', name: 'All Roles' },
    ...uniqueRoles.map(r => ({ id: r, name: r }))
  ];

  const tabs = [
    { id: 'all', label: 'All Candidates', count: dbCandidates.length },
    { id: 'shortlisted', label: 'Shortlisted', count: dbCandidates.filter(c => c.status === 'shortlisted').length },
    { id: 'reviewed', label: 'Reviewed', count: dbCandidates.filter(c => c.status === 'reviewed').length },
    { id: 'accepted', label: 'Accepted', count: dbCandidates.filter(c => c.status === 'accepted').length },
    { id: 'rejected', label: 'Rejected', count: dbCandidates.filter(c => c.status === 'rejected').length }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlisted': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'reviewed': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-orange-100 text-orange-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    // In a full implementation, you'd send a PUT/PATCH to the backend here.
    // For now, optimistic UI update:
    setDbCandidates(prev => prev.map(c => c._id === applicationId ? { ...c, status: newStatus } : c));
  };

  const filteredApplications = dbCandidates.filter(app => {
    if (activeTab !== 'all' && app.status !== activeTab) return false;
    if (selectedProject !== 'all' && app.role !== selectedProject) return false;
    return true;
  });

  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="Live Applications" 
        subtitle="Manage and review uploaded candidates from the database"
      />
      
      <div className="p-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredApplications.length} candidates
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((candidate) => (
              <Card key={candidate._id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Placeholder Avatar representing imported resumes */}
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                      {candidate.name ? candidate.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {candidate.name || 'Unknown Candidate'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(candidate.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(candidate.status)}`}>
                            {(candidate.status || 'shortlisted').charAt(0).toUpperCase() + (candidate.status || 'shortlisted').slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {candidate.role || 'Unspecified Role'}
                        </div>
                        <div className="flex items-center truncate">
                          <User className="w-4 h-4 mr-2" />
                          {candidate.email || 'No email'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Parsed {formatDate(candidate.createdAt)}
                        </div>
                      </div>
                      
                      {/* NLP Extracted Skills */}
                      <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">NLP Match: {candidate.matchScore}%</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(candidate.extractedSkills || []).slice(0, 6).map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {(candidate.extractedSkills?.length || 0) > 6 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{(candidate.extractedSkills?.length || 0) - 6} more
                          </span>
                        )}
                      </div>
                      
                      {candidate.education && (
                        <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                          <span className="font-medium text-gray-800">Edu:</span> {candidate.education}
                        </p>
                      )}
                      
                      {candidate.experience && (
                        <p className="text-sm text-gray-600 line-clamp-1 mb-4">
                           <span className="font-medium text-gray-800">Exp:</span> {candidate.experience}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View NLP Data
                    </Button>
                    {candidate.phone && (
                      <span className="text-sm text-gray-500 font-medium ml-4">
                         📞 {candidate.phone}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {(!candidate.status || candidate.status === 'shortlisted') && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleStatusChange(candidate._id, 'reviewed')}
                        >
                          Review
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(candidate._id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStatusChange(candidate._id, 'rejected')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {candidate.status === 'reviewed' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleStatusChange(candidate._id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(candidate._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {filteredApplications.length === 0 && (
              <Card className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-600">
                  {activeTab === 'all' 
                    ? "Upload some resumes in the exact 'Upload Resumes' tab first!" 
                    : `No candidates with status "${activeTab}".`
                  }
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}