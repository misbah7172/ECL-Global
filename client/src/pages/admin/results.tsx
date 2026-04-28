import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Search, BarChart, TrendingUp, Award, FileText, CheckCircle2, Clock, Users } from "lucide-react";

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
  user?: {
    id: number;
    username: string;
    email: string;
  };
  mockTest?: MockTest;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function AdminResults() {
  const [searchTerm, setSearchTerm] = useState("");
  const [testFilter, setTestFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<MockTestAttempt | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attempts, isLoading } = useQuery<MockTestAttempt[]>({
    queryKey: ['/api/mock-test-attempts/all'],
    queryFn: async () => {
      const response = await fetch('/api/mock-test-attempts/all', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    },
  });

  const { data: mockTests } = useQuery<MockTest[]>({
    queryKey: ['/api/mock-tests'],
    queryFn: async () => {
      const response = await fetch('/api/mock-tests');
      if (!response.ok) throw new Error('Failed to fetch tests');
      return response.json();
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const enrichedAttempts = useMemo(() => {
    if (!attempts || !mockTests || !users) return [];
    
    return attempts.map(attempt => {
      const test = mockTests.find(t => t.id === attempt.mockTestId);
      const user = users.find(u => u.id === attempt.userId);
      
      return {
        ...attempt,
        mockTest: test,
        user: user,
      };
    });
  }, [attempts, mockTests, users]);

  const filteredResults = useMemo(() => {
    if (!enrichedAttempts) return [];
    
    return enrichedAttempts.filter(attempt => {
      const matchesSearch = 
        attempt.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.mockTest?.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTest = testFilter === "all" || 
        (attempt.mockTest && attempt.mockTest.id.toString() === testFilter);
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "completed" && attempt.isCompleted) ||
        (statusFilter === "in-progress" && !attempt.isCompleted);
      
      return matchesSearch && matchesTest && matchesStatus;
    });
  }, [enrichedAttempts, searchTerm, testFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!attempts) return {
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      passRate: 0,
    };
    
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.isCompleted).length;
    const scoredAttempts = attempts.filter(a => a.isCompleted && a.score !== null);
    const averageScore = scoredAttempts.length > 0
      ? scoredAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / scoredAttempts.length
      : 0;
    const passRate = scoredAttempts.length > 0
      ? (scoredAttempts.filter(a => Number(a.score) >= 60).length / scoredAttempts.length) * 100
      : 0;

    return {
      totalAttempts,
      completedAttempts,
      averageScore: Math.round(averageScore),
      passRate: Math.round(passRate),
    };
  }, [attempts]);

  const testOptions = useMemo(() => {
    if (!mockTests) return [];
    return mockTests;
  }, [mockTests]);

  const getGrade = (score: number | null): string => {
    if (score === null) return "N/A";
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  const getGradeColor = (grade: string): string => {
    if (grade === "A+" || grade === "A") return "bg-green-100 text-green-800";
    if (grade === "B") return "bg-blue-100 text-blue-800";
    if (grade === "C") return "bg-yellow-100 text-yellow-800";
    if (grade === "D") return "bg-orange-100 text-orange-800";
    if (grade === "F") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const handleViewDetails = (attempt: MockTestAttempt) => {
    setSelectedAttempt(attempt);
    setIsDetailModalOpen(true);
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Results & Performance</h1>
              </div>
              <p className="text-blue-100">Track student test results and performance analytics</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#1C4E9C]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <FileText className="h-5 w-5 text-[#1C4E9C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1C4E9C]">{stats.totalAttempts}</div>
              <p className="text-xs text-muted-foreground mt-1">All test submissions</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#33A9D9]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-[#33A9D9]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#33A9D9]">{stats.completedAttempts}</div>
              <p className="text-xs text-muted-foreground mt-1">Finished attempts</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.passRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Students passing</p>
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
            <CardTitle className="text-[#1C4E9C]">Filter Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by student or test..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={testFilter} onValueChange={setTestFilter}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests</SelectItem>
                  {testOptions.map((test) => (
                    <SelectItem key={test.id} value={test.id.toString()}>
                      {test.title}
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1C4E9C]">Test Results</CardTitle>
            <CardDescription>
              {filteredResults.length} results found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((attempt) => {
                    const grade = getGrade(attempt.score);
                    return (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{attempt.user?.username || "Unknown"}</div>
                            <div className="text-sm text-muted-foreground">{attempt.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{attempt.mockTest?.title || "Unknown Test"}</div>
                        </TableCell>
                        <TableCell>
                          {attempt.isCompleted ? (
                            <div className="flex items-center gap-2">
                              <Progress value={attempt.score || 0} className="w-20" />
                              <span className="font-medium">{attempt.score}%</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attempt.isCompleted ? (
                            <Badge className={getGradeColor(grade)}>
                              {grade}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attempt.timeSpent ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{Math.round(attempt.timeSpent / 60)} min</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={attempt.isCompleted 
                              ? "bg-green-500 hover:bg-green-600" 
                              : "bg-yellow-500 hover:bg-yellow-600"
                            }
                          >
                            {attempt.isCompleted ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(attempt.startedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(attempt)}
                            disabled={!attempt.isCompleted}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#1C4E9C]">Test Result Details</DialogTitle>
              <DialogDescription>
                Complete information about this test attempt
              </DialogDescription>
            </DialogHeader>
            {selectedAttempt && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student</p>
                    <p className="text-base font-semibold">{selectedAttempt.user?.username}</p>
                    <p className="text-sm text-muted-foreground">{selectedAttempt.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Test</p>
                    <p className="text-base font-semibold">{selectedAttempt.mockTest?.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedAttempt.mockTest?.testType}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold text-[#1C4E9C]">{selectedAttempt.score}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Grade</p>
                    <Badge className={`text-lg ${getGradeColor(getGrade(selectedAttempt.score))}`}>
                      {getGrade(selectedAttempt.score)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time Spent</p>
                    <p className="text-xl font-bold">
                      {selectedAttempt.timeSpent ? Math.round(selectedAttempt.timeSpent / 60) : 0} min
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Progress</p>
                  <Progress value={selectedAttempt.score || 0} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Started At</p>
                    <p className="text-base">{new Date(selectedAttempt.startedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                    <p className="text-base">
                      {selectedAttempt.completedAt 
                        ? new Date(selectedAttempt.completedAt).toLocaleString()
                        : "Not completed"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Test Details</p>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Duration:</span>
                      <span className="text-sm font-medium">{selectedAttempt.mockTest?.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Questions:</span>
                      <span className="text-sm font-medium">{selectedAttempt.mockTest?.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge className={selectedAttempt.isCompleted ? "bg-green-500" : "bg-yellow-500"}>
                        {selectedAttempt.isCompleted ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
