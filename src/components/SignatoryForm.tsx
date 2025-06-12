import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signatoryAPI, type Signatory, type SignatoryRequest } from '@/services/api';

interface SignatoryFormProps {
  certificateId: string;
  existingSignatories: Signatory[];
  onSignatoryChange: () => void;
}

export const SignatoryForm: React.FC<SignatoryFormProps> = ({
  certificateId,
  existingSignatories = [],
  onSignatoryChange,
}) => {
  const { toast } = useToast();
  const [signatoryData, setSignatoryData] = useState<Omit<SignatoryRequest, 'certificate'>>({
    name: '',
    title: '',
    organization: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignatoryData({
      ...signatoryData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSignatoryData({
        ...signatoryData,
        [e.target.name]: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signatoryAPI.create({
        ...signatoryData,
        certificate: certificateId,
      });
      
      toast({
        title: "Signatory Added",
        description: "The signatory has been added successfully.",
      });
      
      // Reset form
      setSignatoryData({
        name: '',
        title: '',
        organization: '',
      });
      
      // Notify parent of change
      onSignatoryChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add signatory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await signatoryAPI.delete(id);
      toast({
        title: "Signatory Removed",
        description: "The signatory has been removed successfully.",
      });
      onSignatoryChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove signatory. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Certificate Signatories</CardTitle>
        <CardDescription>
          Add or manage signatories for this certificate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={signatoryData.name}
                onChange={handleInputChange}
                placeholder="Enter signatory name"
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={signatoryData.title || ''}
                onChange={handleInputChange}
                placeholder="Enter signatory title"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              name="organization"
              value={signatoryData.organization || ''}
              onChange={handleInputChange}
              placeholder="Enter organization name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                name="logo"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <div>
              <Label htmlFor="signature">Signature</Label>
              <Input
                id="signature"
                name="signature"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Signatory
          </Button>
        </form>

        {existingSignatories.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-medium">Current Signatories</h3>
            {existingSignatories.map((signatory) => (
              <div
                key={signatory.id}
                className="flex items-center justify-between p-4 border rounded-lg"
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
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(signatory.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 