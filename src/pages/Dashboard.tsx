
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Plus, Edit2, Trash2, Users, Mail, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { profileAPI, type Certificate } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setIsLoading(true);
    try {
      const profile = await profileAPI.getProfile();
      setCertificates(profile.certificates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load certificates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await profileAPI.deleteCertificate(id);
        toast({
          title: "Success",
          description: "Certificate deleted successfully.",
        });
        loadCertificates();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete certificate. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= new Date();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="h-8 w-8" />
              Certificates Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage your certificates and graduants</p>
          </div>
          <Button onClick={() => navigate('/create-certificate')} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Certificate
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificates.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Award className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {certificates.filter(cert => !cert.expiry_date || !isExpired(cert.expiry_date)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {certificates.filter(cert => cert.expiry_date && isExpiringSoon(cert.expiry_date)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {certificates.filter(cert => cert.expiry_date && isExpired(cert.expiry_date)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Certificates</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <LoadingState variant="skeleton" />
                  </CardHeader>
                  <CardContent>
                    <LoadingState variant="skeleton" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <EmptyState
              icon={<Award className="h-12 w-12" />}
              title="No certificates found"
              description="Create your first certificate to get started with managing graduants and sending certificates."
              action={{
                label: "Create Certificate",
                onClick: () => navigate('/create-certificate')
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{cert.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {cert.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      {cert.expiry_date && (
                        <Badge 
                          variant={
                            isExpired(cert.expiry_date) 
                              ? "destructive" 
                              : isExpiringSoon(cert.expiry_date) 
                                ? "secondary" 
                                : "default"
                          }
                          className="ml-2"
                        >
                          {isExpired(cert.expiry_date) 
                            ? "Expired" 
                            : isExpiringSoon(cert.expiry_date) 
                              ? "Expiring" 
                              : "Active"
                          }
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Certificate Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Issue Date:</span>
                          <span>{formatDate(cert.issued_date)}</span>
                        </div>
                        {cert.expiry_date && (
                          <div className="flex justify-between">
                            <span>Expires:</span>
                            <span className={isExpired(cert.expiry_date) ? 'text-red-600' : ''}>
                              {formatDate(cert.expiry_date)}
                            </span>
                          </div>
                        )}
                        {cert.cpe_hours && (
                          <div className="flex justify-between">
                            <span>CPE Hours:</span>
                            <span>{cert.cpe_hours}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Signatories:</span>
                          <span>{cert.signatories.length}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/edit-certificate/${cert.id}`)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/add-graduants?certificate=${cert.id}`)}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Graduants
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/send-email?certificate=${cert.id}`)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Send
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cert.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
