import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, LogOut, User } from 'lucide-react';
import { BASE_URL } from '@/services/api';

const Header = () => {
  const { user, logout } = useAuth();

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-professional-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container-enhanced">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/lovable-uploads/29663671-8ba1-491f-9e2b-22ba42288eb9.png" 
                alt="Scratch & Script Logo" 
                className="h-12 logo-animation"
              />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold gradient-text">Scratch & Script</h1>
                <p className="text-xs text-muted-foreground">Certificate Management</p>
              </div>
            </Link>
          </div>
          
          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/profile">
              <Button variant="ghost" className="rounded-xl h-12 px-4 hover:bg-muted/50 transition-all duration-300">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            
            {/*  <Button 
              variant="ghost" 
              className="rounded-xl h-12 px-4 hover:bg-destructive/10 hover:text-destructive transition-all duration-300" 
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button> */}

            {/* Enhanced User Avatar */}
            <div className="flex items-center space-x-3 pl-4 border-l border-border/50">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                <AvatarImage src={getImageUrl(user?.profile_image || '')} alt={user?.name} />
                <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
