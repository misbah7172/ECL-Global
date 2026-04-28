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
import { Search, Users, BookOpen, TrendingUp, Download, Eye, ClipboardCheck, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string;
  progress: number;
  completedAt?: string | null;
  isActive: boolean;
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
    totalSessions: number;
  };
}

interface Course {
  id: number;
  title: string;
  category: string;
  totalSessions: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function AdminAttendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseEnrollments, setCourseEnrollments] = useState<Enrollment[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
  });

  const { data: students } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      return users.filter((u: User) => u.role === 'student');
    },
  });

  // Group enrollments by course
  const courseAttendanceData = useMemo(() => {
    if (!enrollments || !courses) return [];
    
    return courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
      const totalStudents = courseEnrollments.length;
      const activeStudents = courseEnrollments.filter(e => e.isActive).length;
      const completedStudents = courseEnrollments.filter(e => e.completedAt).length;
      const averageProgress = totalStudents > 0 
        ? courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / totalStudents 
        : 0;
      const attendanceRate = totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0;

      return {
        course,
        totalStudents,
        activeStudents,
        completedStudents,
        averageProgress: Math.round(averageProgress),
        attendanceRate: Math.round(attendanceRate),
        enrollments: courseEnrollments,
      };
    });
  }, [enrollments, courses]);

  const filteredData = useMemo(() => {
    if (!courseAttendanceData) return [];
    return courseAttendanceData.filter(data => {
      const matchesSearch = data.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           data.course.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCourse = courseFilter === "all" || data.course.id.toString() === courseFilter;
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && data.activeStudents > 0) ||
                           (statusFilter === "completed" && data.completedStudents > 0) ||
                           (statusFilter === "inactive" && data.activeStudents === 0);
      
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [courseAttendanceData, searchTerm, courseFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!enrollments) return { 
      totalEnrollments: 0, 
      activeStudents: 0, 
      averageAttendance: 0,
      totalCourses: 0 
    };
    
    const totalEnrollments = enrollments.length;
    const activeStudents = enrollments.filter(e => e.isActive).length;
    const averageAttendance = totalEnrollments > 0 
      ? (activeStudents / totalEnrollments) * 100 
      : 0;
    const totalCourses = new Set(enrollments.map(e => e.courseId)).size;

    return { 
      totalEnrollments, 
      activeStudents, 
      averageAttendance: Math.round(averageAttendance),
      totalCourses 
    };
  }, [enrollments]);

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    const courseEnrolls = enrollments?.filter(e => e.courseId === course.id) || [];
    setCourseEnrollments(courseEnrolls);
    setIsDetailModalOpen(true);
  };

  const exportData = () => {
    const csv = [
      ["Course", "Category", "Total Students", "Active Students", "Completed Students", "Average Progress", "Attendance Rate"],
      ...filteredData.map(data => [
        data.course.title,
        data.course.category,
        data.totalStudents.toString(),
        data.activeStudents.toString(),
        data.completedStudents.toString(),
        `${data.averageProgress}%`,
        `${data.attendanceRate}%`
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_report.csv";
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
            <ClipboardCheck className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Attendance & Engagement Tracking</h1>
          </div>
          <p className="text-blue-100">Monitor student participation and course engagement</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#1C4E9C]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-5 w-5 text-[#1C4E9C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1C4E9C]">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#33A9D9]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <UserCheck className="h-5 w-5 text-[#33A9D9]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#33A9D9]">{stats.activeStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently enrolled</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.averageAttendance}%</div>
              <p className="text-xs text-muted-foreground mt-1">Overall engagement</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#FFD700]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-5 w-5 text-[#FFD700]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FFD700]">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">Running courses</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1C4E9C]">Course Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Button onClick={exportData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1C4E9C]">Course Engagement Details</CardTitle>
            <CardDescription>
              {filteredData.length} courses found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Students</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Avg Progress</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No attendance data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((data) => (
                    <TableRow key={data.course.id}>
                      <TableCell className="font-medium">{data.course.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{data.course.category}</Badge>
                      </TableCell>
                      <TableCell>{data.totalStudents}</TableCell>
                      <TableCell>
                        <span className="text-[#33A9D9] font-medium">{data.activeStudents}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">{data.completedStudents}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#1C4E9C] transition-all"
                              style={{ width: `${data.averageProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{data.averageProgress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            data.attendanceRate >= 80 
                              ? "bg-green-500 hover:bg-green-600" 
                              : data.attendanceRate >= 60 
                              ? "bg-[#FFD700] hover:bg-[#FFD700]/90 text-black" 
                              : "bg-red-500 hover:bg-red-600"
                          }
                        >
                          {data.attendanceRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(data.course)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-[#1C4E9C]">Course Enrollment Details</DialogTitle>
              <DialogDescription>
                {selectedCourse && `${selectedCourse.title} - Student Enrollment List`}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No students enrolled
                      </TableCell>
                    </TableRow>
                  ) : (
                    courseEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.user.firstName} {enrollment.user.lastName}
                        </TableCell>
                        <TableCell>{enrollment.user.email}</TableCell>
                        <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#1C4E9C] transition-all"
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                            <span className="text-sm">{enrollment.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment.completedAt ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
                          ) : enrollment.isActive ? (
                            <Badge className="bg-[#33A9D9] hover:bg-[#2A7CCD]">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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