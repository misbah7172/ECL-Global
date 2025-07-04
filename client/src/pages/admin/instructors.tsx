import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Eye, Search, GraduationCap, Star, Mail, Phone, MapPin, Calendar, Users, BookOpen, Clock, Award, MoreHorizontal, Trash2 } from "lucide-react";

const instructorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialization: z.string().min(1, "Specialization is required"),
  experience: z.string().min(1, "Experience is required"),
  qualifications: z.string().optional(),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  availableHours: z.string().optional(),
  languages: z.string().optional(),
  location: z.string().optional(),
});

type InstructorFormData = z.infer<typeof instructorSchema>;

export default function AdminInstructors() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  const { data: instructors, isLoading } = useQuery({
    queryKey: ["/api/instructors", { search, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const url = `/api/instructors${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      return response.json();
    },
  });

  const form = useForm<InstructorFormData>({
    resolver: zodResolver(instructorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      specialization: "",
      experience: "",
      qualifications: "",
      hourlyRate: "",
      availableHours: "",
      languages: "",
      location: "",
    },
  });

  const createInstructorMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/instructors", data),
    onSuccess: () => {
      toast({
        title: "Instructor Added",
        description: "New instructor has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/instructors"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add instructor",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InstructorFormData) => {
    const instructorData = {
      ...data,
      hourlyRate: parseFloat(data.hourlyRate),
      availableHours: data.availableHours || "0",
      languages: data.languages ? data.languages.split(',').map(lang => lang.trim()) : [],
      qualifications: data.qualifications ? data.qualifications.split('\n').filter(q => q.trim()) : [],
    };
    createInstructorMutation.mutate(instructorData);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Instructor Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  // Sample instructor data for demo
  const sampleInstructors = [
    {
      id: 1,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      phone: "+1234567890",
      specialization: "IELTS Preparation",
      experience: "5 years",
      rating: 4.8,
      totalCourses: 12,
      totalStudents: 245,
      hourlyRate: 50,
      status: "active",
      location: "New York, USA",
      languages: ["English", "Spanish"]
    },
    {
      id: 2,
      firstName: "Ahmed",
      lastName: "Rahman",
      email: "ahmed.rahman@example.com",
      phone: "+1987654321",
      specialization: "SAT Math",
      experience: "7 years",
      rating: 4.9,
      totalCourses: 8,
      totalStudents: 180,
      hourlyRate: 60,
      status: "active",
      location: "Dubai, UAE",
      languages: ["English", "Arabic"]
    },
    {
      id: 3,
      firstName: "Dr. Emily",
      lastName: "Chen",
      email: "emily.chen@example.com",
      phone: "+1122334455",
      specialization: "TOEFL Preparation",
      experience: "10 years",
      rating: 4.7,
      totalCourses: 15,
      totalStudents: 320,
      hourlyRate: 75,
      status: "active",
      location: "Toronto, Canada",
      languages: ["English", "Mandarin"]
    },
  ];

  const displayInstructors = instructors || sampleInstructors;

  return (
    <AdminLayout title="Instructor Management">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Management</h1>
            <p className="text-gray-600 mt-1">Manage instructors and their assignments</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Instructor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Instructor</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ielts">IELTS Preparation</SelectItem>
                            <SelectItem value="sat">SAT Preparation</SelectItem>
                            <SelectItem value="toefl">TOEFL Preparation</SelectItem>
                            <SelectItem value="gre">GRE Preparation</SelectItem>
                            <SelectItem value="gmat">GMAT Preparation</SelectItem>
                            <SelectItem value="english">English Language</SelectItem>
                            <SelectItem value="math">Mathematics</SelectItem>
                            <SelectItem value="counseling">Study Abroad Counseling</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 5 years" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate (USD)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="languages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Languages (comma-separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="English, Spanish, French" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief bio about the instructor"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualifications (one per line)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Masters in Education&#10;TESOL Certified&#10;IELTS Band 9"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createInstructorMutation.isPending}
                    >
                      {createInstructorMutation.isPending ? "Adding..." : "Add Instructor"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {displayInstructors.length}
                </p>
                <p className="text-gray-600 text-sm">Total Instructors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {displayInstructors.reduce((sum: number, instructor: any) => sum + instructor.totalCourses, 0)}
                </p>
                <p className="text-gray-600 text-sm">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {displayInstructors.reduce((sum: number, instructor: any) => sum + instructor.totalStudents, 0)}
                </p>
                <p className="text-gray-600 text-sm">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(displayInstructors.reduce((sum: number, instructor: any) => sum + instructor.rating, 0) / displayInstructors.length).toFixed(1)}
                </p>
                <p className="text-gray-600 text-sm">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructors List */}
      <Card>
        <CardHeader>
          <CardTitle>Instructors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayInstructors.map((instructor: any) => (
              <div key={instructor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {instructor.firstName[0]}{instructor.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {instructor.firstName} {instructor.lastName}
                      </h3>
                      <Badge variant={instructor.status === 'active' ? 'default' : 'secondary'}>
                        {instructor.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {instructor.email}
                      </span>
                      <span className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        {instructor.specialization}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {instructor.rating}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{instructor.totalCourses} courses</span>
                      <span>{instructor.totalStudents} students</span>
                      <span>${instructor.hourlyRate}/hour</span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {instructor.location}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
