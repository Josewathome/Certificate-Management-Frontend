
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthErrorBoundary from "@/components/AuthErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CreateCertificate from "./pages/CreateCertificate";
import Certificates from "./pages/Certificates";
import AddGraduants from "./pages/AddGraduants";
import SendEmail from "./pages/SendEmail";
import PasswordReset from "./pages/PasswordReset";
import NotFound from "./pages/NotFound";
import Dashboard from '@/pages/Dashboard';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthErrorBoundary>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Certificates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-certificate" 
                element={
                  <ProtectedRoute>
                    <CreateCertificate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-certificate/:id" 
                element={
                  <ProtectedRoute>
                    <CreateCertificate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/certificates" 
                element={
                  <ProtectedRoute>
                    <Navigate to="/" replace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-graduants" 
                element={
                  <ProtectedRoute>
                    <AddGraduants />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/send-email" 
                element={
                  <ProtectedRoute>
                    <SendEmail />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </AuthErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
