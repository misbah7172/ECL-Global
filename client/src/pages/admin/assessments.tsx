import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Search, TrendingUp, FileText, CheckCircle2, Clock, Award } from "lucide-react";

interface MockTest {
  id: number;
  title: string;
  description: string | null;
  testType: string;
  duration: number;
  totalQuestions: number;
  questions: any;
  isActive: boolean;
  createdAt: Date;
  _count?: {
    attempts: number;
  };
}

interface MockTestAttempt {
  id: number;
  userId: number;
  mockTestId: number;
  answers: any;
  score: number | null;
  completedAt: Date | null;
  timeSpent: number | null;
  isCompleted: boolean;
  startedAt: Date;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  price: number;
  instructor: {
    id: number;
    username: string;
    email: string;
  };
  _count?: {
    enrollments: number;
  };
}

export default function AdminAssessments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mockTests, isLoading } = useQuery<MockTest[]>({
    queryKey: ['/api/mock-tests'],
    queryFn: async () => {
      const response = await fetch('/api/mock-tests');
      if (!response.ok) throw new Error('Failed to fetch assessments');
      return response.json();
    },
  });

  const { data: attempts } = useQuery<MockTestAttempt[]>({
    queryKey: ['/api/mock-test-attempts'],
    queryFn: async () => {
      const response = await fetch('/api/mock-test-attempts', {
        credentials: 'include',
      });
      if (!response.ok) return [];
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

  const filteredTests = useMemo(() => {
    if (!mockTests) return [];
    return mockTests.filter(test => {
      const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.testType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === "all" || test.testType === typeFilter;
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && test.isActive) ||
                           (statusFilter === "inactive" && !test.isActive);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [mockTests, searchTerm, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!mockTests || !attempts || !courses) return {
      totalAssessments: 0,
      activeTests: 0,
      totalSubmissions: 0,
      averageScore: 0,
    };
    
    const totalAssessments = mockTests.length + courses.length;
    const activeTests = mockTests.filter(t => t.isActive).length;
    const totalSubmissions = attempts.length;
    const completedAttempts = attempts.filter(a => a.isCompleted && a.score !== null);
    const averageScore = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / completedAttempts.length
      : 0;

    return {
      totalAssessments,
      activeTests,
      totalSubmissions,
      averageScore: Math.round(averageScore),
    };
  }, [mockTests, attempts, courses]);

  const testTypes = useMemo(() => {
    if (!mockTests) return [];
    return Array.from(new Set(mockTests.map(t => t.testType)));
  }, [mockTests]);

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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ClipboardList className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Assessments & Evaluations</h1>
              </div>
              <p className="text-blue-100">Monitor student performance and test results</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#1C4E9C]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-5 w-5 text-[#1C4E9C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1C4E9C]">{stats.totalAssessments}</div>
              <p className="text-xs text-muted-foreground mt-1">Tests and courses</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#33A9D9]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
              <TrendingUp className="h-5 w-5 text-[#33A9D9]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#33A9D9]">{stats.activeTests}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently available</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed attempts</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#FFD700]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-5 w-5 text-[#FFD700]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FFD700]">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1C4E9C]">Filter Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {testTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assessments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1C4E9C]">All Assessments</CardTitle>
            <CardDescription>
              {filteredTests.length} assessments found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No assessments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{test.title}</div>
                          {test.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {test.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#E8F4F8] text-[#1C4E9C] border-[#33A9D9]">
                          {test.testType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{test.duration} min</span>
                        </div>
                      </TableCell>
                      <TableCell>{test.totalQuestions}</TableCell>
                      <TableCell>
                        <span className="text-[#33A9D9] font-medium">
                          {test._count?.attempts || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={test.isActive 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-gray-400 hover:bg-gray-500"
                          }
                        >
                          {test.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Course Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1C4E9C]">Course-Based Assessments</CardTitle>
            <CardDescription>
              Enrolled courses with performance tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!courses || courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{course.title}</div>
                          {course.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{course.instructor.username}</TableCell>
                      <TableCell>
                        <span className="text-[#33A9D9] font-medium">
                          {course._count?.enrollments || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">
                          ${Number(course.price).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
