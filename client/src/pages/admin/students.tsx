import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Search, Users, Mail, Phone, Edit, GraduationCap, UserCheck, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
}

const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().optional(),
  isActive: z.boolean().default(true),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("student");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      isActive: true,
    },
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments/all'],
  });

  // Filter students
  const students = useMemo(() => {
    return users.filter((u: User) => u.role === 'student');
  }, [users]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeStudents = students.filter((s: User) => s.isActive).length;
    const totalEnrollments = enrollments.filter((e: Enrollment) => 
      students.some((s: User) => s.id === e.userId)
    ).length;
    const currentYear = new Date().getFullYear().toString();
    const newThisYear = students.filter((s: User) => 
      s.createdAt.startsWith(currentYear)
    ).length;
    
    return {
      totalStudents: students.length,
      activeStudents,
      totalEnrollments,
      newThisYear,
    };
  }, [students, enrollments]);

  // Get enrollment count for a student
  const getEnrollmentCount = (userId: number) => {
    return enrollments.filter((e: Enrollment) => e.userId === userId).length;
  };

  // Filter students by search and status
  const filteredStudents = useMemo(() => {
    return students.filter((student: User) => {
      const matchesSearch = search === "" || 
        student.firstName.toLowerCase().includes(search.toLowerCase()) ||
        student.lastName.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()) ||
        student.username.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && student.isActive) ||
        (statusFilter === "inactive" && !student.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  // Update mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      if (!editingStudent) return;

      const response = await fetch(`/api/users/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update student');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDialogOpen(false);
      setEditingStudent(null);
      form.reset();
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditStudent = (student: User) => {
    setEditingStudent(student);
    form.reset({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || "",
      username: student.username,
      password: "",
      isActive: student.isActive,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: StudentFormData) => {
    updateStudentMutation.mutate(data);
  };

  if (usersLoading) {
    return (
      <AdminLayout title="Students">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="relative w-32 h-32">
            {/* Triple-layer pulsing circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-[#1C4E9C]/20 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '75ms' }}>
              <div className="w-24 h-24 rounded-full bg-[#2A7CCD]/30 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '150ms' }}>
              <div className="w-16 h-16 rounded-full bg-[#33A9D9]/40 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-[#1C4E9C]" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Students">
      {/* Hero Section */}
      <div className="relative mb-8 rounded-lg overflow-hidden bg-gradient-to-r from-[#1C4E9C] to-[#2A7CCD] p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Student Management</h1>
              <p className="text-blue-100">Manage student profiles and enrollments</p>
            </div>
            <GraduationCap className="h-16 w-16 opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-[#1C4E9C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-[#1C4E9C]">{stats.totalStudents}</p>
              </div>
              <div className="bg-[#1C4E9C]/10 p-3 rounded-lg">
                <Users className="h-8 w-8 text-[#1C4E9C]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#33A9D9]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Students</p>
                <p className="text-3xl font-bold text-[#33A9D9]">{stats.activeStudents}</p>
              </div>
              <div className="bg-[#33A9D9]/10 p-3 rounded-lg">
                <UserCheck className="h-8 w-8 text-[#33A9D9]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#2A7CCD]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Enrollments</p>
                <p className="text-3xl font-bold text-[#2A7CCD]">{stats.totalEnrollments}</p>
              </div>
              <div className="bg-[#2A7CCD]/10 p-3 rounded-lg">
                <GraduationCap className="h-8 w-8 text-[#2A7CCD]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#FFD700]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">New This Year</p>
                <p className="text-3xl font-bold text-[#FFD700]">{stats.newThisYear}</p>
              </div>
              <div className="bg-[#FFD700]/10 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-[#FFD700]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search students..."
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No students found</p>
              <p className="text-gray-400 text-sm">
                {search ? "Try a different search term" : "No students registered yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student: User) => {
            const enrollmentCount = getEnrollmentCount(student.id);
            return (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-[#1C4E9C]/10 p-3 rounded-full">
                        <Users className="h-6 w-6 text-[#1C4E9C]" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </h3>
                          <Badge variant={student.isActive ? "default" : "secondary"}>
                            {student.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-[#1C4E9C]" />
                            <span>{student.email}</span>
                          </div>
                          
                          {student.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2 text-[#33A9D9]" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <GraduationCap className="h-4 w-4 mr-2 text-[#2A7CCD]" />
                            <span>{enrollmentCount} course{enrollmentCount !== 1 ? 's' : ''} enrolled</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Joined {format(new Date(student.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                          <div>
                            <span className="font-medium">Username:</span> {student.username}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredStudents.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
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
                        <Input placeholder="patel" {...field} />
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
                        <Input placeholder="Khan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="patel@example.com" {...field} />
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
                      <Input placeholder="+880 1777-123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!editingStudent && (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password {editingStudent && "(leave empty to keep current)"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingStudent(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateStudentMutation.isPending}
                  className="bg-[#1C4E9C] hover:bg-[#2A7CCD]"
                >
                  {updateStudentMutation.isPending ? "Saving..." : "Update Student"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
