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
  MessageSquare, 
  TrendingUp,
  DollarSign,
  UserCheck,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Award,
  Bell,
  Globe
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();

  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      return response.json();
    },
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/dashboard/activity"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/activity");
      if (!response.ok) return [];
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  const quickStats = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      change: "+12.5%",
      changeType: "positive",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Active Courses",
      value: stats?.totalCourses || 0,
      change: "+8.2%",
      changeType: "positive",
      icon: BookOpen,
      color: "bg-green-500"
    },
    {
      title: "Monthly Revenue",
      value: `৳${stats?.monthlyRevenue || 0}`,
      change: "+15.3%",
      changeType: "positive",
      icon: DollarSign,
      color: "bg-purple-500"
    },
    {
      title: "Completion Rate",
      value: `${stats?.completionRate || 0}%`,
      change: "-2.1%",
      changeType: "negative",
      icon: Target,
      color: "bg-orange-500"
    },
  ];

  const recentEnrollments = [
    {
      id: 1,
      student: "Ahmed Hassan",
      course: "IELTS Complete Prep",
      date: "2024-01-15",
      status: "active",
      amount: "৳15,000"
    },
    {
      id: 2,
      student: "Sarah Khan",
      course: "SAT Math Mastery",
      date: "2024-01-14",
      status: "pending",
      amount: "৳12,000"
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "IELTS Workshop",
      date: "2024-01-20",
      time: "10:00 AM",
      attendees: 45,
      maxAttendees: 50
    },
    {
      id: 2,
      title: "Study Abroad Seminar",
      date: "2024-01-22",
      time: "2:00 PM",
      attendees: 32,
      maxAttendees: 40
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-blue-100">
                Here's what's happening with your platform today.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 rounded-lg p-4">
                <Activity className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'positive' ? (
                          <ArrowUpRight className="h-4 w-4 inline mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 inline mr-1" />
                        )}
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Enrollments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-2" />
                    Recent Enrollments
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/enrollments">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {enrollment.student.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{enrollment.student}</h4>
                            <p className="text-sm text-gray-600">{enrollment.course}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                          {enrollment.status}
                        </Badge>
                        <p className="text-sm font-medium text-gray-900 mt-1">{enrollment.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Course Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "IELTS Complete Prep", completion: 87, enrolled: 156 },
                    { name: "SAT Math Mastery", completion: 92, enrolled: 89 },
                    { name: "TOEFL Intensive", completion: 78, enrolled: 67 },
                  ].map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{course.name}</span>
                        <span className="text-sm text-gray-600">{course.completion}% completion</span>
                      </div>
                      <Progress value={course.completion} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{course.enrolled} students enrolled</span>
                        <span>{Math.round(course.enrolled * course.completion / 100)} completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/admin/courses">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Course
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/study-abroad-services">
                    <Globe className="h-4 w-4 mr-2" />
                    Study Abroad Services
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/students">
                    <Users className="h-4 w-4 mr-2" />
                    Add Student
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/events">
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/instructors">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Add Instructor
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {event.attendees}/{event.maxAttendees} registered
                        </span>
                        <Badge variant="outline">
                          {Math.round((event.attendees / event.maxAttendees) * 100)}% full
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Platform Status</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment System</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Service</span>
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Maintenance
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-900">Payment received from John Doe</p>
                    <p className="text-gray-500">2 minutes ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-900">New course enrollment</p>
                    <p className="text-gray-500">15 minutes ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-900">Mock test completed</p>
                    <p className="text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
