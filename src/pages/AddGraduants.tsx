
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AddGraduants = () => {
  const { toast } = useToast();
  const [graduants, setGraduants] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Web Development', graduationDate: '2024-01-15' }
  ]);
  
  const [newGraduant, setNewGraduant] = useState({
    name: '',
    email: '',
    course: '',
    graduationDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGraduant({
      ...newGraduant,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddGraduant = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...graduants.map(g => g.id), 0) + 1;
    setGraduants([...graduants, { id: newId, ...newGraduant }]);
    setNewGraduant({ name: '', email: '', course: '', graduationDate: '' });
    toast({
      title: "Graduant Added",
      description: "New graduant has been added successfully.",
    });
  };

  const handleDeleteGraduant = (id: number) => {
    setGraduants(graduants.filter(g => g.id !== id));
    toast({
      title: "Graduant Removed",
      description: "Graduant has been removed from the list.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8" />
              Add Graduants
            </h1>
            <p className="text-gray-600 mt-2">Manage and add new graduants to the system</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Add New Graduant</CardTitle>
                <CardDescription>
                  Enter the details of the new graduant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddGraduant} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newGraduant.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newGraduant.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="course">Course/Program</Label>
                    <Input
                      id="course"
                      name="course"
                      value={newGraduant.course}
                      onChange={handleInputChange}
                      placeholder="Enter course or program name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="graduationDate">Graduation Date</Label>
                    <Input
                      id="graduationDate"
                      name="graduationDate"
                      type="date"
                      value={newGraduant.graduationDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Graduant
                    </Button>
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Graduants List ({graduants.length})</CardTitle>
                <CardDescription>
                  Current list of graduants in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {graduants.map((graduant) => (
                      <TableRow key={graduant.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{graduant.name}</div>
                            <div className="text-sm text-gray-500">{graduant.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{graduant.course}</div>
                            <div className="text-sm text-gray-500">{graduant.graduationDate}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteGraduant(graduant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddGraduants;
