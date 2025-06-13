
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username_or_email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/');
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 auth-gradient">
      <div className="w-full max-w-md">
        {/* Enhanced Header */}
        <div className="text-center mb-8 fade-in">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/29663671-8ba1-491f-9e2b-22ba42288eb9.png" 
            alt="Scratch & Script Logo" 
            className="h-24 logo-animation"
          />
          <div>
            <h1 className="text-xl font-bold text-white">Scratch & Script</h1>
            <p className="text-white/80 text-lg">Certificate Management</p>
          </div>
        </div>


          <h1 className="text-4xl font-bold text-white mb-3 font-serif">Welcome Back</h1>
          <p className="text-white/80 text-lg">Sign in to your professional dashboard</p>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center mt-4 space-x-4 text-white/60">
            <div className="flex items-center text-sm">
              <Shield className="h-4 w-4 mr-1" />
              <span>Secure Login</span>
            </div>
          </div>
        </div>

        {/* Enhanced Login Card */}
        <Card className="shadow-professional-xl border-0 backdrop-blur-sm bg-white/95 slide-up rounded-2xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-foreground">Sign In</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit} className="form-enhanced">
            <CardContent className="space-y-6">
              <div className="form-group">
                <Label htmlFor="username_or_email" className="text-sm font-semibold">Email or Username</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username_or_email"
                    name="username_or_email"
                    type="text"
                    placeholder="Enter your email or username"
                    value={formData.username_or_email}
                    onChange={handleChange}
                    className="pl-10 h-12 rounded-xl border-2 focus:border-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-12 h-12 rounded-xl border-2 focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <Link 
                  to="/password-reset" 
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-300"
                >
                  Forgot your password?
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-xl btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-primary hover:text-primary/80 font-semibold transition-colors duration-300"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Additional Trust Elements */}
        <div className="text-center mt-6 text-white/60">
          <p className="text-sm">
            Protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
