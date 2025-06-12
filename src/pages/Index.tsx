
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, LogOut, Award, Users, Mail, ArrowRight, Star, Shield, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen auth-gradient flex items-center justify-center p-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="fade-in">
            <img 
              src="/lovable-uploads/29663671-8ba1-491f-9e2b-22ba42288eb9.png" 
              alt="Scratch & Script Logo" 
              className="h-32 mx-auto mb-8 logo-animation"
            />
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 gradient-text">
              Welcome to Scratch & Script
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Your professional journey begins here. Create, manage, and distribute certificates with elegance and precision.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-white">
              <div className="glass-effect rounded-2xl p-6 slide-up">
                <Star className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Professional Design</h3>
                <p className="text-white/80 text-sm">Beautiful, customizable certificate templates</p>
              </div>
              <div className="glass-effect rounded-2xl p-6 slide-up" style={{ animationDelay: '0.2s' }}>
                <Shield className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-white/80 text-sm">Industry-standard security for your data</p>
              </div>
              <div className="glass-effect rounded-2xl p-6 slide-up" style={{ animationDelay: '0.4s' }}>
                <Zap className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-white/80 text-sm">Instant certificate generation and delivery</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg text-white">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
      <Header />

      <main className="flex-1 container-enhanced section-padding">
        <div className="fade-in">
          <div className="mb-12 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Welcome back, <span className="gradient-text">{user?.name}</span>!
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to create something extraordinary? Your dashboard awaits.
            </p>
          </div>

          {/* Enhanced Quick Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Link to="/create-certificate" className="group">
              <div className="card-enhanced p-8 text-center h-full hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Create Certificate</h3>
                <p className="text-muted-foreground mb-4">Design and customize professional certificates</p>
                <div className="inline-flex items-center text-primary font-medium">
                  Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
            
            <Link to="/add-graduants" className="group">
              <div className="card-enhanced p-8 text-center h-full hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Manage Graduants</h3>
                <p className="text-muted-foreground mb-4">Add and organize your certificate recipients</p>
                <div className="inline-flex items-center text-primary font-medium">
                  Manage <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
            
            <Link to="/send-email" className="group">
              <div className="card-enhanced p-8 text-center h-full hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Send Certificates</h3>
                <p className="text-muted-foreground mb-4">Distribute certificates via email instantly</p>
                <div className="inline-flex items-center text-primary font-medium">
                  Send Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </div>

          {/* Enhanced Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-enhanced">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  Profile Overview
                </CardTitle>
                <CardDescription className="text-base">
                  Your account information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">Username:</span>
                    <span className="font-semibold">{user?.username}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-medium text-muted-foreground">Email:</span>
                    <span className="font-semibold">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-muted-foreground">Phone:</span>
                    <span className="font-semibold">{user?.phone_number}</span>
                  </div>
                </div>
                <Link to="/profile" className="inline-block w-full">
                  <Button className="w-full mt-4 rounded-xl">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Getting Started</CardTitle>
                <CardDescription className="text-base">
                  Explore the powerful features available to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Your professional dashboard is ready! This is where your journey with Scratch & Script begins. 
                  Create beautiful certificates, manage recipients, and distribute them with ease.
                </p>
                <Button variant="outline" className="w-full rounded-xl">
                  <Award className="mr-2 h-4 w-4" />
                  Explore Features
                </Button>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription className="text-base">
                  Frequently used tools and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to="/profile" className="block">
                    <Button variant="ghost" className="w-full justify-start h-12 rounded-xl hover:bg-muted/50">
                      <Settings className="h-4 w-4 mr-3" />
                      Account Settings
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-12 rounded-xl hover:bg-destructive/10 hover:text-destructive" 
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
