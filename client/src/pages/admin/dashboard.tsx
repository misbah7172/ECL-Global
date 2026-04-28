import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Redirect, Link } from "wouter";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  UserCheck,
  Clock,
  Target,
  Award,
  Globe,
  GraduationCap,
  FileText,
  MapPin
} from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();

  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  // Fetch real data from API
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    queryFn: async () => {
      const response = await fetch("/api/enrollments");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const isLoading = statsLoading || enrollmentsLoading || coursesLoading || eventsLoading || usersLoading;

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: COLORS.skyBlue }} />
            <div className="absolute inset-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.midBlue }} />
            <div className="absolute inset-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.deepBlue }}>
              <GraduationCap className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>Loading Dashboard</h3>
          <p style={{ color: COLORS.darkGrey }}>Fetching platform analytics...</p>
        </div>
      </AdminLayout>
    );
  }

  // Calculate real statistics
  const totalStudents = Array.isArray(users) ? users.filter((u: any) => u.role === 'student').length : 0;
  const activeCourses = Array.isArray(courses) ? courses.filter((c: any) => c.isActive).length : 0;
  const totalEnrollments = Array.isArray(enrollments) ? enrollments.length : 0;
  const upcomingEvents = Array.isArray(events) 
    ? events.filter((e: any) => new Date(e.eventDate) > new Date()).length 
    : 0;

  // Get recent enrollments with course details
  const recentEnrollments = Array.isArray(enrollments) && Array.isArray(courses)
    ? enrollments
        .slice(0, 5)
        .map((enrollment: any) => {
          const course = courses.find((c: any) => c.id === enrollment.courseId);
          const student = Array.isArray(users) ? users.find((u: any) => u.id === enrollment.userId) : null;
          return {
            ...enrollment,
            courseName: course?.title || `Course #${enrollment.courseId}`,
            coursePrice: course?.price || 0,
            studentName: student ? `${student.firstName} ${student.lastName}` : 'Student',
          };
        })
    : [];

  // Get top performing courses
  const topCourses = Array.isArray(courses)
    ? courses
        .filter((c: any) => c.isActive)
        .sort((a: any, b: any) => b.enrolledCount - a.enrolledCount)
        .slice(0, 3)
    : [];

  // Get upcoming events
  const nextEvents = Array.isArray(events)
    ? events
        .filter((e: any) => new Date(e.eventDate) > new Date())
        .sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .slice(0, 3)
    : [];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div 
          className="text-white rounded-2xl p-8 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 50%, ${COLORS.skyBlue} 100%)`
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-blue-100 text-lg">
                Here's what's happening with ECL Global platform today.
              </p>
            </div>
            <div className="hidden md:block">
              <div 
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
              >
                <GraduationCap className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                >
                  <Users className="h-7 w-7" style={{ color: COLORS.skyBlue }} />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-4xl font-bold mb-1" style={{ color: COLORS.deepBlue }}>
                {totalStudents}
              </p>
              <p className="text-sm" style={{ color: COLORS.darkGrey }}>Total Students</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${COLORS.midBlue}20` }}
                >
                  <BookOpen className="h-7 w-7" style={{ color: COLORS.midBlue }} />
                </div>
                <Target className="h-5 w-5" style={{ color: COLORS.midBlue }} />
              </div>
              <p className="text-4xl font-bold mb-1" style={{ color: COLORS.deepBlue }}>
                {activeCourses}
              </p>
              <p className="text-sm" style={{ color: COLORS.darkGrey }}>Active Courses</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#10B98120' }}
                >
                  <UserCheck className="h-7 w-7 text-green-600" />
                </div>
                <Award className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-4xl font-bold mb-1" style={{ color: COLORS.deepBlue }}>
                {totalEnrollments}
              </p>
              <p className="text-sm" style={{ color: COLORS.darkGrey }}>Total Enrollments</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F59E0B20' }}
                >
                  <Calendar className="h-7 w-7 text-orange-500" />
                </div>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-4xl font-bold mb-1" style={{ color: COLORS.deepBlue }}>
                {upcomingEvents}
              </p>
              <p className="text-sm" style={{ color: COLORS.darkGrey }}>Upcoming Events</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Enrollments */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl" style={{ color: COLORS.deepBlue }}>
                    <UserCheck className="h-6 w-6 mr-3" style={{ color: COLORS.skyBlue }} />
                    Recent Enrollments
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                  >
                    <Link href="/admin/enrollments">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentEnrollments.length > 0 ? (
                  <div className="space-y-4">
                    {recentEnrollments.map((enrollment: any) => (
                      <div 
                        key={enrollment.id} 
                        className="p-5 rounded-xl hover:shadow-md transition-shadow"
                        style={{ backgroundColor: COLORS.offWhite }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: COLORS.skyBlue }}
                            >
                              <span className="text-white font-bold text-sm">
                                {enrollment.studentName.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold" style={{ color: COLORS.deepBlue }}>
                                {enrollment.studentName}
                              </h4>
                              <p className="text-sm" style={{ color: COLORS.darkGrey }}>
                                {enrollment.courseName}
                              </p>
                              <p className="text-xs" style={{ color: COLORS.darkGrey }}>
                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className="text-white font-semibold mb-2"
                              style={{ backgroundColor: enrollment.isActive ? '#10B981' : COLORS.darkGrey }}
                            >
                              {enrollment.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {enrollment.coursePrice > 0 && (
                              <p className="text-sm font-bold" style={{ color: COLORS.deepBlue }}>
                                ৳{enrollment.coursePrice}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                    >
                      <UserCheck className="h-8 w-8" style={{ color: COLORS.skyBlue }} />
                    </div>
                    <p style={{ color: COLORS.darkGrey }}>No enrollments yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Performing Courses */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl" style={{ color: COLORS.deepBlue }}>
                  <Award className="h-6 w-6 mr-3" style={{ color: COLORS.skyBlue }} />
                  Top Performing Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topCourses.length > 0 ? (
                  <div className="space-y-5">
                    {topCourses.map((course: any, index: number) => (
                      <div key={course.id} className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white"
                              style={{ backgroundColor: COLORS.skyBlue }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-bold" style={{ color: COLORS.deepBlue }}>
                                {course.title}
                              </h4>
                              <p className="text-sm" style={{ color: COLORS.darkGrey }}>
                                {course.enrolledCount} students enrolled
                              </p>
                            </div>
                          </div>
                          <Badge 
                            className="text-white"
                            style={{ backgroundColor: '#10B981' }}
                          >
                            Active
                          </Badge>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span style={{ color: COLORS.darkGrey }}>Enrollment</span>
                            <span className="font-bold" style={{ color: COLORS.deepBlue }}>
                              {course.enrolledCount} / {course.totalSessions * 10}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(100, (course.enrolledCount / (course.totalSessions * 10)) * 100)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                    >
                      <BookOpen className="h-8 w-8" style={{ color: COLORS.skyBlue }} />
                    </div>
                    <p style={{ color: COLORS.darkGrey }}>No courses available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: COLORS.deepBlue }}>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start h-11 text-white font-semibold"
                  asChild
                  style={{ backgroundColor: COLORS.skyBlue }}
                >
                  <Link href="/admin/courses">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Add New Course
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11"
                  asChild
                  style={{ borderColor: COLORS.midBlue, color: COLORS.midBlue }}
                >
                  <Link href="/admin/study-abroad-services">
                    <Globe className="h-4 w-4 mr-2" />
                    Study Abroad Services
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11"
                  asChild
                  style={{ borderColor: COLORS.midBlue, color: COLORS.midBlue }}
                >
                  <Link href="/admin/students">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Students
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11"
                  asChild
                  style={{ borderColor: COLORS.midBlue, color: COLORS.midBlue }}
                >
                  <Link href="/admin/events">
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11"
                  asChild
                  style={{ borderColor: COLORS.midBlue, color: COLORS.midBlue }}
                >
                  <Link href="/admin/mock-tests">
                    <FileText className="h-4 w-4 mr-2" />
                    Mock Tests
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: COLORS.deepBlue }}>
                  <Calendar className="h-5 w-5 mr-2" style={{ color: COLORS.skyBlue }} />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nextEvents.length > 0 ? (
                  <div className="space-y-4">
                    {nextEvents.map((event: any) => (
                      <div 
                        key={event.id} 
                        className="p-4 rounded-lg hover:shadow-md transition-shadow"
                        style={{ backgroundColor: COLORS.offWhite }}
                      >
                        <h4 className="font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                          {event.title}
                        </h4>
                        <div className="flex items-center text-sm mb-2" style={{ color: COLORS.darkGrey }}>
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(event.eventDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: COLORS.darkGrey }}>
                            {event.registeredCount || 0} registered
                          </span>
                          <Badge 
                            className="text-white text-xs"
                            style={{ backgroundColor: COLORS.midBlue }}
                          >
                            {event.eventType}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                    >
                      <Calendar className="h-6 w-6" style={{ color: COLORS.skyBlue }} />
                    </div>
                    <p className="text-sm" style={{ color: COLORS.darkGrey }}>
                      No upcoming events
                    </p>
                  </div>
                )}
                {nextEvents.length > 0 && (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4"
                    asChild
                    style={{ color: COLORS.skyBlue }}
                  >
                    <Link href="/admin/events">View All Events →</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Platform Statistics */}
            <Card 
              className="border-0 shadow-lg text-white"
              style={{
                background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 100%)`
              }}
            >
              <CardHeader>
                <CardTitle className="text-white">Platform Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5" />
                    <span>Total Courses</span>
                  </div>
                  <span className="font-bold text-xl">
                    {Array.isArray(courses) ? courses.length : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5" />
                    <span>Total Events</span>
                  </div>
                  <span className="font-bold text-xl">
                    {Array.isArray(events) ? events.length : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5" />
                    <span>All Users</span>
                  </div>
                  <span className="font-bold text-xl">
                    {Array.isArray(users) ? users.length : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5" />
                    <span>Branches</span>
                  </div>
                  <span className="font-bold text-xl">5+</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
