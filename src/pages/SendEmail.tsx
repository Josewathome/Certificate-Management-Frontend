import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Mail, Send, FileCheck, AlertCircle, CheckCircle2, Users, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { profileAPI, certificateEntriesAPI, certificateGenerationAPI, type Certificate, type CertificateEntry } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePagination } from '@/hooks/usePagination';
import { EnhancedPagination } from '@/components/ui/enhanced-pagination';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const SendEmail = () => {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string>('');
  const [entries, setEntries] = useState<CertificateEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<CertificateEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'pending'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const pagination = usePagination({
    itemsPerPage: 10,
    totalItems: filteredEntries.length,
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    if (selectedCertificate) {
      loadEntries();
    } else {
      setEntries([]);
      setFilteredEntries([]);
    }
  }, [selectedCertificate]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery, statusFilter]);

  useEffect(() => {
    pagination.setTotalItems(filteredEntries.length);
  }, [filteredEntries.length, pagination]);

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

    pagination.setIsLoading(true);
    try {
      const response = await certificateEntriesAPI.getEntries({
        certificate__id: selectedCertificate,
        limit: 1000, // Load all entries for client-side filtering
      });
      setEntries(response.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      pagination.setIsLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        entry.member_no.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry =>
        statusFilter === 'sent' ? entry.email_sent : !entry.email_sent
      );
    }

    setFilteredEntries(filtered);
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
      loadEntries();
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
      loadEntries();
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

  // Only count emails to send for entries with certificate_create === true and email_sent === false
  const pendingEmails = entries.filter(entry => !entry.email_sent && entry.certificate_create).length;
  const sentEmails = entries.filter(entry => entry.email_sent).length;
  const pendingCertificates = entries.filter(entry => !entry.certificate_create).length;
  const createdCertificates = entries.filter(entry => entry.certificate_create).length;

  // Get paginated entries
  const paginatedEntries = filteredEntries.slice(
    pagination.startIndex,
    pagination.endIndex
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-8 w-8" />
              Send Certificates
            </h1>
            <p className="text-gray-600 mt-2">Generate and send certificates to graduants</p>
          </div>
        </div>

        {/* Certificate Selection */}
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
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Generate Certificates
                  </CardTitle>
                  <CardDescription>Create PDF certificates for all graduants</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={handleGenerateCertificates}
                    disabled={isGenerating || entries.length === 0}
                  >
                    {isGenerating ? (
                      <>
                        <LoadingState size="sm" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Generate Certificates ({pendingCertificates} pending)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send Emails
                  </CardTitle>
                  <CardDescription>Send certificates to graduants via email</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={handleSendEmails}
                    disabled={isSending || pendingEmails === 0}
                  >
                    {isSending ? (
                      <>
                        <LoadingState size="sm" className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Emails ({pendingEmails} pending)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Status Overview */}
            <Alert>
              <Users className="h-4 w-4" />
              <AlertTitle>Status Overview</AlertTitle>
              <AlertDescription className="flex flex-wrap gap-4 mt-2">
                <Badge variant="outline">{entries.length} total graduants</Badge>
                <Badge variant="default" className="bg-green-500">{sentEmails} emails sent</Badge>
                <Badge variant="secondary">{pendingEmails} emails pending (certificate created)</Badge>
                <Badge variant="default" className="bg-blue-500">{createdCertificates} certificates created</Badge>
                <Badge variant="secondary">{pendingCertificates} certificates pending</Badge>
              </AlertDescription>
            </Alert>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Graduants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name, email, or member number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(value: 'all' | 'sent' | 'pending') => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Graduants Table */}
            <Card>
              <CardHeader>
                <CardTitle>Graduants List</CardTitle>
                <CardDescription>
                  {filteredEntries.length} of {entries.length} graduants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pagination.isLoading ? (
                  <LoadingState />
                ) : filteredEntries.length === 0 ? (
                  <EmptyState
                    icon={<Users className="h-12 w-12" />}
                    title="No graduants found"
                    description={entries.length === 0 
                      ? "No graduants have been added to this certificate yet."
                      : "No graduants match your current filters."
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Member No</TableHead>
                            <TableHead>Certificate</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedEntries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium">{entry.name}</TableCell>
                              <TableCell>{entry.email}</TableCell>
                              <TableCell>{entry.member_no}</TableCell>
                              <TableCell>
                                {entry.certificate_create ? (
                                  <Badge variant="default" className="bg-blue-500">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Created
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {entry.email_sent ? (
                                  <Badge variant="default" className="bg-green-500">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Sent
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <EnhancedPagination
                      pagination={pagination}
                      showItemsPerPage={true}
                      showInfo={true}
                      itemsPerPageOptions={[5, 10, 20, 50]}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SendEmail;
