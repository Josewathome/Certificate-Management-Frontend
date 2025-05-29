
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Award, Upload, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CreateCertificate = () => {
  const { toast } = useToast();
  const [certificateData, setCertificateData] = useState({
    title: '',
    description: '',
    template: '',
    issuer: '',
    validityPeriod: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCertificateData({
      ...certificateData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Certificate Created",
      description: "Your certificate template has been created successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="h-8 w-8" />
              Create Certificate
            </h1>
            <p className="text-gray-600 mt-2">Design and create new certificate templates</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
              <CardDescription>
                Fill in the details for your new certificate template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Certificate Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={certificateData.title}
                    onChange={handleInputChange}
                    placeholder="Enter certificate title"
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
                  <Label htmlFor="issuer">Issuing Organization</Label>
                  <Input
                    id="issuer"
                    name="issuer"
                    value={certificateData.issuer}
                    onChange={handleInputChange}
                    placeholder="Enter issuing organization name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="validityPeriod">Validity Period</Label>
                  <Input
                    id="validityPeriod"
                    name="validityPeriod"
                    value={certificateData.validityPeriod}
                    onChange={handleInputChange}
                    placeholder="e.g., 1 year, Lifetime, etc."
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Create Certificate
                  </Button>
                  <Button type="button" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Template
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateCertificate;
