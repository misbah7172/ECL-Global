import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, TrendingUp, Eye, Download, Search, Edit, GraduationCap, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string;
  progress: number;
  completedAt?: string | null;
  grade?: string | null;
  certificateIssued: boolean;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    id: number;
    title: string;
    price: number;
    category: string;
  };
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const enrollmentSchema = z.object({
  progress: z.number().min(0).max(100),
  grade: z.string().optional(),
  certificateIssued: z.boolean(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export default function AdminEnrollments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      progress: 0,
      grade: "",
      certificateIssued: false,
    },
  });


  const { data: enrollments, isLoading } = useQuery<Enrollment[]>({
    queryKey: ['/api/enrollments/all'],
    queryFn: async () => {
      const response = await fetch('/api/enrollments/all', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      return response.json();
    },
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
  });

  const { data: instructors } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      return users.filter((u: User) => u.role === 'instructor');
    },
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EnrollmentFormData }) => {
      const response = await fetch(`/api/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update enrollment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments/all'] });
      setIsEditModalOpen(false);
      setEditingEnrollment(null);
      form.reset();
      toast({
        title: "Success",
        description: "Enrollment updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update enrollment",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    form.reset({
      progress: enrollment.progress,
      grade: enrollment.grade || "",
      certificateIssued: enrollment.certificateIssued,
    });
    setIsEditModalOpen(true);
  };

  const onSubmit = (data: EnrollmentFormData) => {
    if (!editingEnrollment) return;
    updateEnrollmentMutation.mutate({
      id: editingEnrollment.id,
      data,
    });
  };

  const filteredEnrollments = useMemo(() => {
    if (!enrollments) return [];
    return enrollments.filter((enrollment: Enrollment) => {
      const fullName = `${enrollment.user.firstName} ${enrollment.user.lastName}`;
      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           enrollment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && !enrollment.completedAt && enrollment.progress < 100) ||
                           (statusFilter === "completed" && enrollment.completedAt) ||
                           (statusFilter === "inactive" && !enrollment.completedAt && enrollment.progress === 0);
      
      const matchesCourse = courseFilter === "all" || enrollment.courseId.toString() === courseFilter;
      
      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [enrollments, searchTerm, statusFilter, courseFilter]);

  const stats = useMemo(() => {
    if (!enrollments) return { total: 0, active: 0, completed: 0, completionRate: 0 };
    
    const total = enrollments.length;
    const active = enrollments.filter(e => !e.completedAt && e.progress > 0).length;
    const completed = enrollments.filter(e => e.completedAt).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, active, completed, completionRate };
  }, [enrollments]);

  const getInstructorName = (courseId: number) => {
    const course = courses?.find((c: any) => c.id === courseId);
    if (!course?.instructorId) return "Not Assigned";
    const instructor = instructors?.find(i => i.id === course.instructorId);
    if (!instructor) return "Not Assigned";
    return `${instructor.firstName} ${instructor.lastName}`;
  };

  const getStatusBadge = (enrollment: Enrollment) => {
    if (enrollment.completedAt) {
      return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
    }
    if (enrollment.progress > 0) {
      return <Badge className="bg-[#33A9D9] hover:bg-[#2A7CCD]">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const handleViewDetails = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsDetailModalOpen(true);
  };

  const exportData = () => {
    const csv = [
      ["Student Name", "Email", "Course", "Instructor", "Enrolled Date", "Progress", "Status", "Grade"],
      ...filteredEnrollments.map((enrollment: Enrollment) => [
        `${enrollment.user.firstName} ${enrollment.user.lastName}`,
        enrollment.user.email,
        enrollment.course.title,
        getInstructorName(enrollment.courseId),
        new Date(enrollment.enrolledAt).toLocaleDateString(),
        `${enrollment.progress}%`,
        enrollment.completedAt ? "Completed" : enrollment.progress > 0 ? "Active" : "Inactive",
        enrollment.grade || "N/A"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollments.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-8 border-[#1C4E9C] border-t-transparent rounded-full animate-spin" style={{ animationDelay: '0ms' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-8 border-[#33A9D9] border-t-transparent rounded-full animate-spin" style={{ animationDelay: '75ms' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#2A7CCD] border-t-transparent rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#1C4E9C] to-[#2A7CCD] text-white rounded-lg p-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Enrollment Management</h1>
          </div>
          <p className="text-blue-100">Track and manage student course enrollments</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#1C4E9C]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-5 w-5 text-[#1C4E9C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1C4E9C]">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All course enrollments</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#33A9D9]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <TrendingUp className="h-5 w-5 text-[#33A9D9]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#33A9D9]">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently learning</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">Courses finished</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#FFD700]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BookOpen className="h-5 w-5 text-[#FFD700]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FFD700]">{stats.completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Success metric</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1C4E9C]">Filter Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students or courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map((course: any) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1C4E9C]">All Enrollments</CardTitle>
            <CardDescription>
              {filteredEnrollments.length} enrollments found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment: Enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{enrollment.user.firstName} {enrollment.user.lastName}</div>
                          <div className="text-sm text-gray-500">{enrollment.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-[#1C4E9C]" />
                          <span className="font-medium">{enrollment.course.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getInstructorName(enrollment.courseId)}</TableCell>
                      <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16">
                            <Progress value={enrollment.progress} className="h-2" />
                          </div>
                          <span className="text-sm font-medium">{enrollment.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(enrollment)}</TableCell>
                      <TableCell>
                        {enrollment.grade ? (
                          <Badge variant="outline" className="border-[#FFD700] text-[#FFD700]">{enrollment.grade}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(enrollment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(enrollment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Enrollment Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#1C4E9C]">Edit Enrollment</DialogTitle>
              <DialogDescription>
                Update enrollment progress and grade
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progress (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A, B+, 85%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="certificateIssued"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Certificate Issued</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#1C4E9C] hover:bg-[#2A7CCD]"
                    disabled={updateEnrollmentMutation.isPending}
                  >
                    {updateEnrollmentMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Enrollment Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#1C4E9C]">Enrollment Details</DialogTitle>
              <DialogDescription>
                Detailed information about the student enrollment
              </DialogDescription>
            </DialogHeader>
            {selectedEnrollment && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-[#1C4E9C]">Student Name</Label>
                    <p className="mt-1">{selectedEnrollment.user.firstName} {selectedEnrollment.user.lastName}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-[#1C4E9C]">Email</Label>
                    <p className="mt-1">{selectedEnrollment.user.email}</p>
                  </div>
                </div>

                {/* Course Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-[#1C4E9C]">Course</Label>
                    <p className="mt-1">{selectedEnrollment.course.title}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-[#1C4E9C]">Instructor</Label>
                    <p className="mt-1">{getInstructorName(selectedEnrollment.courseId)}</p>
                  </div>
                </div>

                {/* Progress Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-[#1C4E9C]">Enrolled Date</Label>
                    <p className="mt-1">{new Date(selectedEnrollment.enrolledAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-[#1C4E9C]">Completion Date</Label>
                    <p className="mt-1">{selectedEnrollment.completedAt ? new Date(selectedEnrollment.completedAt).toLocaleDateString() : "Not completed"}</p>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold text-[#1C4E9C]">Progress</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Progress value={selectedEnrollment.progress} className="flex-1" />
                    <span className="font-medium text-[#1C4E9C]">{selectedEnrollment.progress}%</span>
                  </div>
                </div>

                {selectedEnrollment.grade && (
                  <div>
                    <Label className="font-semibold text-[#1C4E9C]">Grade</Label>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-lg px-3 py-1 border-[#FFD700] text-[#FFD700]">{selectedEnrollment.grade}</Badge>
                    </div>
                  </div>
                )}

                {selectedEnrollment.certificateIssued && (
                  <div>
                    <Label className="font-semibold text-[#1C4E9C]">Certificate</Label>
                    <div className="mt-2">
                      <Badge className="bg-green-500 hover:bg-green-600">Certificate Issued</Badge>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}