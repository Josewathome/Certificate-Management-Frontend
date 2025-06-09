import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Award,
  Mail,
  Users,
  Menu,
  X,
  ChevronRight,
  Home
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Certificates', path: '/' },
    { icon: Users, label: 'Add Graduants', path: '/add-graduants' },
    { icon: Mail, label: 'Send Email', path: '/send-email' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {/* Sidebar Toggle Button - Mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden fixed top-20 left-4 z-50"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Sidebar */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-transform duration-200 ease-in-out
            w-64 bg-white border-r border-gray-200 pt-20 lg:pt-4
          `}
        >
          {/* Sidebar Toggle Button - Desktop */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex absolute -right-3 top-4"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <ChevronRight className={`h-4 w-4 transform transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </Button>

          <nav className="px-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout; 