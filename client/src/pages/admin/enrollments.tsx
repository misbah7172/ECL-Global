import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Users, BookOpen, Calendar, TrendingUp, Download, Eye, Mail, Phone } from "lucide-react";

interface Enrollment {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  courseId: number;
  courseName: string;
  instructorName: string;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
  isActive: boolean;
  grade?: string;
  certificateIssued?: boolean;
}

export default function AdminEnrollments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  const queryClient = useQueryClient();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['/api/admin/enrollments'],
    queryFn: async () => {
      // Mock data - in real app, this would fetch from API
      const mockEnrollments: Enrollment[] = [
        {
          id: 1,
          userId: 101,
          userName: "John Smith",
          userEmail: "john@example.com",
          courseId: 1,
          courseName: "Web Development Fundamentals",
          instructorName: "Sarah Johnson",
          enrolledAt: "2024-06-15",
          progress: 75,
          isActive: true,
          grade: "A-",
        },
        {
          id: 2,
          userId: 102,
          userName: "Emily Davis",
          userEmail: "emily@example.com",
          courseId: 2,
          courseName: "React Advanced Concepts",
          instructorName: "Michael Chen",
          enrolledAt: "2024-06-20",
          completedAt: "2024-07-05",
          progress: 100,
          isActive: false,
          grade: "A+",
          certificateIssued: true,
        },
        {
          id: 3,
          userId: 103,
          userName: "Michael Johnson",
          userEmail: "michael@example.com",
          courseId: 3,
          courseName: "Data Science Bootcamp",
          instructorName: "Emily Davis",
          enrolledAt: "2024-07-01",
          progress: 45,
          isActive: true,
        },
        {
          id: 4,
          userId: 104,
          userName: "Sarah Wilson",
          userEmail: "sarah@example.com",
          courseId: 1,
          courseName: "Web Development Fundamentals",
          instructorName: "Sarah Johnson",
          enrolledAt: "2024-07-03",
          progress: 30,
          isActive: true,
        },
        {
          id: 5,
          userId: 105,
          userName: "David Brown",
          userEmail: "david@example.com",
          courseId: 4,
          courseName: "Mobile App Development",
          instructorName: "David Wilson",
          enrolledAt: "2024-06-10",
          progress: 0,
          isActive: false,
        },
      ];
      return mockEnrollments;
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

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, progress }: { id: number; progress: number }) => {
      // In real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id, progress };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enrollments'] });
      toast({
        title: "Success",
        description: "Progress updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    },
  });

  const issueCertificateMutation = useMutation({
    mutationFn: async (id: number) => {
      // In real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enrollments'] });
      toast({
        title: "Success",
        description: "Certificate issued successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to issue certificate",
        variant: "destructive",
      });
    },
  });

  const filteredEnrollments = enrollments?.filter((enrollment: Enrollment) => {
    const matchesSearch = enrollment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && enrollment.isActive) ||
                         (statusFilter === "completed" && enrollment.completedAt) ||
                         (statusFilter === "inactive" && !enrollment.isActive && !enrollment.completedAt);
    
    const matchesCourse = courseFilter === "all" || enrollment.courseId.toString() === courseFilter;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusBadge = (enrollment: Enrollment) => {
    if (enrollment.completedAt) {
      return <Badge variant="default">Completed</Badge>;
    }
    if (enrollment.isActive) {
      return <Badge variant="outline">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleViewDetails = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsDetailModalOpen(true);
  };

  const handleIssueCertificate = (id: number) => {
    if (window.confirm("Are you sure you want to issue a certificate for this student?")) {
      issueCertificateMutation.mutate(id);
    }
  };

  const exportData = () => {
    // In real app, this would generate and download CSV/Excel
    const csv = [
      ["Student Name", "Email", "Course", "Instructor", "Enrolled Date", "Progress", "Status", "Grade"],
      ...filteredEnrollments?.map((enrollment: Enrollment) => [
        enrollment.userName,
        enrollment.userEmail,
        enrollment.courseName,
        enrollment.instructorName,
        enrollment.enrolledAt,
        `${enrollment.progress}%`,
        enrollment.completedAt ? "Completed" : enrollment.isActive ? "Active" : "Inactive",
        enrollment.grade || "N/A"
      ]) || []
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollments.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const stats = {
    total: enrollments?.length || 0,
    active: enrollments?.filter(e => e.isActive).length || 0,
    completed: enrollments?.filter(e => e.completedAt).length || 0,
    averageProgress: enrollments?.reduce((sum, e) => sum + e.progress, 0) / (enrollments?.length || 1) || 0,
  };

  return (
    <AdminLayout title="Enrollments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Enrollments</h1>
            <p className="text-gray-600 mt-1">Manage student enrollments and track progress</p>
          </div>
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
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
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-48">
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
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Enrollments</CardTitle>
            <CardDescription>
              {filteredEnrollments?.length || 0} enrollments found
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading enrollments...
                    </TableCell>
                  </TableRow>
                ) : filteredEnrollments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments?.map((enrollment: Enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{enrollment.userName}</div>
                          <div className="text-sm text-gray-500">{enrollment.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span className="font-medium">{enrollment.courseName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.instructorName}</TableCell>
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
                          <Badge variant="outline">{enrollment.grade}</Badge>
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
                          {enrollment.progress === 100 && !enrollment.certificateIssued && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleIssueCertificate(enrollment.id)}
                              disabled={issueCertificateMutation.isPending}
                            >
                              Certificate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Enrollment Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enrollment Details</DialogTitle>
              <DialogDescription>
                Detailed information about the student enrollment
              </DialogDescription>
            </DialogHeader>
            {selectedEnrollment && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Student Name</Label>
                    <p>{selectedEnrollment.userName}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Email</Label>
                    <p>{selectedEnrollment.userEmail}</p>
                  </div>
                </div>

                {/* Course Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Course</Label>
                    <p>{selectedEnrollment.courseName}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Instructor</Label>
                    <p>{selectedEnrollment.instructorName}</p>
                  </div>
                </div>

                {/* Progress Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Enrolled Date</Label>
                    <p>{new Date(selectedEnrollment.enrolledAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Completion Date</Label>
                    <p>{selectedEnrollment.completedAt ? new Date(selectedEnrollment.completedAt).toLocaleDateString() : "Not completed"}</p>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Progress</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Progress value={selectedEnrollment.progress} className="flex-1" />
                    <span className="font-medium">{selectedEnrollment.progress}%</span>
                  </div>
                </div>

                {selectedEnrollment.grade && (
                  <div>
                    <Label className="font-semibold">Grade</Label>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-lg px-3 py-1">{selectedEnrollment.grade}</Badge>
                    </div>
                  </div>
                )}

                {selectedEnrollment.certificateIssued && (
                  <div>
                    <Label className="font-semibold">Certificate</Label>
                    <div className="mt-2">
                      <Badge variant="default">Certificate Issued</Badge>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Contact Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
