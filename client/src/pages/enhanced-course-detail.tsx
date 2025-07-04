import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  CheckCircle, 
  User, 
  Play, 
  Lock, 
  Video,
  FileText,
  Download,
  Eye
} from "lucide-react";
import { Course, Lecture } from "@/types/course";

interface CourseWithLectures extends Course {
  lectures: Lecture[];
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  instructor: {
    name: string;
    avatar: string;
    bio: string;
  };
}

export default function EnhancedCourseDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [selectedLecture, setSelectedLecture] = useState<number>(0);

  const { data: course, isLoading } = useQuery({
    queryKey: ["/api/courses", id],
    queryFn: async (): Promise<CourseWithLectures> => {
      const response = await fetch(`/api/courses/${id}`);
      if (!response.ok) throw new Error("Course not found");
      return await response.json();
    },
  });

  const { data: enrollment } = useQuery({
    queryKey: ["/api/enrollments", id],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      const response = await fetch(`/api/enrollments/course/${id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const enrollMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/enrollments", { courseId: parseInt(id!) }),
    onSuccess: () => {
      toast({
        title: "Enrolled Successfully!",
        description: "You have been enrolled in this course.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const canAccessLecture = (lectureIndex: number) => {
    // First lecture is always free
    if (lectureIndex === 0) return true;
    // Other lectures require enrollment
    return !!enrollment;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600">The course you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Course Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                <Play className="h-3 w-3 mr-1" />
                Free Preview Available
              </Badge>
              <Badge variant="outline" className="text-xs">
                {course.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {course.lectures?.length || 0} Lectures
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-blue-100 mb-6">{course.description}</p>
            
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(course.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">({course.reviewCount || 0} reviews)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">{course.enrolledCount || 0} students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">{course.duration}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">৳{course.price}</div>
              {course.originalPrice && (
                <div className="text-lg text-blue-200 line-through">৳{course.originalPrice}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="lectures" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="lectures">Lectures</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="lectures" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <p className="text-sm text-gray-600">
                      {course.lectures?.length || 0} lectures • First lecture is free
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {course.lectures?.map((lecture, index) => (
                        <div 
                          key={lecture.id || index}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            canAccessLecture(index) 
                              ? 'hover:bg-gray-50 border-gray-200' 
                              : 'bg-gray-50 border-gray-100'
                          }`}
                          onClick={() => canAccessLecture(index) && setSelectedLecture(index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {canAccessLecture(index) ? (
                                  <Play className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium">
                                  Lecture {index + 1}
                                </span>
                              </div>
                              <h4 className="font-medium">{lecture.title}</h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              {index === 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Free
                                </Badge>
                              )}
                              <span className="text-sm text-gray-500">
                                {lecture.duration} min
                              </span>
                            </div>
                          </div>
                          {lecture.description && (
                            <p className="text-sm text-gray-600 mt-2 ml-9">
                              {lecture.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What You'll Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.whatYouWillLearn?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements?.map((req, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardHeader>
                    <CardTitle>About the Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <img 
                        src={course.instructor?.avatar || "/api/placeholder/80/80"} 
                        alt={course.instructor?.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{course.instructor?.name}</h3>
                        <p className="text-gray-600 mt-2">{course.instructor?.bio}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No reviews yet</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">৳{course.price}</div>
                    {course.originalPrice && (
                      <div className="text-lg text-gray-500 line-through">৳{course.originalPrice}</div>
                    )}
                  </div>
                  
                  {enrollment ? (
                    <div className="space-y-3">
                      <Button className="w-full" size="lg">
                        <Play className="h-5 w-5 mr-2" />
                        Continue Learning
                      </Button>
                      <div className="text-center">
                        <Badge variant="secondary">Enrolled</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => enrollMutation.mutate()}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedLecture(0)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview First Lecture
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Includes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Video className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{course.lectures?.length || 0} video lectures</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{course.duration} of content</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Download className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">Downloadable resources</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">Free preview lecture</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
