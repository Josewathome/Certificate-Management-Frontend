import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, LogOut, Award, Users, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CertificateEditor from './CertificateEditor';
import { Route } from 'react-router-dom';

const Index = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen auth-gradient flex items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto">
          <img 
            src="/lovable-uploads/29663671-8ba1-491f-9e2b-22ba42288eb9.png" 
            alt="Scratch & Script Logo" 
            className="h-32 mx-auto mb-8 logo-animation"
          />
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to Scratch & Script
          </h1>
          <p className="text-xl text-red-100 mb-8">
            Your journey begins here. Join our community today.
          </p>
          <div className="space-x-4">
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600 mt-2">
            Ready to start your next project?
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/create-certificate">
            <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 text-lg">
              <Award className="h-8 w-8" />
              Create Certificate
            </Button>
          </Link>
          <Link to="/add-graduants">
            <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 text-lg" variant="outline">
              <Users className="h-8 w-8" />
              Add Graduants
            </Button>
          </Link>
          <Link to="/send-email">
            <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 text-lg" variant="secondary">
              <Mail className="h-8 w-8" />
              Send Email
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
              <CardDescription>
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Phone:</strong> {user?.phone_number}</p>
              </div>
              <Link to="/profile" className="mt-4 inline-block">
                <Button size="sm">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Explore what you can do
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Your dashboard is ready! This is where your journey with Scratch & Script begins.
              </p>
              <Button size="sm" variant="outline">
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/profile" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
