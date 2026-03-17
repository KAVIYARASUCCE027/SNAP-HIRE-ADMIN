import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageCircle,
  Bell,
  Calendar,
  Settings,
  LogOut,
  Briefcase
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Post Project', href: '/post-project', icon: FileText },
  { name: 'Applications', href: '/applications', icon: Users },
  { name: 'Student Matches', href: '/matches', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageCircle },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-700">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <span className="text-white text-xl font-bold">SnapHire</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer transition-all duration-200">
          <LogOut className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Sign Out</span>
        </div>
      </div>
    </div>
  );
}