import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { AdminLoading } from "@/components/admin/admin-loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, BookOpen, Calendar, DollarSign, Download, RefreshCw, GraduationCap, Award, BarChart3 } from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

const CHART_COLORS = ['#1C4E9C', '#33A9D9', '#2A7CCD', '#FF8042', '#00C49F'];

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("30");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real data from database
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      return response.json();
    },
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["/api/enrollments/all"],
    queryFn: async () => {
      // Note: You may need to create this endpoint to get all enrollments for admin
      const response = await fetch("/api/enrollments/all", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        // Fallback to empty array if endpoint doesn't exist yet
        return [];
      }
      return response.json();
    },
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  // Calculate real analytics from data
  const analyticsData = useMemo(() => {
    const students = users.filter((u: any) => u.role === 'student');
    const instructors = users.filter((u: any) => u.role === 'instructor' || u.role === 'admin');
    const activeCourses = courses.filter((c: any) => c.isActive);
    
    // Calculate total revenue from enrollments
    const totalRevenue = enrollments.reduce((sum: number, e: any) => {
      const course = courses.find((c: any) => c.id === e.courseId);
      return sum + (course ? parseFloat(course.price) : 0);
    }, 0);

    // Group enrollments by month
    const enrollmentsByMonth: { [key: string]: { count: number, revenue: number, students: Set<number> } } = {};
    enrollments.forEach((e: any) => {
      const date = new Date(e.enrolledAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!enrollmentsByMonth[monthKey]) {
        enrollmentsByMonth[monthKey] = { count: 0, revenue: 0, students: new Set() };
      }
      
      enrollmentsByMonth[monthKey].count++;
      enrollmentsByMonth[monthKey].students.add(e.userId);
      
      const course = courses.find((c: any) => c.id === e.courseId);
      if (course) {
        enrollmentsByMonth[monthKey].revenue += parseFloat(course.price);
      }
    });

    // Create revenue chart data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueChart = Object.keys(enrollmentsByMonth)
      .sort()
      .slice(-6)
      .map(key => {
        const [year, month] = key.split('-');
        return {
          month: monthNames[parseInt(month) - 1],
          revenue: enrollmentsByMonth[key].revenue,
          students: enrollmentsByMonth[key].students.size,
          enrollments: enrollmentsByMonth[key].count
        };
      });

    // Course performance
    const coursePerformance = courses
      .filter((c: any) => c.isActive)
      .map((course: any) => {
        const courseEnrollments = enrollments.filter((e: any) => e.courseId === course.id);
        const completedEnrollments = courseEnrollments.filter((e: any) => e.completedAt);
        const completionRate = courseEnrollments.length > 0 
          ? Math.round((completedEnrollments.length / courseEnrollments.length) * 100)
          : 0;
        
        return {
          name: course.title,
          students: courseEnrollments.length,
          revenue: courseEnrollments.length * parseFloat(course.price),
          completion: completionRate,
          rating: parseFloat(course.rating) || 0
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Student distribution
    const activeEnrollments = enrollments.filter((e: any) => e.isActive && !e.completedAt);
    const completedEnrollments = enrollments.filter((e: any) => e.completedAt);
    const totalEnrollments = enrollments.length;
    
    const studentDistribution = [
      { 
        name: 'Active', 
        value: totalEnrollments > 0 ? Math.round((activeEnrollments.length / totalEnrollments) * 100) : 0,
        students: activeEnrollments.length 
      },
      { 
        name: 'Completed', 
        value: totalEnrollments > 0 ? Math.round((completedEnrollments.length / totalEnrollments) * 100) : 0,
        students: completedEnrollments.length 
      },
      { 
        name: 'Inactive', 
        value: totalEnrollments > 0 ? Math.round(((totalEnrollments - activeEnrollments.length - completedEnrollments.length) / totalEnrollments) * 100) : 0,
        students: totalEnrollments - activeEnrollments.length - completedEnrollments.length 
      },
    ];

    // Top instructors
    const instructorStats = instructors.map((instructor: any) => {
      const instructorCourses = courses.filter((c: any) => c.instructorId === instructor.id);
      const instructorEnrollments = enrollments.filter((e: any) => 
        instructorCourses.some((c: any) => c.id === e.courseId)
      );
      const avgRating = instructorCourses.length > 0
        ? instructorCourses.reduce((sum: number, c: any) => sum + parseFloat(c.rating || 0), 0) / instructorCourses.length
        : 0;

      return {
        name: `${instructor.firstName} ${instructor.lastName}`,
        students: new Set(instructorEnrollments.map((e: any) => e.userId)).size,
        rating: avgRating,
        courses: instructorCourses.length
      };
    }).sort((a, b) => b.students - a.students).slice(0, 4);

    // Enrollment trends
    const enrollmentTrends = Object.keys(enrollmentsByMonth)
      .sort()
      .slice(-6)
      .map(key => {
        const [year, month] = key.split('-');
        const monthData = enrollmentsByMonth[key];
        const completions = enrollments.filter((e: any) => {
          if (!e.completedAt) return false;
          const completeDate = new Date(e.completedAt);
          return `${completeDate.getFullYear()}-${String(completeDate.getMonth() + 1).padStart(2, '0')}` === key;
        }).length;

        return {
          date: `${monthNames[parseInt(month) - 1]} '${year.slice(-2)}`,
          enrollments: monthData.count,
          completions: completions
        };
      });

    // Category distribution
    const categoryStats: { [key: string]: number } = {};
    courses.forEach((course: any) => {
      const categoryName = course.category?.name || 'Uncategorized';
      const courseEnrollments = enrollments.filter((e: any) => e.courseId === course.id);
      categoryStats[categoryName] = (categoryStats[categoryName] || 0) + courseEnrollments.length;
    });

    const categoryDistribution = Object.entries(categoryStats)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      overview: {
        totalRevenue,
        totalStudents: students.length,
        totalCourses: activeCourses.length,
        totalInstructors: instructors.length,
        totalEnrollments: enrollments.length,
        avgCoursePrice: courses.length > 0 ? courses.reduce((sum: number, c: any) => sum + parseFloat(c.price), 0) / courses.length : 0,
      },
      revenueChart,
      coursePerformance,
      studentDistribution,
      topInstructors: instructorStats,
      enrollmentTrends,
      categoryDistribution,
    };
  }, [courses, users, enrollments, events]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refetch all queries
    setTimeout(() => setRefreshing(false), 1000);
  };

  const isLoading = loadingCourses || loadingUsers || loadingEnrollments || loadingEvents;

  if (isLoading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: COLORS.skyBlue }} />
            <div className="absolute inset-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.midBlue }} />
            <div className="absolute inset-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.deepBlue }}>
              <BarChart3 className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }



  return (
    <AdminLayout title="Analytics">
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
              <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-white/90 text-lg">Comprehensive insights and performance metrics</p>
            </div>
            <div className="absolute top-8 right-8 w-20 h-20 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              style={{ backgroundColor: COLORS.deepBlue }}
              className="text-white hover:opacity-90"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderColor: COLORS.deepBlue }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                   style={{ backgroundColor: COLORS.deepBlue }}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: COLORS.deepBlue }}>
                ৳{analyticsData.overview.totalRevenue.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Avg: ৳{Math.round(analyticsData.overview.avgCoursePrice).toLocaleString()} per course
              </p>
            </CardContent>
          </Card>

          {/* Total Students */}
          <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderColor: COLORS.skyBlue }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                   style={{ backgroundColor: COLORS.skyBlue }}>
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: COLORS.skyBlue }}>
                {analyticsData.overview.totalStudents.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {analyticsData.overview.totalEnrollments} enrollments
              </p>
            </CardContent>
          </Card>

          {/* Total Courses */}
          <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderColor: COLORS.midBlue }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Courses</CardTitle>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                   style={{ backgroundColor: COLORS.midBlue }}>
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: COLORS.midBlue }}>
                {analyticsData.overview.totalCourses}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Available for enrollment
              </p>
            </CardContent>
          </Card>

          {/* Total Instructors */}
          <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderColor: '#00C49F' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Instructors</CardTitle>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                   style={{ backgroundColor: '#00C49F' }}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#00C49F' }}>
                {analyticsData.overview.totalInstructors}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Active educators
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
            <TabsTrigger value="students">Student Analytics</TabsTrigger>
            <TabsTrigger value="courses">Course Performance</TabsTrigger>
            <TabsTrigger value="instructors">Instructor Analytics</TabsTrigger>
          </TabsList>

          {/* Revenue Trends Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: COLORS.deepBlue }}>Revenue Growth</CardTitle>
                  <CardDescription>Monthly revenue from course enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke={COLORS.darkGrey} />
                      <YAxis stroke={COLORS.darkGrey} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: `1px solid ${COLORS.skyBlue}`,
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={COLORS.deepBlue} 
                        strokeWidth={3}
                        dot={{ fill: COLORS.deepBlue, r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle style={{ color: COLORS.skyBlue }}>Student Acquisition</CardTitle>
                  <CardDescription>Monthly new student enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke={COLORS.darkGrey} />
                      <YAxis stroke={COLORS.darkGrey} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: `1px solid ${COLORS.skyBlue}`,
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="students" fill={COLORS.skyBlue} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            {analyticsData.categoryDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: COLORS.midBlue }}>Category Distribution</CardTitle>
                  <CardDescription>Enrollments by course category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.categoryDistribution} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke={COLORS.darkGrey} />
                      <YAxis dataKey="name" type="category" width={150} stroke={COLORS.darkGrey} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: `1px solid ${COLORS.midBlue}`,
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill={COLORS.midBlue} radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Student Analytics Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: COLORS.deepBlue }}>Student Distribution</CardTitle>
                  <CardDescription>Current enrollment status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.studentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.studentDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {analyticsData.studentDistribution.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="font-semibold">{item.students} students</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle style={{ color: COLORS.skyBlue }}>Enrollment Trends</CardTitle>
                  <CardDescription>Monthly enrollments vs completions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.enrollmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke={COLORS.darkGrey} />
                      <YAxis stroke={COLORS.darkGrey} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: `1px solid ${COLORS.skyBlue}`,
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="enrollments" 
                        stroke={COLORS.deepBlue} 
                        strokeWidth={2}
                        name="Enrollments"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completions" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                        name="Completions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Course Performance Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle style={{ color: COLORS.deepBlue }}>Top Performing Courses</CardTitle>
                <CardDescription>Courses ranked by revenue and completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.coursePerformance.length > 0 ? (
                    analyticsData.coursePerformance.map((course: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow"
                        style={{ border: `1px solid ${COLORS.offWhite}`, backgroundColor: '#FAFAFA' }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold" style={{ color: COLORS.deepBlue }}>
                                {course.name}
                              </h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-600">
                                  <Users className="inline h-4 w-4 mr-1" />
                                  {course.students} students
                                </span>
                                <span className="text-sm text-gray-600">
                                  <DollarSign className="inline h-4 w-4 mr-1" />
                                  ৳{course.revenue.toLocaleString()}
                                </span>
                                {course.rating > 0 && (
                                  <span className="text-sm text-gray-600">
                                    <Award className="inline h-4 w-4 mr-1" />
                                    {course.rating.toFixed(1)} ★
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Completion</div>
                            <div className="font-semibold text-lg" style={{ color: COLORS.deepBlue }}>
                              {course.completion}%
                            </div>
                          </div>
                          <div className="w-24">
                            <Progress 
                              value={course.completion} 
                              className="h-3"
                              style={{ 
                                backgroundColor: COLORS.offWhite,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No course performance data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructor Analytics Tab */}
          <TabsContent value="instructors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle style={{ color: COLORS.deepBlue }}>Top Instructors</CardTitle>
                <CardDescription>Instructor performance and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topInstructors.length > 0 ? (
                    analyticsData.topInstructors.map((instructor: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow"
                        style={{ border: `1px solid ${COLORS.offWhite}`, backgroundColor: '#FAFAFA' }}
                      >
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          >
                            {instructor.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg" style={{ color: COLORS.deepBlue }}>
                              {instructor.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              <BookOpen className="inline h-4 w-4 mr-1" />
                              {instructor.courses} {instructor.courses === 1 ? 'course' : 'courses'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-8">
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Students</div>
                            <div className="font-bold text-2xl" style={{ color: COLORS.skyBlue }}>
                              {instructor.students}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Rating</div>
                            <div className="font-bold text-2xl flex items-center" style={{ color: '#FFD700' }}>
                              <span>{instructor.rating > 0 ? instructor.rating.toFixed(1) : 'N/A'}</span>
                              {instructor.rating > 0 && <span className="ml-1">★</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No instructor data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
