import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PostProject from './pages/PostProject';
import Applications from './pages/Applications';
import StudentMatches from './pages/StudentMatches';
import UploadResumes from './pages/UploadResumes';

function App() {
  const isAuthenticated = true; // Mock authentication

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload-resumes" element={<UploadResumes />} />
            <Route path="/post-project" element={<PostProject />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/matches" element={<StudentMatches />} />
            <Route path="/messages" element={<div className="p-6">Messages - Coming Soon</div>} />
            <Route path="/notifications" element={<div className="p-6">Notifications - Coming Soon</div>} />
            <Route path="/calendar" element={<div className="p-6">Calendar - Coming Soon</div>} />
            <Route path="/settings" element={<div className="p-6">Settings - Coming Soon</div>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;