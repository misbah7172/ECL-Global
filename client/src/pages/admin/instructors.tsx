import { useState, useMemo } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Eye, Search, GraduationCap, Star, Mail, Phone, MapPin, Users, BookOpen, Award, TrendingUp } from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

const instructorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type InstructorFormData = z.infer<typeof instructorSchema>;

export default function AdminInstructors() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<any>(null);

  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  // Fetch real users data
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    },
  });

  // Fetch courses to calculate instructor stats
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      return response.json();
    },
  });

  // Fetch enrollments for student counts
  const { data: allEnrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["/api/enrollments/all"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/enrollments/all");
        return response.json();
      } catch {
        return [];
      }
    },
  });

  // Calculate instructor statistics
  const instructorsWithStats = useMemo(() => {
    const instructorsList = users.filter((u: any) => u.role === 'instructor' || u.role === 'admin');
    
    return instructorsList.map((instructor: any) => {
      const instructorCourses = courses.filter((c: any) => c.instructorId === instructor.id);
      const instructorEnrollments = allEnrollments.filter((e: any) => 
        instructorCourses.some((c: any) => c.id === e.courseId)
      );
      const uniqueStudents = new Set(instructorEnrollments.map((e: any) => e.userId)).size;
      const avgRating = instructorCourses.length > 0
        ? instructorCourses.reduce((sum: number, c: any) => sum + parseFloat(c.rating || 0), 0) / instructorCourses.length
        : 0;

      return {
        ...instructor,
        totalCourses: instructorCourses.length,
        totalStudents: uniqueStudents,
        totalEnrollments: instructorEnrollments.length,
        rating: avgRating,
      };
    });
  }, [users, courses, allEnrollments]);

  const form = useForm<InstructorFormData>({
    resolver: zodResolver(instructorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
    },
  });

  // Handle edit instructor
  const handleEditInstructor = (instructor: any) => {
    setEditingInstructor(instructor);
    form.reset({
      firstName: instructor.firstName || "",
      lastName: instructor.lastName || "",
      email: instructor.email || "",
      phone: instructor.phone || "",
      username: instructor.username || "",
      password: "", // Don't pre-fill password
    });
    setIsDialogOpen(true);
  };

  const createInstructorMutation = useMutation({
    mutationFn: (data: any) =>
      editingInstructor
        ? apiRequest("PUT", `/api/admin/instructors/${editingInstructor.id}`, data)
        : apiRequest("POST", "/api/admin/instructors", data),
    onSuccess: () => {
      toast({
        title: editingInstructor ? "Instructor Updated" : "Instructor Added",
        description: editingInstructor
          ? "Instructor has been updated successfully."
          : "New instructor has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/instructors"] });
      setIsDialogOpen(false);
      setEditingInstructor(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingInstructor ? 'update' : 'add'} instructor`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InstructorFormData) => {
    if (!editingInstructor && (!data.username || !data.password)) {
      toast({
        title: "Error",
        description: "Username and password are required when creating a new instructor.",
        variant: "destructive",
      });
      return;
    }

    const instructorData = {
      ...data,
      role: 'instructor',
      isActive: true,
    };
    
    // Remove password field if empty during edit
    if (editingInstructor && !data.password) {
      delete instructorData.password;
    }
    
    createInstructorMutation.mutate(instructorData);
  };

  const isLoading = loadingUsers || loadingCourses || loadingEnrollments;

  if (isLoading) {
    return (
      <AdminLayout title="Instructor Management">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: COLORS.skyBlue }} />
            <div className="absolute inset-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.midBlue }} />
            <div className="absolute inset-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.deepBlue }}>
              <GraduationCap className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Filter instructors
  const filteredInstructors = instructorsWithStats.filter((instructor: any) => {
    const searchLower = search.toLowerCase();
    return (
      instructor.firstName.toLowerCase().includes(searchLower) ||
      instructor.lastName.toLowerCase().includes(searchLower) ||
      instructor.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AdminLayout title="Instructor Management">
      <div className="space-y-8">
        {/* Hero Section */}
        <div 
          className="relative rounded-2xl p-8 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 50%, ${COLORS.skyBlue} 100%)`
          }}
        >
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Instructor Management</h1>
              <p className="text-white/90 text-lg">Manage instructors and monitor their performance</p>
            </div>
            <div className="absolute top-8 right-8 w-20 h-20 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderColor: COLORS.deepBlue }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Instructors</p>
                  <p className="text-3xl font-bold" style={{ color: COLORS.deepBlue }}>
                    {instructorsWithStats.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: COLORS.deepBlue }}>
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderColor: COLORS.skyBlue }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                  <p className="text-3xl font-bold" style={{ color: COLORS.skyBlue }}>
                    {instructorsWithStats.reduce((sum: number, i: any) => sum + i.totalCourses, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: COLORS.skyBlue }}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderColor: COLORS.midBlue }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold" style={{ color: COLORS.midBlue }}>
                    {instructorsWithStats.reduce((sum: number, i: any) => sum + i.totalStudents, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: COLORS.midBlue }}>
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderColor: '#FFD700' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                  <p className="text-3xl font-bold" style={{ color: '#FFD700' }}>
                    {instructorsWithStats.length > 0
                      ? (instructorsWithStats.reduce((sum: number, i: any) => sum + i.rating, 0) / instructorsWithStats.length).toFixed(1)
                      : '0.0'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: '#FFD700' }}>
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search instructors by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingInstructor(null);
                form.reset();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button 
                style={{ backgroundColor: COLORS.deepBlue }}
                className="text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Instructor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle style={{ color: COLORS.deepBlue }}>
                  {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
                </DialogTitle>
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
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {!editingInstructor && (
                    <>
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {editingInstructor && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password (Optional)</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Leave blank to keep current password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingInstructor(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createInstructorMutation.isPending}
                      style={{ backgroundColor: COLORS.deepBlue }}
                      className="text-white hover:opacity-90"
                    >
                      {createInstructorMutation.isPending 
                        ? (editingInstructor ? "Updating..." : "Adding...") 
                        : (editingInstructor ? "Update Instructor" : "Add Instructor")}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredInstructors.length > 0 ? (
            filteredInstructors.map((instructor: any) => (
              <Card 
                key={instructor.id}
                className="hover:shadow-xl transition-all duration-300 border-l-4"
                style={{ borderLeftColor: instructor.isActive ? COLORS.deepBlue : COLORS.darkGrey }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar */}
                      <Avatar className="h-16 w-16">
                        <AvatarFallback 
                          className="text-lg font-bold text-white"
                          style={{ backgroundColor: COLORS.deepBlue }}
                        >
                          {instructor.firstName[0]}{instructor.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        {/* Instructor Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 
                                className="text-2xl font-bold"
                                style={{ color: COLORS.deepBlue }}
                              >
                                {instructor.firstName} {instructor.lastName}
                              </h3>
                              <Badge 
                                variant={instructor.isActive ? "default" : "secondary"}
                                style={instructor.isActive ? { backgroundColor: COLORS.skyBlue } : {}}
                              >
                                {instructor.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {instructor.role === 'admin' && (
                                <Badge variant="outline" style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}>
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {instructor.email}
                              </span>
                              {instructor.phone && (
                                <span className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {instructor.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Instructor Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg"
                             style={{ backgroundColor: COLORS.offWhite }}>
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Courses</span>
                            <p className="font-bold text-lg flex items-center" style={{ color: COLORS.deepBlue }}>
                              <BookOpen className="h-4 w-4 mr-1" />
                              {instructor.totalCourses}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Students</span>
                            <p className="font-bold text-lg flex items-center" style={{ color: COLORS.skyBlue }}>
                              <Users className="h-4 w-4 mr-1" />
                              {instructor.totalStudents}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Enrollments</span>
                            <p className="font-bold text-lg flex items-center" style={{ color: COLORS.midBlue }}>
                              <TrendingUp className="h-4 w-4 mr-1" />
                              {instructor.totalEnrollments}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Rating</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold text-lg">
                                {instructor.rating > 0 ? instructor.rating.toFixed(1) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditInstructor(instructor)}
                        className="border-2"
                        style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16">
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: COLORS.offWhite }}
              >
                <GraduationCap className="h-12 w-12" style={{ color: COLORS.deepBlue }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                No instructors found
              </h3>
              <p className="text-gray-600 mb-6">
                {search
                  ? "Try adjusting your search criteria"
                  : "Add your first instructor to get started"}
              </p>
              {!search && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  style={{ backgroundColor: COLORS.deepBlue }}
                  className="text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Instructor
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
