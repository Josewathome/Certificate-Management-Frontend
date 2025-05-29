
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, LogOut } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/29663671-8ba1-491f-9e2b-22ba42288eb9.png" 
              alt="Scratch & Script Logo" 
              className="h-10 mr-3"
            />
            <h1 className="text-xl font-bold text-gray-900">Scratch & Script</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profile_image} alt={user?.name} />
              <AvatarFallback>
                {user?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
