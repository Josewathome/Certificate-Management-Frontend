import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getCertificate, updateCertificateTemplate, BASE_URL, fetchTemplates, fetchTemplateById, applyTemplateToCertificate, CertificateTemplate } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, Eye, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import nunjucks from 'nunjucks';
import DashboardLayout from '@/components/DashboardLayout';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Configure Nunjucks (no templates directory needed for client-side)
nunjucks.configure({ autoescape: false });

// Utility for base64 encoding/decoding with error handling
const encode = (str: string): string => {
  try {
    return window.btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    console.error('Failed to encode string:', e);
    return str;
  }
};

const decode = (str: string): string => {
  try {
    return decodeURIComponent(escape(window.atob(str)));
  } catch (e) {
    console.error('Failed to decode string:', e);
    return str;
  }
};

const LOCAL_STORAGE_KEY = (id: string) => `certificate_template_draft_${id}`;

// Helper to get available placeholders from certificate data
function getAvailablePlaceholders(certificate: any) {
  const basicFields = [
    'name',
    'description',
    'cpe_hours',
    'logo1',
    'logo2',
    'issued_date',
    'expiry_date'
  ];

  const signatoryFields = [
    'name',
    'title',
    'organization',
    'signature',
    'logo'
  ];

  const placeholders = [
    // Basic fields
    ...basicFields.map(field => ({
      placeholder: `{{${field}}}`,
      value: certificate[field] || '',
      description: `Certificate ${field.replace('_', ' ')}`
    })),
  ];

  // Add signatory fields if signatories exist
  if (certificate.signatories?.length > 0) {
    certificate.signatories.forEach((_, index) => {
      signatoryFields.forEach(field => {
        placeholders.push({
          placeholder: `{{signatory.${index}.${field}}}`,
          value: certificate.signatories[index]?.[field] || '',
          description: `Signatory ${index + 1} ${field}`
        });
      });
    });
  }

  return placeholders;
}

