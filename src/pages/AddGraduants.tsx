import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Award, Upload, UserPlus, Search, Edit2, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { profileAPI, certificateEntriesAPI, type Certificate, type CertificateEntry } from '@/services/api';
import { useInView } from 'react-intersection-observer';
import DashboardLayout from '@/components/DashboardLayout';

const ENTRIES_PER_PAGE = 10;

const AddGraduants = () => {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string>('');
  const [entries, setEntries] = useState<CertificateEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref: loadMoreRef, inView } = useInView();

  // Form state for individual entry
  const [entryForm, setEntryForm] = useState({
    name: '',
    email: '',
    member_no: '',
  });

  // Edit mode state
  const [editingEntry, setEditingEntry] = useState<CertificateEntry | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    if (selectedCertificate) {
      loadEntries(true);
    }
  }, [selectedCertificate, searchQuery]);

  useEffect(() => {
    if (inView && hasMore && !isLoading && selectedCertificate) {
      loadMoreEntries();
    }
  }, [inView]);

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

  const loadEntries = async (reset: boolean = false) => {
    if (reset) {
      setCurrentPage(1);
      setEntries([]);
      setHasMore(true);
    }

    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const response = await certificateEntriesAPI.getEntries({
        certificate__id: selectedCertificate,
        search: searchQuery,
        page: reset ? 1 : currentPage,
        limit: ENTRIES_PER_PAGE,
      });

      setEntries(prev => reset ? response.results : [...prev, ...response.results]);
      setHasMore(!!response.next);
      if (!reset) {
        setCurrentPage(prev => prev + 1);
      }
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

  const loadMoreEntries = () => {
    loadEntries(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCertificate) {
      toast({
        title: "Error",
        description: "Please select a certificate first.",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await certificateEntriesAPI.uploadFile(selectedCertificate, file);
      toast({
        title: "Success",
        description: "File uploaded successfully.",
      });
      loadEntries(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertificate) {
      toast({
        title: "Error",
        description: "Please select a certificate first.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingEntry) {
        await certificateEntriesAPI.update(editingEntry.id, {
          ...entryForm,
          certificate: selectedCertificate,
        });
        toast({
          title: "Success",
          description: "Entry updated successfully.",
        });
      } else {
        await certificateEntriesAPI.create({
          ...entryForm,
          certificate: selectedCertificate,
        });
        toast({
          title: "Success",
          description: "Entry added successfully.",
        });
      }

      setEntryForm({
        name: '',
        email: '',
        member_no: '',
      });
      setEditingEntry(null);
      loadEntries(true);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingEntry ? 'update' : 'add'} entry. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (entry: CertificateEntry) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await certificateEntriesAPI.delete(entry.id);
        toast({
          title: "Success",
          description: "Entry deleted successfully.",
        });
        loadEntries(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete entry. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (entry: CertificateEntry) => {
    setEditingEntry(entry);
    setEntryForm({
      name: entry.name,
      email: entry.email,
      member_no: entry.member_no,
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-8 w-8" />
          Add Graduants
        </h1>
        <p className="text-gray-600 mt-2">Add graduants to your certificates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Certificate</CardTitle>
              <CardDescription>Choose the certificate to add graduants to</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>{editingEntry ? 'Edit Graduant' : 'Add Individual Graduant'}</CardTitle>
              <CardDescription>
                {editingEntry ? 'Update graduant details' : 'Enter graduant details manually'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={entryForm.name}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter graduant name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={entryForm.email}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter graduant email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="member_no">Member Number</Label>
                  <Input
                    id="member_no"
                    value={entryForm.member_no}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, member_no: e.target.value }))}
                    placeholder="Enter member number"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingEntry ? (
                      <>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Update Graduant
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Graduant
                      </>
                    )}
                  </Button>
                  {editingEntry && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingEntry(null);
                        setEntryForm({ name: '', email: '', member_no: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload</CardTitle>
              <CardDescription>Upload a CSV or Excel file with graduant details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileUpload}
                />
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Graduant List</CardTitle>
            <CardDescription>View and manage graduants</CardDescription>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-10"
                  placeholder="Search graduants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Member No</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell>{entry.email}</TableCell>
                      <TableCell>{entry.member_no}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
              {hasMore && (
                <div ref={loadMoreRef} className="py-4 text-center">
                  {isLoading ? 'Loading...' : 'Load more'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddGraduants;
