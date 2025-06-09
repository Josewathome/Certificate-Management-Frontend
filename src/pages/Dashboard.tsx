import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Plus, Edit2, Trash2, Users, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { profileAPI, type Certificate } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const profile = await profileAPI.getProfile();
      setCertificates(profile.certificates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load certificates. Please try again.",
        variant: "destructive",
      });
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

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="h-8 w-8" />
              Certificates
            </h1>
            <p className="text-gray-600 mt-2">Manage your certificates and graduants</p>
          </div>
          <Button onClick={() => navigate('/create-certificate')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Certificate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <Card key={cert.id}>
            <CardHeader>
              <CardTitle className="truncate">{cert.name}</CardTitle>
              <CardDescription>
                {cert.description || 'No description provided'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>Issue Date: {new Date(cert.issued_date).toLocaleDateString()}</div>
                  {cert.expiry_date && (
                    <div>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</div>
                  )}
                </div>
                {cert.cpe_hours && (
                  <div className="text-sm text-gray-500">
                    CPE Hours: {cert.cpe_hours}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/edit-certificate/${cert.id}`)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/add-graduants?certificate=${cert.id}`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Graduants
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/send-email?certificate=${cert.id}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cert.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {certificates.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No certificates found. Create your first certificate to get started.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 