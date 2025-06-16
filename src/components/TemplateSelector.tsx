import React, { useEffect, useState } from 'react';
import { fetchTemplates, fetchTemplateById, applyTemplateToCertificate, CertificateTemplate } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TemplateSelectorProps {
  certificateId: string;
  onTemplateApplied?: (template: CertificateTemplate) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ certificateId, onTemplateApplied }) => {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates().then(setTemplates).catch(() => setError('Failed to load templates.'));
  }, []);

  const handleSelect = async (template: CertificateTemplate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTemplateById(template.id);
      setSelectedTemplate(template);
      setPreviewHtml(data.template_html || '');
      setShowModal(true);
    } catch {
      setError('Failed to load template preview.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedTemplate) return;
    setApplying(true);
    setError(null);
    try {
      await applyTemplateToCertificate(selectedTemplate.id, certificateId);
      setShowModal(false);
      onTemplateApplied && onTemplateApplied(selectedTemplate);
    } catch {
      setError('Failed to apply template.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Select a Certificate Template</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <ul className="space-y-2 mb-4">
        {templates.map(t => (
          <li key={t.id}>
            <Button variant="outline" onClick={() => handleSelect(t)} disabled={loading}>
              {t.name}
            </Button>
          </li>
        ))}
      </ul>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="border rounded p-4 bg-white min-h-[300px] max-h-[60vh] overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={applying}>Cancel</Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? 'Applying...' : 'Apply Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateSelector; 