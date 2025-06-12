import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Award,
  Mail,
  Users,
  Menu,
  X,
  ChevronRight,
  Home,
  Plus,
  FileText
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { cn } from '@/lib/utils';
import { profileAPI } from '@/services/api';
import { Dialog } from '@radix-ui/react-dialog';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [certificates, setCertificates] = useState([]);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const profile = await profileAPI.getProfile();
        setCertificates(profile.certificates || []);
      } catch (e) {
        setCertificates([]);
      }
    }
    fetchCertificates();
  }, []);

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Award, label: 'Create Certificate', path: '/create-certificate' },
    { icon: Users, label: 'Add Graduants', path: '/add-graduants' },
    { icon: Mail, label: 'Send Emails', path: '/send-email' },
    // Certificate Editor is now a modal picker
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Toggle Button - Mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden fixed top-20 left-4 z-50 bg-white shadow-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-40",
            "transform transition-transform duration-200 ease-in-out",
            isSidebarOpen
              ? "w-64 lg:w-64 translate-x-0 lg:ml-0"
              : "w-64 lg:w-16 -translate-x-full lg:translate-x-0 lg:ml-0"
            ,
            "bg-white border-r border-gray-200 pt-20 lg:pt-4",
            "shadow-lg lg:shadow-none"
          )}
        >
          {/* Sidebar Toggle Button - Desktop */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex absolute -right-3 top-4 bg-white border shadow-sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <ChevronRight className={cn("h-4 w-4 transform transition-transform", 
              isSidebarOpen ? "rotate-180" : ""
            )} />
          </Button>

          <div className="h-full flex flex-col">
            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              <div className={cn("pb-4 border-b border-gray-200 mb-4", !isSidebarOpen && "lg:px-0 lg:text-center")}> 
                <h2 className={cn("text-lg font-semibold text-gray-900 transition-all", !isSidebarOpen && "lg:text-xs lg:font-bold lg:tracking-widest lg:overflow-hidden lg:w-0 lg:h-0 lg:p-0 lg:m-0")}>Certificate Manager</h2>
                <p className={cn("text-sm text-gray-600 transition-all", !isSidebarOpen && "lg:hidden")}>Manage your certificates</p>
              </div>

              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-colors",
                    location.pathname === item.path 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-gray-100",
                    !isSidebarOpen && "lg:justify-center"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                >
                  <item.icon className="h-4 w-4 mr-3 lg:mr-0" />
                  <span className={cn("transition-all", !isSidebarOpen && "lg:hidden")}>{item.label}</span>
                </Button>
              ))}

              {/* Certificate Editor Modal Trigger */}
              <Button
                variant="ghost"
                className={cn("w-full justify-start hover:bg-gray-100", !isSidebarOpen && "lg:justify-center")}
                onClick={() => setShowCertModal(true)}
              >
                <FileText className="h-4 w-4 mr-3 lg:mr-0" />
                <span className={cn("transition-all", !isSidebarOpen && "lg:hidden")}>Certificate Editor</span>
              </Button>

              {/* Modal for picking a certificate */}
              {showCertModal && (
                <Dialog open={showCertModal} onOpenChange={setShowCertModal}>
                  <>
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Select a Certificate to Edit</h3>
                        <ul className="space-y-2 max-h-80 overflow-y-auto">
                          {certificates.length === 0 && <li className="text-gray-500">No certificates found.</li>}
                          {certificates.map((cert) => (
                            <li key={cert.id}>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                  navigate(`/certificate/${cert.id}/`);
                                  setShowCertModal(false);
                                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                }}
                              >
                                {cert.name}
                              </Button>
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant="ghost"
                          className="mt-4 w-full"
                          onClick={() => setShowCertModal(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                </Dialog>
              )}
            </nav>

            {/* Quick Actions */}
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quick Actions
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/create-certificate')}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  New Certificate
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-200",
          "p-4 lg:p-8",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
