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
import {  LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [certificates, setCertificates] = useState([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const { logout } = useAuth();

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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      <Header />
      
      <div className="flex-1 flex relative">
        {/* Sidebar Overlay (all screens) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {/* Sidebar Toggle Button (always visible) */}
        <Button
          variant="outline"
          size="sm"
          className="fixed top-24 left-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg border-white/20 hover:bg-white/95 transition-all duration-200"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        {/* Floating Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out",
            isSidebarOpen ? "w-64" : "w-0",
            "bg-white/95 backdrop-blur-xl border-r border-slate-200/60 pt-20 shadow-2xl overflow-y-auto no-scrollbar"
          )}
          style={{ pointerEvents: isSidebarOpen ? 'auto' : 'none' }}
        >
          <div className={cn("h-full flex flex-col", isSidebarOpen ? "opacity-100" : "opacity-0")}
            style={{ transition: 'opacity 0.3s' }}
          >
            {/* Sidebar content here (navigation, etc.) */}
            <div className={cn(
              "px-6 py-6 border-b border-slate-200/60 transition-all duration-300",
              !isSidebarOpen && "lg:px-3 lg:py-4"
            )}> 
              <div className={cn(
                "transition-all duration-300",
                !isSidebarOpen && "lg:text-center lg:opacity-0 lg:h-0 lg:overflow-hidden"
              )}>
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Certificate Manager
                </h2>
                <p className="text-sm text-slate-600 mt-1">Manage your certificates</p>
              </div>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className={cn(
                    "w-full transition-all duration-200 group",
                    location.pathname === item.path 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30" 
                      : "hover:bg-slate-100/80 hover:shadow-md text-slate-700 hover:text-slate-900",
                    isSidebarOpen ? "justify-start px-4" : "lg:justify-center lg:px-2",
                    "h-12 rounded-xl font-medium"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isSidebarOpen ? "mr-3" : "lg:mr-0",
                    location.pathname === item.path ? "text-white" : "text-slate-600 group-hover:text-slate-800"
                  )} />
                  <span className={cn(
                    "transition-all duration-300 font-medium",
                    !isSidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  )}>
                    {item.label}
                  </span>
                </Button>
              ))}
              {/* Certificate Editor Modal Trigger */}
              <Button
                variant="ghost"
                className={cn(
                  "w-full transition-all duration-200 group hover:bg-slate-100/80 hover:shadow-md text-slate-700 hover:text-slate-900",
                  isSidebarOpen ? "justify-start px-4" : "lg:justify-center lg:px-2",
                  "h-12 rounded-xl font-medium"
                )}
                onClick={() => setShowCertModal(true)}
              >
                <FileText className={cn(
                  "h-5 w-5 transition-all duration-200 text-slate-600 group-hover:text-slate-800",
                  isSidebarOpen ? "mr-3" : "lg:mr-0"
                )} />
                <span className={cn(
                  "transition-all duration-300 font-medium",
                  !isSidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                )}>
                  Certificate Editor
                </span>
              </Button>
              {/* Certificate Selection Modal */}
              {showCertModal && (
                <Dialog open={showCertModal} onOpenChange={setShowCertModal}>
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Select Certificate to Edit</h3>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {certificates.length === 0 && (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No certificates found</p>
                            <p className="text-sm text-slate-400 mt-1">Create a certificate first</p>
                          </div>
                        )}
                        {certificates.map((cert) => (
                          <Button
                            key={cert.id}
                            variant="outline"
                            className="w-full justify-start p-4 h-auto rounded-xl border-slate-200/60 hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-200"
                            onClick={() => {
                              navigate(`/certificate/${cert.id}/`);
                              setShowCertModal(false);
                              setIsSidebarOpen(false);
                            }}
                          >
                            <div className="text-left">
                              <div className="font-semibold text-slate-900">{cert.name}</div>
                              <div className="text-sm text-slate-500 mt-1">Click to edit</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        className="mt-6 w-full rounded-xl font-medium hover:bg-slate-100/80"
                        onClick={() => setShowCertModal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Dialog>
              )}
            </nav>
            {/* Quick Actions */}
            <div className={cn(
              "px-4 py-6 border-t border-slate-200/60 transition-all duration-300",
              !isSidebarOpen && "lg:px-2"
            )}>
              <div className={cn(
                "transition-all duration-300",
                !isSidebarOpen && "lg:text-center"
              )}>
                <p className={cn(
                  "text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 transition-all duration-300",
                  !isSidebarOpen && "lg:opacity-0 lg:h-0 lg:overflow-hidden lg:mb-0"
                )}>
                  Quick Actions
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full transition-all duration-200 border-slate-200/60 hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 rounded-xl font-medium",
                    isSidebarOpen ? "justify-start h-10" : "lg:justify-center lg:h-10 lg:px-2"
                  )}
                  onClick={() => navigate('/create-certificate')}
                >
                  <Plus className={cn(
                    "h-4 w-4 text-primary transition-all duration-200",
                    isSidebarOpen ? "mr-2" : "lg:mr-0"
                  )} />
                  <span className={cn(
                    "transition-all duration-300",
                    !isSidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  )}>
                    New Certificate
                  </span>
                </Button>
                <p> </p>
                <Button 
                  variant="ghost" 
                  className="rounded-xl h-12 px-4 hover:bg-destructive/10 hover:text-destructive transition-all duration-300" 
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </aside>
        {/* Main Content (never moves) */}
        <main className="flex-1 min-h-[calc(100vh-64px)] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;