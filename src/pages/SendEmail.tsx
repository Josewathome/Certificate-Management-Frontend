
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Users, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SendEmail = () => {
  const { toast } = useToast();
  const [emailData, setEmailData] = useState({
    recipients: 'all',
    subject: '',
    message: '',
    template: 'custom'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setEmailData({
      ...emailData,
      [name]: value,
    });
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Email Sent",
      description: "Your email has been sent successfully to the selected recipients.",
    });
  };

  const emailTemplates = [
    { value: 'custom', label: 'Custom Message' },
    { value: 'certificate', label: 'Certificate Delivery' },
    { value: 'congratulations', label: 'Congratulations Template' },
    { value: 'reminder', label: 'Event Reminder' }
  ];

  const recipientOptions = [
    { value: 'all', label: 'All Graduants' },
    { value: 'recent', label: 'Recent Graduants (Last 30 days)' },
    { value: 'course', label: 'Specific Course' },
    { value: 'custom', label: 'Custom Selection' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-8 w-8" />
              Send Email
            </h1>
            <p className="text-gray-600 mt-2">Send emails to graduants and manage communications</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Compose Email</CardTitle>
                  <CardDescription>
                    Create and send emails to your graduants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendEmail} className="space-y-6">
                    <div>
                      <Label htmlFor="recipients">Recipients</Label>
                      <Select 
                        value={emailData.recipients} 
                        onValueChange={(value) => handleSelectChange('recipients', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                        <SelectContent>
                          {recipientOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="template">Email Template</Label>
                      <Select 
                        value={emailData.template} 
                        onValueChange={(value) => handleSelectChange('template', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplates.map((template) => (
                            <SelectItem key={template.value} value={template.value}>
                              {template.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={emailData.subject}
                        onChange={handleInputChange}
                        placeholder="Enter email subject"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={emailData.message}
                        onChange={handleInputChange}
                        placeholder="Enter your email message"
                        rows={8}
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button type="button" variant="outline">
                        Save Draft
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Email Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">245</div>
                    <div className="text-sm text-blue-600">Total Recipients</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">198</div>
                    <div className="text-sm text-green-600">Emails Delivered</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">142</div>
                    <div className="text-sm text-orange-600">Emails Opened</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Certificate Delivery
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Welcome Message
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Event Invitation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SendEmail;
