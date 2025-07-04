import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { AdminLoading } from "@/components/admin/admin-loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, BookOpen, Calendar, DollarSign, Download, RefreshCw, Filter } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("30");
  const [refreshing, setRefreshing] = useState(false);

  // Sample data - in real app, this would come from API
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/analytics', dateRange],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        overview: {
          totalRevenue: 125000,
          revenueGrowth: 12.5,
          totalStudents: 1248,
          studentGrowth: 8.2,
          totalCourses: 45,
          courseGrowth: 15.0,
          totalInstructors: 12,
          instructorGrowth: 20.0,
        },
        revenueChart: [
          { month: 'Jan', revenue: 8000, students: 120 },
          { month: 'Feb', revenue: 9500, students: 145 },
          { month: 'Mar', revenue: 11000, students: 180 },
          { month: 'Apr', revenue: 12500, students: 220 },
          { month: 'May', revenue: 15000, students: 280 },
          { month: 'Jun', revenue: 18000, students: 320 },
        ],
        coursePerformance: [
          { name: 'Web Development', students: 320, revenue: 48000, completion: 85 },
          { name: 'Data Science', students: 280, revenue: 42000, completion: 78 },
          { name: 'Mobile Development', students: 240, revenue: 36000, completion: 82 },
          { name: 'UI/UX Design', students: 180, revenue: 27000, completion: 90 },
          { name: 'DevOps', students: 120, revenue: 18000, completion: 75 },
        ],
        studentDistribution: [
          { name: 'Active', value: 68, students: 849 },
          { name: 'Completed', value: 22, students: 275 },
          { name: 'Inactive', value: 10, students: 124 },
        ],
        topInstructors: [
          { name: 'Sarah Johnson', students: 156, rating: 4.9, courses: 5 },
          { name: 'Michael Chen', students: 142, rating: 4.8, courses: 4 },
          { name: 'Emily Davis', students: 128, rating: 4.7, courses: 3 },
          { name: 'David Wilson', students: 115, rating: 4.6, courses: 4 },
        ],
        enrollmentTrends: [
          { date: '2024-01', enrollments: 45, completions: 38 },
          { date: '2024-02', enrollments: 52, completions: 41 },
          { date: '2024-03', enrollments: 68, completions: 55 },
          { date: '2024-04', enrollments: 75, completions: 62 },
          { date: '2024-05', enrollments: 89, completions: 71 },
          { date: '2024-06', enrollments: 94, completions: 78 },
        ],
      };
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-1">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <p className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {change}% from last month
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <AdminLoading title="Analytics" message="Loading analytics data..." />;
  }

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your business performance and insights</p>
          </div>
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
            <Button onClick={handleRefresh} disabled={refreshing}>
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
          <StatCard
            title="Total Revenue"
            value={`$${analyticsData?.overview.totalRevenue.toLocaleString()}`}
            change={analyticsData?.overview.revenueGrowth}
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            title="Total Students"
            value={analyticsData?.overview.totalStudents.toLocaleString()}
            change={analyticsData?.overview.studentGrowth}
            icon={Users}
            trend="up"
          />
          <StatCard
            title="Total Courses"
            value={analyticsData?.overview.totalCourses}
            change={analyticsData?.overview.courseGrowth}
            icon={BookOpen}
            trend="up"
          />
          <StatCard
            title="Total Instructors"
            value={analyticsData?.overview.totalInstructors}
            change={analyticsData?.overview.instructorGrowth}
            icon={Users}
            trend="up"
          />
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
            <TabsTrigger value="students">Student Analytics</TabsTrigger>
            <TabsTrigger value="courses">Course Performance</TabsTrigger>
            <TabsTrigger value="instructors">Instructor Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                  <CardDescription>Monthly revenue and student acquisition</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData?.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Acquisition</CardTitle>
                  <CardDescription>Monthly student enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData?.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Distribution</CardTitle>
                  <CardDescription>Current student status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.studentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData?.studentDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Trends</CardTitle>
                  <CardDescription>Monthly enrollments vs completions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData?.enrollmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="enrollments" stroke="#0088FE" strokeWidth={2} />
                      <Line type="monotone" dataKey="completions" stroke="#00C49F" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Top performing courses by revenue and completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.coursePerformance.map((course: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{course.name}</h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">{course.students} students</span>
                          <span className="text-sm text-gray-600">${course.revenue.toLocaleString()} revenue</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Completion Rate</div>
                          <div className="font-semibold">{course.completion}%</div>
                        </div>
                        <div className="w-20">
                          <Progress value={course.completion} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Instructors</CardTitle>
                <CardDescription>Instructor performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.topInstructors.map((instructor: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {instructor.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold">{instructor.name}</h4>
                          <p className="text-sm text-gray-600">{instructor.courses} courses</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Students</div>
                          <div className="font-semibold">{instructor.students}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Rating</div>
                          <div className="font-semibold flex items-center">
                            <span>{instructor.rating}</span>
                            <span className="text-yellow-500 ml-1">★</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
