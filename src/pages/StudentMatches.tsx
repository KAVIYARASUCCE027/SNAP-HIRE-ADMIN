import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Student } from '../types';
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

  // Mock data
  const students: Student[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@university.edu',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      skills: ['React', 'TypeScript', 'Node.js', 'Python'],
      github: 'https://github.com/sarahchen',
      resume: 'sarah-chen-resume.pdf',
      university: 'Stanford University',
      year: 'Junior',
      gpa: 3.8,
      matchScore: 95,
      status: 'pending'
    },
    {
      id: '2',
      name: 'Alex Rodriguez',
      email: 'alex.r@mit.edu',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      skills: ['Machine Learning', 'Python', 'TensorFlow', 'Data Science'],
      github: 'https://github.com/alexrod',
      resume: 'alex-rodriguez-resume.pdf',
      university: 'MIT',
      year: 'Senior',
      gpa: 3.9,
      matchScore: 92,
      status: 'contacted'
    },
    {
      id: '3',
      name: 'Emily Johnson',
      email: 'emily.j@berkeley.edu',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      skills: ['Vue.js', 'JavaScript', 'CSS', 'UI/UX Design'],
      github: 'https://github.com/emilyjohnson',
      university: 'UC Berkeley',
      year: 'Sophomore',
      gpa: 3.7,
      matchScore: 88,
      status: 'pending'
    }
  ];

  const projects = [
    { id: 'all', name: 'All Projects' },
    { id: '1', name: 'Frontend Developer Intern' },
    { id: '2', name: 'AI/ML Research Assistant' },
    { id: '3', name: 'Full Stack Developer' }
  ];

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContact = (student: Student) => {
    console.log('Contacting student:', student.name);
  };

  const handleAccept = (student: Student) => {
    console.log('Accepting student:', student.name);
  };

  const handleReject = (student: Student) => {
    console.log('Rejecting student:', student.name);
  };

  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="AI Student Matches" 
        subtitle="Discover the best student candidates for your projects"
      />
      
      <div className="p-6">
        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
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
              placeholder="Filter by skill..."
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

        {/* Student Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-1" />
                      {student.university}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(student.matchScore)}`}>
                  <Star className="w-4 h-4 inline mr-1" />
                  {student.matchScore}%
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="w-4 h-4 mr-2" />
                  {student.year} • GPA: {student.gpa}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {student.email}
                </div>
                
                {student.github && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Github className="w-4 h-4 mr-2" />
                    <a href={student.github} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                      GitHub Profile
                    </a>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {student.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {student.skills.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{student.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </span>
                {student.resume && (
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Resume
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleContact(student)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Contact
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAccept(student)}
                >
                  Accept
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleReject(student)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Students
          </Button>
        </div>
      </div>
    </div>
  );
}