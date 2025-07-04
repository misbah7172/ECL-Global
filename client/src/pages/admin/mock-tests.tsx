import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Filter, FileText, Clock, Users, BarChart, Download, Eye, Copy } from "lucide-react";

interface MockTest {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  isActive: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export default function AdminMockTests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    duration: 60,
    totalQuestions: 10,
    totalMarks: 100,
    passingMarks: 50,
    difficulty: "medium" as 'easy' | 'medium' | 'hard',
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data: mockTests, isLoading } = useQuery({
    queryKey: ['/api/admin/mock-tests'],
    queryFn: async () => {
      // Mock data - in real app, this would fetch from API
      const mockData: MockTest[] = [
        {
          id: 1,
          title: "JavaScript Fundamentals",
          description: "Test your knowledge of JavaScript basics including variables, functions, and data types",
          categoryId: 1,
          categoryName: "Web Development",
          duration: 60,
          totalQuestions: 20,
          totalMarks: 100,
          passingMarks: 60,
          isActive: true,
          difficulty: 'medium',
          attempts: 245,
          averageScore: 72.5,
          createdAt: "2024-01-10T10:00:00Z",
          updatedAt: "2024-01-15T14:30:00Z",
        },
        {
          id: 2,
          title: "Python Data Structures",
          description: "Comprehensive test on Python lists, dictionaries, sets, and tuples",
          categoryId: 2,
          categoryName: "Data Science",
          duration: 90,
          totalQuestions: 30,
          totalMarks: 150,
          passingMarks: 90,
          isActive: true,
          difficulty: 'hard',
          attempts: 189,
          averageScore: 68.2,
          createdAt: "2024-01-05T09:00:00Z",
          updatedAt: "2024-01-12T16:45:00Z",
        },
        {
          id: 3,
          title: "React Components Basics",
          description: "Test your understanding of React components, props, and state management",
          categoryId: 1,
          categoryName: "Web Development",
          duration: 45,
          totalQuestions: 15,
          totalMarks: 75,
          passingMarks: 45,
          isActive: false,
          difficulty: 'easy',
          attempts: 67,
          averageScore: 58.3,
          createdAt: "2024-01-08T11:00:00Z",
          updatedAt: "2024-01-20T13:15:00Z",
        },
      ];
      return mockData;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      return [
        { id: 1, name: "Web Development" },
        { id: 2, name: "Data Science" },
        { id: 3, name: "Mobile Development" },
      ];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/admin/mock-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create mock test');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mock-tests'] });
      toast({ title: "Success", description: "Mock test created successfully" });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create mock test", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await fetch(`/api/admin/mock-tests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update mock test');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mock-tests'] });
      toast({ title: "Success", description: "Mock test updated successfully" });
      setIsEditModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update mock test", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/mock-tests/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete mock test');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mock-tests'] });
      toast({ title: "Success", description: "Mock test deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete mock test", variant: "destructive" });
    },
  });

  const filteredTests = mockTests?.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || test.categoryName === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || test.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && test.isActive) ||
                         (statusFilter === "inactive" && !test.isActive);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      categoryId: "",
      duration: 60,
      totalQuestions: 10,
      totalMarks: 100,
      passingMarks: 50,
      difficulty: "medium",
      isActive: true,
    });
    setSelectedTest(null);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
    resetForm();
  };

  const handleEdit = (test: MockTest) => {
    setSelectedTest(test);
    setFormData({
      title: test.title,
      description: test.description,
      categoryId: test.categoryId.toString(),
      duration: test.duration,
      totalQuestions: test.totalQuestions,
      totalMarks: test.totalMarks,
      passingMarks: test.passingMarks,
      difficulty: test.difficulty,
      isActive: test.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTest) {
      updateMutation.mutate({ id: selectedTest.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this mock test?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (test: MockTest) => {
    setFormData({
      title: `${test.title} (Copy)`,
      description: test.description,
      categoryId: test.categoryId.toString(),
      duration: test.duration,
      totalQuestions: test.totalQuestions,
      totalMarks: test.totalMarks,
      passingMarks: test.passingMarks,
      difficulty: test.difficulty,
      isActive: false,
    });
    setIsCreateModalOpen(true);
  };

  const exportTests = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Category,Duration,Questions,Total Marks,Passing Marks,Difficulty,Active,Attempts,Average Score\n" +
      filteredTests?.map(test => 
        `"${test.title}","${test.categoryName}",${test.duration},${test.totalQuestions},${test.totalMarks},${test.passingMarks},${test.difficulty},${test.isActive},${test.attempts},${test.averageScore}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mock_tests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Mock Tests Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockTests?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {mockTests?.filter(t => t.isActive).length || 0} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockTests?.reduce((sum, test) => sum + test.attempts, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockTests?.length ? 
                  (mockTests.reduce((sum, test) => sum + test.averageScore, 0) / mockTests.length).toFixed(1) : 
                  0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall average
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockTests?.length ? 
                  Math.round(mockTests.reduce((sum, test) => sum + test.duration, 0) / mockTests.length) : 
                  0} min
              </div>
              <p className="text-xs text-muted-foreground">
                Per test
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Mock Tests</CardTitle>
                <CardDescription>
                  Manage mock tests and assessments for your courses
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportTests} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test
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
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tests Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredTests?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        No mock tests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTests?.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{test.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {test.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{test.categoryName}</TableCell>
                        <TableCell>{test.duration} min</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{test.totalQuestions} questions</div>
                            <div className="text-muted-foreground">
                              {test.totalMarks} marks
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={difficultyColors[test.difficulty]}>
                            {test.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>{test.attempts}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            test.averageScore >= 80 ? 'text-green-600' :
                            test.averageScore >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {test.averageScore.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={test.isActive ? "default" : "secondary"}>
                            {test.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(test)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDuplicate(test)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(test.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* Create/Edit Modal */}
        <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTest ? "Edit Mock Test" : "Create Mock Test"}
              </DialogTitle>
              <DialogDescription>
                {selectedTest ? "Update the mock test details" : "Create a new mock test for your course"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalQuestions">Total Questions</Label>
                  <Input
                    id="totalQuestions"
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passingMarks">Passing Marks</Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                    min="1"
                    max={formData.totalMarks}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Test"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
