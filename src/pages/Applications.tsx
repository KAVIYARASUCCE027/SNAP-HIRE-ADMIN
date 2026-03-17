import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Student, Application } from '../types';
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

  // Mock data
  const applications: (Application & { student: Student; project: { title: string } })[] = [
    {
      id: '1',
      studentId: '1',
      projectId: '1',
      status: 'pending',
      appliedAt: '2024-01-15T10:30:00Z',
      coverLetter: 'I am very interested in this position...',
      student: {
        id: '1',
        name: 'Sarah Chen',
        email: 'sarah.chen@university.edu',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
        skills: ['React', 'TypeScript', 'Node.js'],
        university: 'Stanford University',
        year: 'Junior',
        matchScore: 95,
        status: 'pending'
      },
      project: { title: 'Frontend Developer Intern' }
    },
    {
      id: '2',
      studentId: '2',
      projectId: '2',
      status: 'reviewed',
      appliedAt: '2024-01-14T14:20:00Z',
      student: {
        id: '2',
        name: 'Alex Rodriguez',
        email: 'alex.r@mit.edu',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        skills: ['Python', 'Machine Learning', 'TensorFlow'],
        university: 'MIT',
        year: 'Senior',
        matchScore: 92,
        status: 'contacted'
      },
      project: { title: 'AI/ML Research Assistant' }
    }
  ];

  const projects = [
    { id: 'all', name: 'All Projects' },
    { id: '1', name: 'Frontend Developer Intern' },
    { id: '2', name: 'AI/ML Research Assistant' },
    { id: '3', name: 'Full Stack Developer' }
  ];

  const tabs = [
    { id: 'all', label: 'All Applications', count: applications.length },
    { id: 'pending', label: 'Pending Review', count: applications.filter(app => app.status === 'pending').length },
    { id: 'reviewed', label: 'Reviewed', count: applications.filter(app => app.status === 'reviewed').length },
    { id: 'accepted', label: 'Accepted', count: applications.filter(app => app.status === 'accepted').length },
    { id: 'rejected', label: 'Rejected', count: applications.filter(app => app.status === 'rejected').length }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'reviewed': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    console.log(`Changing application ${applicationId} status to ${newStatus}`);
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab !== 'all' && app.status !== activeTab) return false;
    if (selectedProject !== 'all' && app.projectId !== selectedProject) return false;
    return true;
  });

  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="Applications" 
        subtitle="Manage and review student applications"
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
              Showing {filteredApplications.length} applications
            </div>
          </div>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={application.student.avatar}
                    alt={application.student.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.student.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        {application.project.title}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {application.student.university} • {application.student.year}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Applied {formatDate(application.appliedAt)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {application.student.skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {application.student.skills.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{application.student.skills.length - 4} more
                        </span>
                      )}
                    </div>
                    
                    {application.coverLetter && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {application.coverLetter}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Resume
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  {application.status === 'pending' && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => handleStatusChange(application.id, 'reviewed')}
                      >
                        Review
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(application.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {application.status === 'reviewed' && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => handleStatusChange(application.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {activeTab === 'all' 
                ? "You haven't received any applications yet." 
                : `No applications with status "${activeTab}".`
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}