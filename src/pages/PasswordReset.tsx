
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const token = searchParams.get('token');
  const uid = searchParams.get('uid');
  const isResetForm = token && uid;

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.passwordReset({ email });
      setEmailSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.passwordResetConfirm({
        token: token!,
        uid: uid!,
        new_password: newPassword,
      });
      setResetComplete(true);
      toast({
        title: "Password Reset Complete",
        description: "Your password has been successfully reset.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Failed to reset password. The link may be expired.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 auth-gradient">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">
                Password Reset Complete
              </CardTitle>
              <CardDescription>
                Your password has been successfully reset.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/login">
                <Button className="w-full">
                  Continue to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (emailSent && !isResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 auth-gradient">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">
                Email Sent
              </CardTitle>
              <CardDescription>
                We've sent a password reset link to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please check your email and click the link to reset your password.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 auth-gradient">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/29663671-8ba1-491f-9e2b-22ba42288eb9.png" 
            alt="Scratch & Script Logo" 
            className="h-20 mx-auto mb-4 logo-animation"
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            {isResetForm ? 'Reset Password' : 'Forgot Password'}
          </h1>
          <p className="text-red-100">
            {isResetForm ? 'Enter your new password' : 'Enter your email to reset your password'}
          </p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isResetForm ? 'Set New Password' : 'Password Reset'}
            </CardTitle>
            <CardDescription className="text-center">
              {isResetForm 
                ? 'Choose a strong new password for your account'
                : 'We\'ll send you a link to reset your password'
              }
            </CardDescription>
          </CardHeader>
          
          {isResetForm ? (
            <form onSubmit={handlePasswordReset}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new_password"
                      type="password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </CardContent>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-primary hover:underline">
                    <ArrowLeft className="h-4 w-4 inline mr-1" />
                    Back to Login
                  </Link>
                </div>
              </CardContent>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset;
