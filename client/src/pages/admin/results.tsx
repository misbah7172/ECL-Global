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
import { Search, Filter, BarChart, TrendingUp, TrendingDown, Users, Award, Download, Eye, Mail, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Result {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  assessmentId: number;
  assessmentTitle: string;
  assessmentType: 'assignment' | 'quiz' | 'project' | 'exam';
  courseId: number;
  courseName: string;
  instructorName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: 'pass' | 'fail' | 'pending';
  submittedAt: string;
  gradedAt?: string;
  feedback?: string;
  attempts: number;
  timeSpent?: number; // in minutes
}

const gradeColors = {
  'A+': 'bg-green-100 text-green-800',
  'A': 'bg-green-100 text-green-800',
  'B+': 'bg-blue-100 text-blue-800',
  'B': 'bg-blue-100 text-blue-800',
  'C+': 'bg-yellow-100 text-yellow-800',
  'C': 'bg-yellow-100 text-yellow-800',
  'D': 'bg-orange-100 text-orange-800',
  'F': 'bg-red-100 text-red-800',
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminResults() {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [assessmentFilter, setAssessmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const queryClient = useQueryClient();

  const { data: results, isLoading } = useQuery({
    queryKey: ['/api/admin/results'],
    queryFn: async () => {
      // Mock data - in real app, this would fetch from API
      const mockData: Result[] = [
        {
          id: 1,
          studentId: 101,
          studentName: "Alice Johnson",
          studentEmail: "alice@example.com",
          assessmentId: 1,
          assessmentTitle: "JavaScript Fundamentals Quiz",
          assessmentType: 'quiz',
          courseId: 1,
          courseName: "Full Stack Web Development",
          instructorName: "Sarah Johnson",
          totalMarks: 100,
          obtainedMarks: 87,
          percentage: 87,
          grade: "A",
          status: 'pass',
          submittedAt: "2024-01-15T14:30:00Z",
          gradedAt: "2024-01-15T16:00:00Z",
          feedback: "Excellent work! Good understanding of JavaScript concepts.",
          attempts: 1,
          timeSpent: 42,
        },
        {
          id: 2,
          studentId: 102,
          studentName: "Bob Smith",
          studentEmail: "bob@example.com",
          assessmentId: 1,
          assessmentTitle: "JavaScript Fundamentals Quiz",
          assessmentType: 'quiz',
          courseId: 1,
          courseName: "Full Stack Web Development",
          instructorName: "Sarah Johnson",
          totalMarks: 100,
          obtainedMarks: 72,
          percentage: 72,
          grade: "B",
          status: 'pass',
          submittedAt: "2024-01-15T15:45:00Z",
          gradedAt: "2024-01-15T17:30:00Z",
          feedback: "Good effort! Review arrow functions and closures.",
          attempts: 2,
          timeSpent: 55,
        },
        {
          id: 3,
          studentId: 103,
          studentName: "Charlie Brown",
          studentEmail: "charlie@example.com",
          assessmentId: 2,
          assessmentTitle: "Web Development Project",
          assessmentType: 'project',
          courseId: 1,
          courseName: "Full Stack Web Development",
          instructorName: "Sarah Johnson",
          totalMarks: 200,
          obtainedMarks: 45,
          percentage: 22.5,
          grade: "F",
          status: 'fail',
          submittedAt: "2024-01-20T23:59:00Z",
          gradedAt: "2024-01-22T10:00:00Z",
          feedback: "Project incomplete. Missing authentication and database integration.",
          attempts: 1,
          timeSpent: 120,
        },
        {
          id: 4,
          studentId: 104,
          studentName: "Diana Prince",
          studentEmail: "diana@example.com",
          assessmentId: 3,
          assessmentTitle: "Data Analysis Assignment",
          assessmentType: 'assignment',
          courseId: 2,
          courseName: "Data Science Bootcamp",
          instructorName: "Mike Chen",
          totalMarks: 100,
          obtainedMarks: 92,
          percentage: 92,
          grade: "A+",
          status: 'pass',
          submittedAt: "2024-01-25T18:00:00Z",
          gradedAt: "2024-01-26T09:00:00Z",
          feedback: "Outstanding analysis! Excellent use of visualization techniques.",
          attempts: 1,
          timeSpent: 180,
        },
      ];
      return mockData;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      return [
        { id: 1, name: "Full Stack Web Development" },
        { id: 2, name: "Data Science Bootcamp" },
        { id: 3, name: "Mobile App Development" },
      ];
    },
  });

  const { data: assessments } = useQuery({
    queryKey: ['/api/assessments'],
    queryFn: async () => {
      return [
        { id: 1, title: "JavaScript Fundamentals Quiz" },
        { id: 2, title: "Web Development Project" },
        { id: 3, title: "Data Analysis Assignment" },
      ];
    },
  });

  const filteredResults = results?.filter(result => {
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === "all" || result.courseName === courseFilter;
    const matchesAssessment = assessmentFilter === "all" || result.assessmentTitle === assessmentFilter;
    const matchesStatus = statusFilter === "all" || result.status === statusFilter;
    const matchesGrade = gradeFilter === "all" || result.grade === gradeFilter;
    
    return matchesSearch && matchesCourse && matchesAssessment && matchesStatus && matchesGrade;
  });

  // Statistics calculations
  const totalResults = results?.length || 0;
  const passRate = results?.length ? (results.filter(r => r.status === 'pass').length / results.length) * 100 : 0;
  const averageScore = results?.length ? 
    results.reduce((sum, r) => sum + r.percentage, 0) / results.length : 0;
  const averageTime = results?.length ? 
    results.filter(r => r.timeSpent).reduce((sum, r) => sum + (r.timeSpent || 0), 0) / results.filter(r => r.timeSpent).length : 0;

  // Grade distribution for pie chart
  const gradeDistribution = results?.reduce((acc, result) => {
    acc[result.grade] = (acc[result.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const gradeChartData = Object.entries(gradeDistribution || {}).map(([grade, count]) => ({
    name: grade,
    value: count,
  }));

  // Performance trend data
  const performanceTrend = [
    { month: 'Jan', average: 78, passRate: 85 },
    { month: 'Feb', average: 82, passRate: 88 },
    { month: 'Mar', average: 79, passRate: 83 },
    { month: 'Apr', average: 85, passRate: 92 },
    { month: 'May', average: 87, passRate: 95 },
    { month: 'Jun', average: 84, passRate: 90 },
  ];

  const handleViewDetails = (result: Result) => {
    setSelectedResult(result);
    setIsDetailModalOpen(true);
  };

  const sendResultEmail = (result: Result) => {
    // Mock email sending functionality
    toast({ 
      title: "Email Sent", 
      description: `Result notification sent to ${result.studentEmail}` 
    });
  };

  const exportResults = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Student Name,Student Email,Assessment,Course,Instructor,Total Marks,Obtained Marks,Percentage,Grade,Status,Submitted At,Graded At,Attempts,Time Spent\n" +
      filteredResults?.map(result => 
        `"${result.studentName}","${result.studentEmail}","${result.assessmentTitle}","${result.courseName}","${result.instructorName}",${result.totalMarks},${result.obtainedMarks},${result.percentage}%,${result.grade},${result.status},"${result.submittedAt}","${result.gradedAt || 'N/A'}",${result.attempts},${result.timeSpent || 'N/A'}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Results Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResults}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{passRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Across all assessments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time Spent</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageTime.toFixed(0)} min</div>
              <p className="text-xs text-muted-foreground">
                Per assessment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Average scores and pass rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="average" stroke="#8884d8" name="Average Score" />
                  <Line type="monotone" dataKey="passRate" stroke="#82ca9d" name="Pass Rate" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>Distribution of grades across all assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gradeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Results Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Assessment Results</CardTitle>
                <CardDescription>
                  Track and analyze student performance across all assessments
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportResults} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students or assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map(course => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={assessmentFilter} onValueChange={setAssessmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by assessment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assessments</SelectItem>
                  {assessments?.map(assessment => (
                    <SelectItem key={assessment.id} value={assessment.title}>
                      {assessment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C+">C+</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredResults?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No results found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults?.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.studentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {result.studentEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.assessmentTitle}</div>
                            <div className="text-sm text-muted-foreground">
                              {result.assessmentType}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{result.courseName}</div>
                            <div className="text-sm text-muted-foreground">
                              {result.instructorName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {result.obtainedMarks}/{result.totalMarks}
                            </div>
                            <Progress value={result.percentage} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {result.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={gradeColors[result.grade as keyof typeof gradeColors]}>
                            {result.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={result.status === 'pass' ? 'default' : 
                                        result.status === 'fail' ? 'destructive' : 'secondary'}>
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(result.submittedAt).toLocaleDateString()}
                            <div className="text-muted-foreground">
                              {result.attempts > 1 && `${result.attempts} attempts`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewDetails(result)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => sendResultEmail(result)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Result Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Result Details</DialogTitle>
              <DialogDescription>
                Detailed information about the assessment result
              </DialogDescription>
            </DialogHeader>
            {selectedResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Student</Label>
                    <p className="text-sm">{selectedResult.studentName}</p>
                    <p className="text-xs text-muted-foreground">{selectedResult.studentEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Assessment</Label>
                    <p className="text-sm">{selectedResult.assessmentTitle}</p>
                    <p className="text-xs text-muted-foreground">{selectedResult.assessmentType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Course</Label>
                    <p className="text-sm">{selectedResult.courseName}</p>
                    <p className="text-xs text-muted-foreground">{selectedResult.instructorName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Score</Label>
                    <p className="text-sm">{selectedResult.obtainedMarks}/{selectedResult.totalMarks}</p>
                    <Progress value={selectedResult.percentage} className="h-2 mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Grade & Status</Label>
                    <div className="flex gap-2 mt-1">
                      <Badge className={gradeColors[selectedResult.grade as keyof typeof gradeColors]}>
                        {selectedResult.grade}
                      </Badge>
                      <Badge variant={selectedResult.status === 'pass' ? 'default' : 
                                    selectedResult.status === 'fail' ? 'destructive' : 'secondary'}>
                        {selectedResult.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Submission Details</Label>
                    <p className="text-sm">Submitted: {new Date(selectedResult.submittedAt).toLocaleString()}</p>
                    {selectedResult.gradedAt && (
                      <p className="text-sm">Graded: {new Date(selectedResult.gradedAt).toLocaleString()}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Attempts: {selectedResult.attempts}
                      {selectedResult.timeSpent && ` | Time spent: ${selectedResult.timeSpent} min`}
                    </p>
                  </div>
                </div>
                {selectedResult.feedback && (
                  <div>
                    <Label className="text-sm font-medium">Feedback</Label>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                      {selectedResult.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              {selectedResult && (
                <Button onClick={() => sendResultEmail(selectedResult)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Result
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
