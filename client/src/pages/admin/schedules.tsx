import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar as CalendarIcon, Clock, Users, BookOpen, TrendingUp, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface Course {
  id: number;
  title: string;
  categoryId: number;
  instructorId: number;
  duration: string;
  format: string;
  totalSessions: number;
  isActive: boolean;
  enrolledCount: number;
  createdAt: string;
  category?: { id: number; name: string };
  instructor?: { id: number; firstName: string; lastName: string };
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
}

interface Enrollment {
  id: number;
  courseId: number;
  userId: number;
}

export default function AdminSchedules() {
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses'],
  });

  // Fetch users (instructors)
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments/all'],
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeCourses = courses.filter((c: Course) => c.isActive).length;
    const totalSessions = courses.reduce((sum: number, c: Course) => sum + (c.totalSessions || 0), 0);
    const totalEnrollments = enrollments.length;
    const onlineCourses = courses.filter((c: Course) => c.format === 'online').length;
    
    return {
      totalCourses: courses.length,
      activeCourses,
      totalSessions,
      totalEnrollments,
      onlineCourses,
    };
  }, [courses, enrollments]);

  // Get instructor name
  const getInstructorName = (instructorId: number) => {
    const instructor = users.find((u: User) => u.id === instructorId && u.role === 'instructor');
    return instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Unknown';
  };

  // Get enrollment count for course
  const getEnrollmentCount = (courseId: number) => {
    return enrollments.filter((e: Enrollment) => e.courseId === courseId).length;
  };

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course: Course) => {
      const instructorName = getInstructorName(course.instructorId);
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                          instructorName.toLowerCase().includes(search.toLowerCase());
      const matchesFormat = formatFilter === "all" || course.format === formatFilter;
      const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "active" && course.isActive) ||
                          (statusFilter === "inactive" && !course.isActive);
      return matchesSearch && matchesFormat && matchesStatus;
    });
  }, [courses, search, formatFilter, statusFilter, users]);

  // Group courses by day/format for schedule view
  const scheduledCourses = useMemo(() => {
    return filteredCourses.map((course: Course) => {
      const enrollmentCount = getEnrollmentCount(course.id);
      const instructorName = getInstructorName(course.instructorId);
      
      return {
        ...course,
        enrollmentCount,
        instructorName,
      };
    });
  }, [filteredCourses, enrollments, users]);

  if (coursesLoading) {
    return (
      <AdminLayout title="Schedules">
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
              <CalendarIcon className="h-12 w-12 text-[#1C4E9C]" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Schedules">
      {/* Hero Section */}
      <div className="relative mb-8 rounded-lg overflow-hidden bg-gradient-to-r from-[#1C4E9C] to-[#2A7CCD] p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Course Schedules</h1>
              <p className="text-blue-100">Manage course timetables and sessions</p>
            </div>
            <CalendarIcon className="h-16 w-16 opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-[#1C4E9C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Courses</p>
                <p className="text-3xl font-bold text-[#1C4E9C]">{stats.activeCourses}</p>
              </div>
              <div className="bg-[#1C4E9C]/10 p-3 rounded-lg">
                <BookOpen className="h-8 w-8 text-[#1C4E9C]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#33A9D9]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-[#33A9D9]">{stats.totalSessions}</p>
              </div>
              <div className="bg-[#33A9D9]/10 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-[#33A9D9]" />
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
                <Users className="h-8 w-8 text-[#2A7CCD]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#FFD700]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Online Courses</p>
                <p className="text-3xl font-bold text-[#FFD700]">{stats.onlineCourses}</p>
              </div>
              <div className="bg-[#FFD700]/10 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-[#FFD700]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search courses or instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>

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

      {/* Course Schedules Grid */}
      <div className="grid grid-cols-1 gap-4">
        {scheduledCourses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No courses found</p>
              <p className="text-gray-400 text-sm">
                {search ? "Try a different search term" : "No scheduled courses available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          scheduledCourses.map((course: any) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="bg-[#1C4E9C]/10 p-3 rounded-lg">
                        <BookOpen className="h-6 w-6 text-[#1C4E9C]" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          <Badge variant={course.isActive ? "default" : "secondary"}>
                            {course.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {course.format}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2 text-[#1C4E9C]" />
                            <span className="font-medium">Instructor:</span>
                            <span className="ml-1">{course.instructorName}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-[#33A9D9]" />
                            <span className="font-medium">Duration:</span>
                            <span className="ml-1">{course.duration}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-[#2A7CCD]" />
                            <span className="font-medium">Sessions:</span>
                            <span className="ml-1">{course.totalSessions}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2 text-[#FFD700]" />
                            <span className="font-medium">Enrolled:</span>
                            <span className="ml-1">{course.enrollmentCount} students</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Created on {format(new Date(course.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {scheduledCourses.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {scheduledCourses.length} of {courses.length} courses
        </div>
      )}
    </AdminLayout>
  );
}