// Enhanced placeholder injection with proper HTML handling
function injectPlaceholders(html: string, data: Record<string, any>) {
  if (!html || !data) return '';
  let processedHtml = html;

  // Basic fields
  const basicFields = ['name', 'description', 'cpe_hours', 'issued_date', 'expiry_date'];
  basicFields.forEach(field => {
    const regex = new RegExp(`\{\{\s*${field}\s*\}\}`, 'g');
    processedHtml = processedHtml.replace(regex, (match) => {
      if (data[field] === undefined || data[field] === null || data[field] === '') return match;
      return data[field].toString().replace(/[&<>"]'/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char]!));
    });
  });

  // Signatories
  if (Array.isArray(data.signatories)) {
    data.signatories.forEach((signatory, index) => {
      // Text fields
      ['name', 'title', 'organization'].forEach(field => {
        const regex = new RegExp(`\{\{\s*signatory\.${index}\.${field}\s*\}\}`, 'g');
        processedHtml = processedHtml.replace(regex, (match) => {
          if (!signatory[field]) return match;
          return signatory[field];
        });
      });
      // Signature image
      const sigRegex = new RegExp(`\{\{\s*signatory\.${index}\.signature\s*\}\}`, 'g');
      processedHtml = processedHtml.replace(sigRegex, (match) => {
        if (!signatory.signature) return match;
        return `<img src="${signatory.signature}" alt="Signature of ${signatory.name || ''}" style="max-width: 200px; height: auto;" class="signature-image" />`;
      });
      // Logo image
      const logoRegex = new RegExp(`\{\{\s*signatory\.${index}\.logo\s*\}\}`, 'g');
      processedHtml = processedHtml.replace(logoRegex, (match) => {
        if (!signatory.logo) return match;
        return `<img src="${signatory.logo}" alt="Logo for ${signatory.name || ''}" style="max-width: 150px; height: auto;" class="signatory-logo" />`;
      });
    });
  }

  // Certificate logos
  ['logo1', 'logo2'].forEach((logoField, index) => {
    const regex = new RegExp(`\{\{\s*${logoField}\s*\}\}`, 'g');
    processedHtml = processedHtml.replace(regex, (match) => {
      if (!data[logoField]) return match;
      return `<img src="${data[logoField]}" alt="Certificate Logo ${index + 1}" style="max-width: 200px; height: auto;" class="certificate-logo" />`;
    });
  });

  return processedHtml;
}

// Helper to make image URLs absolute
function makeAbsoluteUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${BASE_URL}${path}`;
}

// Prepare template data to match backend logic, with absolute image URLs
function prepareTemplateData(certificate: any, entry: any = {}, signatories: any[] = []) {
  return {
    name: entry.name || certificate.name || '',
    membership_number: entry.member_no || '',
    event_name: certificate.name || '',
    date: certificate.issued_date
      ? new Date(certificate.issued_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : '',
    cpe_hours: certificate.cpe_hours || '0',
    certificate_id: entry.verification_uuid || certificate.id || '',
    issue_date: certificate.issued_date
      ? new Date(certificate.issued_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : '',
    signatories: (signatories.length ? signatories : certificate.signatories || []).map((signatory: any) => ({
      name: signatory.name,
      title: signatory.title || '',
      organization: signatory.organization || '',
      logo: makeAbsoluteUrl(signatory.logo),
      signature: makeAbsoluteUrl(signatory.signature),
    })),
    logo1: makeAbsoluteUrl(certificate.logo1),
    logo2: makeAbsoluteUrl(certificate.logo2),
    qr_code: makeAbsoluteUrl(entry.verification_QRcode || certificate.qr_code),
    description: certificate.description || '',
    expiry_date: certificate.expiry_date || '',
  };
}

const CertificateEditor: React.FC = () => {
  const { certificate_id } = useParams<{ certificate_id: string }>();
  const [activeTab, setActiveTab] = useState('edit');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [editValue, setEditValue] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [applying, setApplying] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // Get available placeholders for the current certificate
  const availablePlaceholders = certificate ? getAvailablePlaceholders(certificate) : [];

  // Load certificate data
  const fetchCertificate = useCallback(async () => {
    if (!certificate_id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getCertificate(certificate_id);
      setCertificate(data);
      
      // Check for local draft
      const draft = localStorage.getItem(LOCAL_STORAGE_KEY(certificate_id));
      if (draft) {
        const decodedDraft = decode(draft);
        setEditValue(decodedDraft);
        setHasDraft(true);
      } else {
        setEditValue(data.template_html || '');
        setHasDraft(false);
      }
    } catch (e: any) {
      setError(e.message || 'Error loading certificate');
    } finally {
      setLoading(false);
    }
  }, [certificate_id]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  useEffect(() => {
    fetchTemplates().then(setTemplates).catch(() => {/* ignore */});
  }, []);

  // Save draft to localStorage on edit with debounce
  useEffect(() => {
    if (!certificate_id || !editValue) return;
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY(certificate_id), encode(editValue));
        setHasDraft(true);
      } catch (e) {
        console.error('Failed to save draft:', e);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [certificate_id, editValue]);

  // Save handler
  const handleSave = async () => {
    if (!certificate_id) return;
    
    setSaving(true);
    setError(null);
    try {
      await updateCertificateTemplate(certificate_id, editValue);
      localStorage.removeItem(LOCAL_STORAGE_KEY(certificate_id));
      setHasDraft(false);
      await fetchCertificate();
      setActiveTab('preview');
    } catch (e: any) {
      setError(e.message || 'Error saving template');
    } finally {
      setSaving(false);
    }
  };

  // Discard draft handler
  const handleDiscardDraft = () => {
    if (!certificate_id || !certificate) return;
    
    localStorage.removeItem(LOCAL_STORAGE_KEY(certificate_id));
    setEditValue(certificate.template_html || '');
    setHasDraft(false);
  };

  const handleDropdownSelect = async (value: string) => {
    setDropdownLoading(true);
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
    if (!selectedTemplate || !certificate_id) return;
    setApplying(true);
    try {
      await applyTemplateToCertificate(selectedTemplate.id, certificate_id);
      setShowPreview(false);
      fetchCertificate();
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-4 text-red-500 bg-red-50 rounded-lg">
      {error}
    </div>
  );
  
  if (!certificate) return (
    <div className="p-4 text-gray-500 bg-gray-50 rounded-lg">
      Certificate not found.
    </div>
  );

  // Prepare the data for preview (no entry, just certificate and signatories)
  const preparedData = prepareTemplateData(certificate);

  // Render the template using Nunjucks for preview
  let renderedHtml = '';
  try {
    renderedHtml = nunjucks.renderString(editValue || certificate.template_html, preparedData);
  } catch (e) {
    renderedHtml = `<div style='color:red'>Template rendering error: ${e.message}</div>`;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Edit2 className="h-6 w-6" />
              Certificate Template Editor
            </CardTitle>
            <CardDescription>
              Edit and preview your certificate template with live data injection use Django/Jinja-style
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasDraft && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have unsaved changes in draft.
                  <Button
                    variant="link"
                    className="px-2 py-0 h-auto font-normal underline"
                    onClick={handleDiscardDraft}
                  >
                    Discard draft
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 items-center">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Template (Django/Jinja-style)
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <div className="ml-2 flex items-center">
                  <Select onValueChange={handleDropdownSelect} disabled={dropdownLoading}>
                    <SelectTrigger className="h-10 px-4 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-200 text-sm font-medium w-[180px]">
                      {dropdownLoading ? 'Loading...' : 'Re-select Template'}
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsList>

              <TabsContent value="edit" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Available Placeholders:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {availablePlaceholders.map((item, index) => (
                      <div key={index} className="flex flex-col gap-1">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {item.placeholder}
                        </code>
                        <span className="text-xs text-gray-500">{item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <textarea
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  rows={20}
                  className="w-full p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  spellCheck={false}
                />
                
                <div className="flex justify-end gap-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-600">
                      Live Preview with Data
                    </h3>
                    <div className="text-xs text-gray-500">
                      {availablePlaceholders.length} placeholders available
                    </div>
                  </div>
                  <div className="p-8 min-h-[600px] bg-white">
                    <div
                      className="certificate-preview"
                      dangerouslySetInnerHTML={{
                        __html: renderedHtml,
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {showPreview && (
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CertificateEditor; 