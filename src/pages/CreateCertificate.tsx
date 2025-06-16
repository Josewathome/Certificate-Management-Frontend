import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Award, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { certificateAPI, profileAPI, type CertificateRequest, type Certificate } from '@/services/api';
import { SignatoryForm } from '@/components/SignatoryForm';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { fetchTemplates, fetchTemplateById, applyTemplateToCertificate, CertificateTemplate } from '@/services/api';

const CreateCertificate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [createdCertificate, setCreatedCertificate] = useState<Certificate | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateRequest>({
    name: '',
    description: '',
    cpe_hours: '',
    logo1: undefined,
    logo2: undefined,
    issued_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
  });
  const [templateApplied, setTemplateApplied] = useState(false);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [applying, setApplying] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  useEffect(() => {
    const loadCertificate = async () => {
      if (id) {
        try {
          const profile = await profileAPI.getProfile();
          const certificate = profile.certificates.find(c => c.id === id);
          if (certificate) {
            setCertificateData({
              name: certificate.name,
              description: certificate.description || '',
              cpe_hours: certificate.cpe_hours || '',
              issued_date: certificate.issued_date,
              expiry_date: certificate.expiry_date || '',
            });
            setCreatedCertificate(certificate);
          } else {
            navigate('/');
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load certificate. Please try again.",
            variant: "destructive",
          });
          navigate('/');
        }
      }
    };

    loadCertificate();
  }, [id]);

  useEffect(() => {
    fetchTemplates().then(setTemplates).catch(() => {/* ignore */});
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCertificateData({
      ...certificateData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateData({
        ...certificateData,
        [e.target.name]: e.target.files[0],
      });
    }
  };

  const refreshCertificate = async () => {
    if (createdCertificate) {
      try {
        const profile = await profileAPI.getProfile();
        const updatedCertificate = profile.certificates.find(
          cert => cert.id === createdCertificate.id
        );
        if (updatedCertificate) {
          setCreatedCertificate(updatedCertificate);
        }
      } catch (error) {
        console.error('Failed to refresh certificate:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let certificate;
      if (id) {
        certificate = await certificateAPI.update(id, certificateData);
        toast({
          title: "Certificate Updated",
          description: "Your certificate has been updated successfully.",
        });
      } else {
        certificate = await certificateAPI.create(certificateData);
        toast({
          title: "Certificate Created",
          description: "Your certificate has been created successfully. You can now add signatories.",
        });
      }
      
      setCreatedCertificate(certificate);

      if (!id) {
        // Only reset form for new certificates
        setCertificateData({
          name: '',
          description: '',
          cpe_hours: '',
          logo1: undefined,
          logo2: undefined,
          issued_date: new Date().toISOString().split('T')[0],
          expiry_date: '',
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${id ? 'update' : 'create'} certificate. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDropdownSelect = async (value: string) => {
    setDropdownLoading(true);
    setSelectedTemplateId(value);
    try {
      const template = templates.find(t => t.id.toString() === value);
      if (template) {
        const data = await fetchTemplateById(template.id);
        setSelectedTemplate(template);
        setPreviewHtml(data.template_html || '');
        setShowPreview(true);
      }
    } finally {
      setDropdownLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !createdCertificate) return;
    setApplying(true);
    try {
      await applyTemplateToCertificate(selectedTemplate.id, createdCertificate.id);
      setShowPreview(false);
      setTemplateApplied(true);
    } finally {
      setApplying(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-8 w-8" />
          {id ? 'Edit Certificate' : 'Create Certificate'}
        </h1>
        <p className="text-gray-600 mt-2">
          {id ? 'Update your certificate details' : 'Create a new certificate'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Certificate Details' : 'New Certificate'}</CardTitle>
          <CardDescription>
            {id ? 'Update the details for your certificate' : 'Fill in the details for your new certificate'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Certificate Name</Label>
              <Input
                id="name"
                name="name"
                value={certificateData.name}
                onChange={handleInputChange}
                placeholder="Enter certificate or course name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={certificateData.description}
                onChange={handleInputChange}
                placeholder="Enter certificate description"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="cpe_hours">CPE Hours</Label>
              <Input
                id="cpe_hours"
                name="cpe_hours"
                value={certificateData.cpe_hours}
                onChange={handleInputChange}
                placeholder="Enter CPE hours"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo1">Logo 1</Label>
                <Input
                  id="logo1"
                  name="logo1"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
              <div>
                <Label htmlFor="logo2">Logo 2</Label>
                <Input
                  id="logo2"
                  name="logo2"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issued_date">Issue Date</Label>
                <Input
                  id="issued_date"
                  name="issued_date"
                  type="date"
                  value={certificateData.issued_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  value={certificateData.expiry_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {id ? 'Update Certificate' : 'Create Certificate'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {createdCertificate && !templateApplied && (
        <div className="mt-8 flex flex-col items-start">
          <label className="mb-2 text-sm font-medium">Select a Certificate Template</label>
          <Select
            value={selectedTemplateId}
            onValueChange={handleDropdownSelect}
            disabled={dropdownLoading}
          >
            <SelectTrigger className="h-10 px-4 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-200 text-sm font-medium w-[220px]">
              {dropdownLoading
                ? 'Loading...'
                : selectedTemplate
                  ? selectedTemplate.name
                  : 'Choose Template'}
            </SelectTrigger>
            <SelectContent>
              {templates.map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
              </DialogHeader>
              <div className="border rounded p-4 bg-white min-h-[300px] max-h-[60vh] overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPreview(false)} disabled={applying}>Cancel</Button>
                <Button onClick={handleApplyTemplate} disabled={applying}>
                  {applying ? 'Applying...' : 'Apply Template'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {createdCertificate && templateApplied && (
        <SignatoryForm
          certificateId={createdCertificate.id}
          existingSignatories={createdCertificate.signatories}
          onSignatoryChange={refreshCertificate}
        />
      )}
    </DashboardLayout>
  );
};

export default CreateCertificate;
