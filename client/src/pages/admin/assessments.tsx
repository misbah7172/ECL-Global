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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Filter, ClipboardList, Clock, Users, BarChart, Download, Eye, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Assessment {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseName: string;
  instructorId: number;
  instructorName: string;
  assessmentType: 'assignment' | 'quiz' | 'project' | 'exam';
  dueDate: string;
  totalMarks: number;
  passingMarks: number;
  duration?: number; // in minutes, optional for assignments/projects
  isActive: boolean;
  isPublished: boolean;
  submissions: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

const assessmentTypeColors = {
  assignment: 'bg-blue-100 text-blue-800',
  quiz: 'bg-green-100 text-green-800',
  project: 'bg-purple-100 text-purple-800',
  exam: 'bg-red-100 text-red-800',
};

export default function AdminAssessments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    instructorId: "",
    assessmentType: "assignment" as 'assignment' | 'quiz' | 'project' | 'exam',
    totalMarks: 100,
    passingMarks: 50,
    duration: undefined as number | undefined,
    isActive: true,
    isPublished: false,
  });

  const queryClient = useQueryClient();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['/api/admin/assessments'],
    queryFn: async () => {
      // Mock data - in real app, this would fetch from API
      const mockData: Assessment[] = [
        {
          id: 1,
          title: "Web Development Project",
          description: "Build a complete e-commerce website using React and Node.js",
          courseId: 1,
          courseName: "Full Stack Web Development",
          instructorId: 1,
          instructorName: "Sarah Johnson",
          assessmentType: 'project',
          dueDate: "2024-02-15T23:59:59Z",
          totalMarks: 200,
          passingMarks: 120,
          duration: undefined,
          isActive: true,
          isPublished: true,
          submissions: 45,
          averageScore: 156.8,
          createdAt: "2024-01-10T10:00:00Z",
          updatedAt: "2024-01-15T14:30:00Z",
        },
        {
          id: 2,
          title: "JavaScript Fundamentals Quiz",
          description: "Test your knowledge of JavaScript variables, functions, and data structures",
          courseId: 1,
          courseName: "Full Stack Web Development",
          instructorId: 1,
          instructorName: "Sarah Johnson",
          assessmentType: 'quiz',
          dueDate: "2024-01-25T15:00:00Z",
          totalMarks: 50,
          passingMarks: 30,
          duration: 45,
          isActive: true,
          isPublished: true,
          submissions: 52,
          averageScore: 38.2,
          createdAt: "2024-01-05T09:00:00Z",
          updatedAt: "2024-01-12T16:45:00Z",
        },
        {
          id: 3,
          title: "Data Analysis Assignment",
          description: "Analyze the given dataset and create visualizations using Python",
          courseId: 2,
          courseName: "Data Science Bootcamp",
          instructorId: 2,
          instructorName: "Mike Chen",
          assessmentType: 'assignment',
          dueDate: "2024-02-01T23:59:59Z",
          totalMarks: 100,
          passingMarks: 60,
          duration: undefined,
          isActive: true,
          isPublished: false,
          submissions: 0,
          averageScore: 0,
          createdAt: "2024-01-20T11:00:00Z",
          updatedAt: "2024-01-20T11:00:00Z",
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

  const { data: instructors } = useQuery({
    queryKey: ['/api/instructors'],
    queryFn: async () => {
      return [
        { id: 1, name: "Sarah Johnson" },
        { id: 2, name: "Mike Chen" },
        { id: 3, name: "Jennifer Davis" },
      ];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { dueDate: string }) => {
      const response = await fetch('/api/admin/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create assessment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/assessments'] });
      toast({ title: "Success", description: "Assessment created successfully" });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create assessment", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData & { dueDate: string } }) => {
      const response = await fetch(`/api/admin/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update assessment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/assessments'] });
      toast({ title: "Success", description: "Assessment updated successfully" });
      setIsEditModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update assessment", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/assessments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete assessment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/assessments'] });
      toast({ title: "Success", description: "Assessment deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete assessment", variant: "destructive" });
    },
  });

  const filteredAssessments = assessments?.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === "all" || assessment.courseName === courseFilter;
    const matchesType = typeFilter === "all" || assessment.assessmentType === typeFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && assessment.isPublished) ||
                         (statusFilter === "draft" && !assessment.isPublished) ||
                         (statusFilter === "active" && assessment.isActive) ||
                         (statusFilter === "inactive" && !assessment.isActive);
    
    return matchesSearch && matchesCourse && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      courseId: "",
      instructorId: "",
      assessmentType: "assignment",
      totalMarks: 100,
      passingMarks: 50,
      duration: undefined,
      isActive: true,
      isPublished: false,
    });
    setDueDate(undefined);
    setSelectedAssessment(null);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
    resetForm();
  };

  const handleEdit = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setFormData({
      title: assessment.title,
      description: assessment.description,
      courseId: assessment.courseId.toString(),
      instructorId: assessment.instructorId.toString(),
      assessmentType: assessment.assessmentType,
      totalMarks: assessment.totalMarks,
      passingMarks: assessment.passingMarks,
      duration: assessment.duration,
      isActive: assessment.isActive,
      isPublished: assessment.isPublished,
    });
    setDueDate(new Date(assessment.dueDate));
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) {
      toast({ title: "Error", description: "Please select a due date", variant: "destructive" });
      return;
    }
    
    const submissionData = {
      ...formData,
      dueDate: dueDate.toISOString(),
    };
    
    if (selectedAssessment) {
      updateMutation.mutate({ id: selectedAssessment.id, data: submissionData });
    } else {
      createMutation.mutate(submissionData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this assessment?")) {
      deleteMutation.mutate(id);
    }
  };

  const exportAssessments = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Course,Instructor,Type,Due Date,Total Marks,Passing Marks,Duration,Status,Submissions,Average Score\n" +
      filteredAssessments?.map(assessment => 
        `"${assessment.title}","${assessment.courseName}","${assessment.instructorName}",${assessment.assessmentType},"${assessment.dueDate}",${assessment.totalMarks},${assessment.passingMarks},${assessment.duration || 'N/A'},${assessment.isPublished ? 'Published' : 'Draft'},${assessment.submissions},${assessment.averageScore}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "assessments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Assessments Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {assessments?.filter(a => a.isPublished).length || 0} published
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessments?.reduce((sum, assessment) => sum + assessment.submissions, 0) || 0}
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
                {assessments?.length ? 
                  (assessments
                    .filter(a => a.submissions > 0)
                    .reduce((sum, assessment) => sum + (assessment.averageScore / assessment.totalMarks * 100), 0) / 
                    assessments.filter(a => a.submissions > 0).length || 0
                  ).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall average
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessments?.filter(a => {
                  const dueDate = new Date(a.dueDate);
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  return dueDate <= nextWeek && dueDate >= new Date();
                }).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Upcoming deadlines
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>
                  Manage assessments, assignments, and exams for your courses
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportAssessments} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assessment
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
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[200px]">
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assessments Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Submissions</TableHead>
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
                  ) : filteredAssessments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        No assessments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssessments?.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{assessment.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {assessment.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{assessment.courseName}</TableCell>
                        <TableCell>{assessment.instructorName}</TableCell>
                        <TableCell>
                          <Badge className={assessmentTypeColors[assessment.assessmentType]}>
                            {assessment.assessmentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(assessment.dueDate), 'MMM dd, yyyy')}
                            <div className="text-muted-foreground">
                              {format(new Date(assessment.dueDate), 'hh:mm a')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Total: {assessment.totalMarks}</div>
                            <div className="text-muted-foreground">
                              Pass: {assessment.passingMarks}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{assessment.submissions}</div>
                            {assessment.submissions > 0 && (
                              <div className="text-muted-foreground">
                                Avg: {assessment.averageScore.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={assessment.isPublished ? "default" : "secondary"}>
                              {assessment.isPublished ? "Published" : "Draft"}
                            </Badge>
                            {assessment.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(assessment)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(assessment.id)}
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
                {selectedAssessment ? "Edit Assessment" : "Create Assessment"}
              </DialogTitle>
              <DialogDescription>
                {selectedAssessment ? "Update the assessment details" : "Create a new assessment for your course"}
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
                  <Label htmlFor="assessmentType">Type</Label>
                  <Select value={formData.assessmentType} onValueChange={(value: 'assignment' | 'quiz' | 'project' | 'exam') => setFormData({ ...formData, assessmentType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map(course => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select value={formData.instructorId} onValueChange={(value) => setFormData({ ...formData, instructorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors?.map(instructor => (
                        <SelectItem key={instructor.id} value={instructor.id.toString()}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : undefined })}
                    min="1"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : 'Select due date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                </div>
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
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Assessment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
