import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Plus, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Projects', value: '12', icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Applicants', value: '248', icon: Users, color: 'bg-green-500' },
    { label: 'Matched Students', value: '67', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Interviews Scheduled', value: '15', icon: Calendar, color: 'bg-orange-500' },
  ];

  const recentProjects = [
    {
      id: '1',
      title: 'Frontend Developer Intern',
      applicants: 23,
      matches: 8,
      status: 'active',
      deadline: '2024-02-15'
    },
    {
      id: '2',
      title: 'AI/ML Research Assistant',
      applicants: 45,
      matches: 12,
      status: 'active',
      deadline: '2024-02-20'
    },
    {
      id: '3',
      title: 'Full Stack Developer',
      applicants: 67,
      matches: 15,
      status: 'closed',
      deadline: '2024-01-30'
    }
  ];

  const recentActivity = [
    { type: 'application', message: 'New application from Sarah Chen', time: '2 minutes ago' },
    { type: 'match', message: '5 new student matches for Frontend project', time: '1 hour ago' },
    { type: 'interview', message: 'Interview scheduled with Alex Rodriguez', time: '3 hours ago' },
    { type: 'application', message: 'Application reviewed for ML project', time: '1 day ago' },
  ];

  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="Welcome back, Taylor! 👋" 
        subtitle="Here's what's happening with your startup projects today"
      />
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/post-project')}
                className="w-full justify-start"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Post New Project
              </Button>
              <Button 
                onClick={() => navigate('/applications')}
                variant="outline" 
                className="w-full justify-start"
                size="lg"
              >
                <Users className="w-5 h-5 mr-2" />
                View All Applications
              </Button>
              <Button 
                onClick={() => navigate('/matches')}
                variant="outline" 
                className="w-full justify-start"
                size="lg"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                AI Student Matches
              </Button>
            </div>
          </Card>

          {/* Recent Projects */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{project.applicants} applicants</span>
                      <span>{project.matches} matches</span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {project.deadline}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                    {project.status === 'active' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'application' ? 'bg-blue-500' :
                  activity.type === 'match' ? 'bg-purple-500' :
                  activity.type === 'interview' ? 'bg-green-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}