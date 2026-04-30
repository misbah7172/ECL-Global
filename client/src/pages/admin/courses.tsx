import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import AdminLayout from "@/components/admin/admin-layout";
import { LectureManager } from "@/components/admin/lecture-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, CourseFormData } from "@/types/course";
import { Plus, Edit, Eye, Search, BookOpen, Video, Play, Users, TrendingUp, Star, GraduationCap, Trophy, CheckCircle2, Clock, Trash2 } from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
  gold: '#FFD700',
  red: '#EF4444',
};

export default function AdminCourses() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses", { search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      
      const url = `/api/courses${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      return response.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      return response.json();
    },
  });

  const { data: instructors } = useQuery({
    queryKey: ["/api/instructors"],
    queryFn: async () => {
      const response = await fetch("/api/instructors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch instructors");
      return response.json();
    },
  });

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      objectives: "",
      categoryId: "",
      instructorId: "",
      price: "",
      originalPrice: "",
      duration: "",
      format: "",
      totalSessions: "",
      syllabus: "",
      lectures: [],
      thumbnail: "",
      featured: false,
      difficulty: "Beginner",
      prerequisites: "",
      whatYouWillLearn: [],
      requirements: [],
    },
  });

  // Reset form when dialog closes
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCourse(null);
      form.reset({
        title: "",
        description: "",
        objectives: "",
        categoryId: "",
        instructorId: "",
        price: "",
        originalPrice: "",
        duration: "",
        format: "",
        totalSessions: "",
        syllabus: "",
        lectures: [],
        thumbnail: "",
        featured: false,
        difficulty: "Beginner",
        prerequisites: "",
        whatYouWillLearn: [],
        requirements: [],
      });
    }
  };

  // Reset form when editing a course
  const handleEditCourse = (course: any) => {
    const normalizedLectures = Array.isArray(course.lectures)
      ? course.lectures.map((lecture: any, index: number) => ({
          id: lecture.id,
          title: (lecture.title || `Lecture ${index + 1}`).toString(),
          description: (lecture.description || "").toString(),
          duration: Math.max(1, Number.parseInt(String(lecture.duration), 10) || 0),
          videoUrl: (lecture.videoUrl || "").toString(),
          content: (lecture.content || "").toString(),
          order: Math.max(1, Number.parseInt(String(lecture.order), 10) || index + 1),
          isFree: Boolean(lecture.isFree) || index === 0,
          materials: Array.isArray(lecture.materials) ? lecture.materials : [],
        }))
      : [];

    setEditingCourse(course);
    form.reset({
      title: course.title || "",
      description: course.description || "",
      objectives: course.objectives || "",
      categoryId: course.categoryId?.toString() || "",
      instructorId: course.instructorId?.toString() || "",
      price: course.price?.toString() || "",
      originalPrice: course.originalPrice?.toString() || "",
      duration: course.duration || "",
      format: course.format || "",
      totalSessions: course.totalSessions?.toString() || "",
      syllabus: Array.isArray(course.syllabus) ? course.syllabus.join('\n') : "",
      lectures: normalizedLectures,
      thumbnail: course.imageUrl || "",
      featured: course.isFeatured || false,
      difficulty: course.difficulty || "Beginner",
      prerequisites: course.prerequisites || "",
      whatYouWillLearn: course.whatYouWillLearn || [],
      requirements: course.requirements || [],
    });
    setIsDialogOpen(true);
  };

  const createCourseMutation = useMutation({
    mutationFn: async ({ data, courseId }: { data: any; courseId?: number }) => {
      const response = courseId 
        ? await apiRequest("PUT", `/api/courses/${courseId}`, data)
        : await apiRequest("POST", "/api/courses", data);
      return response.json();
    },
    onSuccess: (response, variables) => {
      console.log('Course save success:', response);
      toast({
        title: variables.courseId ? "Course Updated" : "Course Created",
        description: variables.courseId 
          ? "Course has been updated successfully."
          : "New course has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsDialogOpen(false);
      setEditingCourse(null);
      form.reset();
    },
    onError: (error: any, variables) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${variables.courseId ? 'update' : 'create'} course`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId: number) => 
      apiRequest("DELETE", `/api/courses/${courseId}`),
    onSuccess: () => {
      toast({
        title: "Course Deleted",
        description: "Course has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCourse = (courseId: number, courseTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      deleteMutation.mutate(courseId);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      console.log('=== FORM SUBMIT STARTED ===');
      console.log('Form data:', data);
      console.log('Editing course:', editingCourse);
      console.log('Is editing:', !!editingCourse);
      
      // Transform lectures data to ensure proper types
      const transformedLectures = (data.lectures || []).map((lecture: any, index: number) => ({
        title: (lecture.title || `Lecture ${index + 1}`).toString().trim(),
        description: lecture.description || '',
        duration: Math.max(1, typeof lecture.duration === 'number' ? lecture.duration : parseInt(lecture.duration) || 0),
        videoUrl: lecture.videoUrl || '',
        content: lecture.content || '',
        order: Math.max(1, lecture.order || index + 1),
        isFree: lecture.isFree || false,
        materials: lecture.materials || [],
      }));
      
      const courseData = {
        title: data.title,
        description: data.description,
        objectives: data.objectives || '',
        categoryId: parseInt(data.categoryId),
        instructorId: parseInt(data.instructorId),
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        duration: data.duration,
        format: data.format,
        totalSessions: data.totalSessions ? parseInt(data.totalSessions) : 0,
        syllabus: data.syllabus ? data.syllabus.split('\n').filter(item => item.trim()) : [],
        lectures: transformedLectures,
        imageUrl: data.thumbnail || null,
        isFeatured: data.featured || false,
        difficulty: data.difficulty || 'Beginner',
        prerequisites: data.prerequisites || '',
        whatYouWillLearn: data.whatYouWillLearn || [],
        requirements: data.requirements || [],
      };
      
      console.log('Submitting course data:', courseData);
      console.log('Course ID for update:', editingCourse?.id);
      
      await createCourseMutation.mutateAsync({ 
        data: courseData, 
        courseId: editingCourse?.id 
      });
      
      console.log('=== FORM SUBMIT COMPLETED ===');
    } catch (error) {
      console.error('=== FORM SUBMIT ERROR ===', error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Course Management">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: COLORS.skyBlue }} />
            <div className="absolute inset-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.midBlue }} />
            <div className="absolute inset-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.deepBlue }}>
              <BookOpen className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Filter courses
  const filteredCourses = courses?.filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                         course.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout title="Course Management">
      <div className="space-y-8">
        {/* Hero Section */}
        <div 
          className="relative rounded-2xl p-8 md:p-12 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 100%)`
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <Badge className="mb-4 bg-white/20 text-white border-0 px-4 py-1">
                <Trophy className="h-3 w-3 mr-1" />
                Admin Dashboard
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Course Management</h1>
              <p className="text-white/90 text-lg">Create, edit, and manage all platform courses with ease</p>
            </div>
            <div className="hidden md:flex w-20 h-20 rounded-full items-center justify-center" 
                 style={{ backgroundColor: COLORS.red }}>
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 hover:shadow-xl transition-all hover:scale-105" style={{ backgroundColor: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Total Courses</p>
                  <p className="text-3xl font-bold" style={{ color: COLORS.deepBlue }}>
                    {courses?.length || 0}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" 
                     style={{ backgroundColor: COLORS.deepBlue }}>
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 hover:shadow-xl transition-all hover:scale-105" style={{ backgroundColor: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Active Courses</p>
                  <p className="text-3xl font-bold" style={{ color: COLORS.skyBlue }}>
                    {courses?.filter((c: any) => c.isActive).length || 0}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" 
                     style={{ backgroundColor: COLORS.skyBlue }}>
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 hover:shadow-xl transition-all hover:scale-105" style={{ backgroundColor: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Total Enrollments</p>
                  <p className="text-3xl font-bold" style={{ color: COLORS.red }}>
                    {courses?.reduce((sum: number, c: any) => sum + (c.enrolledCount || 0), 0) || 0}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" 
                     style={{ backgroundColor: COLORS.red }}>
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 hover:shadow-xl transition-all hover:scale-105" style={{ backgroundColor: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Avg Rating</p>
                  <p className="text-3xl font-bold" style={{ color: COLORS.gold }}>
                    {courses?.length > 0 
                      ? (courses.reduce((sum: number, c: any) => sum + parseFloat(c.rating || 0), 0) / courses.length).toFixed(1)
                      : '0.0'}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" 
                     style={{ backgroundColor: COLORS.gold }}>
                  <Star className="h-7 w-7 text-white fill-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search courses by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Dialog 
            open={isDialogOpen} 
            onOpenChange={handleDialogChange}
          >
            <DialogTrigger asChild>
              <Button 
                size="lg"
                style={{ backgroundColor: COLORS.red }}
                className="text-white hover:opacity-90 font-semibold shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Course
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle style={{ color: COLORS.deepBlue }}>
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.log('=== FORM VALIDATION FAILED ===');
                    console.log('Validation errors:', errors);
                  })} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter course title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter course description"
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.map((category: any) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instructorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructor</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select instructor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {instructors?.map((instructor: any) => (
                                  <SelectItem 
                                    key={instructor.id} 
                                    value={instructor.id.toString()}
                                  >
                                    {instructor.firstName} {instructor.lastName} ({instructor.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (৳)</FormLabel>
                            <FormControl>
                              <Input placeholder="15000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price (৳)</FormLabel>
                            <FormControl>
                              <Input placeholder="20000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="8 weeks" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Format</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="in-person">In-Person</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="totalSessions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Sessions</FormLabel>
                            <FormControl>
                              <Input placeholder="12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="objectives"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Learning Objectives</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter course objectives"
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="syllabus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Syllabus (one item per line)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Module 1: Introduction&#10;Module 2: Fundamentals&#10;Module 3: Advanced Topics"
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="thumbnail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty Level</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Featured Course
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Display this course in the featured section
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Lecture Manager */}
                    <div className="border-t pt-6">
                      <LectureManager control={form.control} />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          console.log('Cancel button clicked');
                          handleDialogChange(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createCourseMutation.isPending}
                        onClick={() => {
                          console.log('=== UPDATE BUTTON CLICKED ===');
                          console.log('Form state:', form.formState);
                          console.log('Form errors:', form.formState.errors);
                          console.log('Form values:', form.getValues());
                          console.log('Is valid:', form.formState.isValid);
                          console.log('Mutation pending:', createCourseMutation.isPending);
                        }}
                        style={{ backgroundColor: COLORS.red }}
                        className="text-white hover:opacity-90 font-semibold"
                      >
                        {createCourseMutation.isPending 
                          ? (editingCourse ? "Updating..." : "Creating...") 
                          : (editingCourse ? "Update Course" : "Create Course")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses && filteredCourses.length > 0 ? (
            filteredCourses.map((course: any) => (
              <Card 
                key={course.id}
                className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
                style={{ backgroundColor: 'white' }}
              >
                <CardContent className="p-0">
                  {/* Course Image/Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {course.imageUrl ? (
                      <img 
                        src={course.imageUrl} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                           style={{ background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.skyBlue} 100%)` }}>
                        <BookOpen className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    {course.isFeatured && (
                      <Badge 
                        className="absolute top-3 left-3 text-white font-semibold"
                        style={{ backgroundColor: COLORS.red }}
                      >
                        <Trophy className="h-3 w-3 mr-1" />
                        FEATURED
                      </Badge>
                    )}
                    <Badge 
                      className="absolute top-3 right-3 font-semibold"
                      variant={course.isActive ? "default" : "secondary"}
                      style={course.isActive ? { backgroundColor: '#00C49F', color: 'white' } : {}}
                    >
                      {course.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {course.isFree && (
                      <Badge 
                        className="absolute bottom-3 left-3 font-semibold text-white"
                        style={{ backgroundColor: COLORS.gold }}
                      >
                        FREE COURSE
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Course Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                              >
                                {course.category?.name || 'Uncategorized'}
                              </Badge>
                            </div>
                            <h3 
                              className="text-2xl font-bold mb-2"
                              style={{ color: COLORS.deepBlue }}
                            >
                              {course.title}
                            </h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                          </div>
                        </div>
                      
                      {/* Course Stats Grid */}
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: COLORS.offWhite }}>
                          <p className="font-bold text-xl" style={{ color: COLORS.deepBlue }}>
                            ৳{parseFloat(course.price).toLocaleString()}
                          </p>
                          <span className="text-xs text-gray-500">Price</span>
                          {course.originalPrice && parseFloat(course.originalPrice) > parseFloat(course.price) && (
                            <p className="text-xs text-gray-400 line-through mt-1">
                              ৳{parseFloat(course.originalPrice).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: COLORS.offWhite }}>
                          <div className="flex items-center justify-center mb-1">
                            <Clock className="h-4 w-4" style={{ color: COLORS.skyBlue }} />
                          </div>
                          <p className="font-semibold text-sm">{course.duration}</p>
                          <span className="text-xs text-gray-500">Duration</span>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: COLORS.offWhite }}>
                          <p className="font-semibold text-sm capitalize">{course.format}</p>
                          <span className="text-xs text-gray-500">Format</span>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: COLORS.offWhite }}>
                          <p className="font-semibold text-sm">{course.difficulty}</p>
                          <span className="text-xs text-gray-500">Level</span>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: COLORS.offWhite }}>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Video className="h-4 w-4" style={{ color: COLORS.red }} />
                            <p className="font-bold text-lg">{course.lectures?.length || 0}</p>
                          </div>
                          <span className="text-xs text-gray-500">Lectures</span>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: COLORS.offWhite }}>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Users className="h-4 w-4" style={{ color: COLORS.midBlue }} />
                            <p className="font-bold text-lg">{course.enrolledCount || 0}</p>
                          </div>
                          <span className="text-xs text-gray-500">Enrolled</span>
                        </div>
                      </div>

                      {/* Course Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Instructor</span>
                          <p className="font-medium">
                            {course.instructor 
                              ? `${course.instructor.firstName} ${course.instructor.lastName}`
                              : 'Not assigned'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Rating</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">
                              {parseFloat(course.rating || 0).toFixed(1)} / 5.0
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Free Preview Badge */}
                      {course.lectures && course.lectures.length > 0 && course.lectures.some((l: any) => l.isFree) && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              <Play className="h-3 w-3 mr-1" />
                              Free Preview Available
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {course.lectures.filter((l: any) => l.isFree).length} free lecture(s)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button 
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                        className="text-white font-semibold"
                        style={{ backgroundColor: COLORS.deepBlue }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/courses/${course.id}`, '_blank')}
                        className="border-2"
                        style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="border-2 hover:bg-red-50"
                        style={{ borderColor: COLORS.red, color: COLORS.red }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16">
              <div 
                className="w-24 h-24 rounded-xl mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: COLORS.offWhite }}
              >
                <BookOpen className="h-12 w-12" style={{ color: COLORS.deepBlue }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                No courses found
              </h3>
              <p className="text-gray-600 mb-6">
                {search || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first course to get started"}
              </p>
              {!search && selectedCategory === "all" && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  style={{ backgroundColor: COLORS.red }}
                  className="text-white hover:opacity-90 font-semibold"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Course
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
