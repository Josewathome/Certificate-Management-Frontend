import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, Send, Users, FileText, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardLayout from '@/components/DashboardLayout';
import { profileAPI, certificateEntriesAPI, certificateGenerationAPI, type Certificate, type CertificateEntry } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SendEmail = () => {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string>('');
  const [entries, setEntries] = useState<CertificateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    if (selectedCertificate) {
      loadEntries();
    } else {
      setEntries([]);
    }
  }, [selectedCertificate]);

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

  const loadEntries = async () => {
    if (!selectedCertificate) return;

    setIsLoading(true);
    try {
      const response = await certificateEntriesAPI.getEntries({
        certificate__id: selectedCertificate,
        limit: 100, // Adjust as needed
      });
      setEntries(response.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCertificates = async () => {
    if (!selectedCertificate) {
      toast({
        title: "Error",
        description: "Please select a certificate first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await certificateGenerationAPI.generate(selectedCertificate);
      toast({
        title: "Success",
        description: "Certificates generated successfully.",
      });
      loadEntries(); // Refresh the list
    } catch (error: any) {
      let errorMessage = "Failed to generate certificates. Please try again.";
      if (error.data?.error === 'Invalid certificate ID format') {
        errorMessage = "Invalid certificate format.";
      } else if (error.data?.message === 'No pending certificates found') {
        errorMessage = "No pending certificates found to generate.";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmails = async () => {
    if (!selectedCertificate) {
      toast({
        title: "Error",
        description: "Please select a certificate first.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await certificateGenerationAPI.sendEmails(selectedCertificate);
      toast({
        title: "Success",
        description: `Successfully sent ${result.success} out of ${result.total} emails.`,
      });
      loadEntries(); // Refresh the list to update email_sent status
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const pendingEmails = entries.filter(entry => !entry.email_sent).length;
  const sentEmails = entries.filter(entry => entry.email_sent).length;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="h-8 w-8" />
          Send Certificates
        </h1>
        <p className="text-gray-600 mt-2">Generate and send certificates to graduants</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Certificate</CardTitle>
            <CardDescription>Choose the certificate to process</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedCertificate}
              onValueChange={setSelectedCertificate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a certificate" />
              </SelectTrigger>
              <SelectContent>
                {certificates.map((cert) => (
                  <SelectItem key={cert.id} value={cert.id}>
                    {cert.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCertificate && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Certificates</CardTitle>
                  <CardDescription>Create PDF certificates for all graduants</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={handleGenerateCertificates}
                    disabled={isGenerating || entries.length === 0}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Certificates'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Send Emails</CardTitle>
                  <CardDescription>Send certificates to graduants via email</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={handleSendEmails}
                    disabled={isSending || pendingEmails === 0}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {isSending ? 'Sending...' : 'Send Emails'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Email Status</CardTitle>
                <CardDescription>Track email delivery status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Status Overview</AlertTitle>
                    <AlertDescription>
                      {entries.length} total graduants | {sentEmails} emails sent | {pendingEmails} pending
                    </AlertDescription>
                  </Alert>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Member No</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.name}</TableCell>
                            <TableCell>{entry.email}</TableCell>
                            <TableCell>{entry.member_no}</TableCell>
                            <TableCell className="text-right">
                              {entry.email_sent ? (
                                <span className="text-green-600 flex items-center justify-end">
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Sent
                                </span>
                              ) : (
                                <span className="text-yellow-600 flex items-center justify-end">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Pending
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {entries.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No graduants found
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SendEmail;
