import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Edit, Trash2, Plus, FileSignature } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { certificateAPI, profileAPI, type Certificate } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { SignatoryForm } from '@/components/SignatoryForm';

const Certificates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

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

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await certificateAPI.delete(id);
        toast({
          title: "Certificate Deleted",
          description: "The certificate has been deleted successfully.",
        });
        loadCertificates();
      } catch (error) {
        // Handle actual errors
        toast({
          title: "Error",
          description: "Failed to delete certificate. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (certificate: Certificate) => {
    navigate(`/edit-certificate/${certificate.id}`);
  };

  const handleSignatoryChange = async () => {
    await loadCertificates();
    const updated = certificates.find(c => c.id === selectedCertificate?.id);
    if (updated) {
      setSelectedCertificate(updated);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-8 w-8" />
                My Certificates
              </h1>
              <p className="text-gray-600 mt-2">Manage your certificates and signatories</p>
            </div>
            <Button onClick={() => navigate('/create-certificate')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Certificate
            </Button>
          </div>

          <div className="space-y-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{certificate.name}</CardTitle>
                      <CardDescription>
                        Created on {new Date(certificate.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(certificate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(certificate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="mt-1">{certificate.description || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">CPE Hours</p>
                        <p className="mt-1">{certificate.cpe_hours || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Issue Date</p>
                        <p className="mt-1">{certificate.issued_date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                        <p className="mt-1">{certificate.expiry_date || 'N/A'}</p>
                      </div>
                    </div>

                    {certificate.signatories.length > 0 ? (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Signatories</p>
                        <div className="space-y-2">
                          {certificate.signatories.map((signatory) => (
                            <div
                              key={signatory.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{signatory.name}</p>
                                {signatory.title && (
                                  <p className="text-sm text-gray-600">{signatory.title}</p>
                                )}
                                {signatory.organization && (
                                  <p className="text-sm text-gray-600">{signatory.organization}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedCertificate(certificate)}
                        >
                          <FileSignature className="h-4 w-4 mr-2" />
                          Add Signatories
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {certificates.length === 0 && (
              <Card>
                <CardContent className="text-center py-6">
                  <p className="text-gray-500">No certificates found. Create your first certificate!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add Signatories</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCertificate(null)}
                  >
                    ✕
                  </Button>
                </div>
                <SignatoryForm
                  certificateId={selectedCertificate.id}
                  existingSignatories={selectedCertificate.signatories}
                  onSignatoryChange={handleSignatoryChange}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Certificates; 