import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, BookOpen, CheckCircle, User } from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: course, isLoading } = useQuery({
    queryKey: ["/api/courses", id],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${id}`);
      if (!response.ok) throw new Error("Course not found");
      return response.json();
    },
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

  const courseData = course.course;
  const instructor = course.instructor;
  const category = course.category;

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Course Hero */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Badge variant="secondary">{category?.name}</Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{courseData.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{courseData.description}</p>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-yellow-400">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-gray-600 ml-1">{courseData.rating} rating</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-1" />
                  <span>{courseData.enrolledCount}+ students</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>{courseData.duration}</span>
                </div>
              </div>

              {instructor && (
                <div className="flex items-center p-4 bg-white rounded-lg border">
                  <User className="h-12 w-12 rounded-full bg-primary/10 text-primary p-2 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {instructor.firstName} {instructor.lastName}
                    </h3>
                    <p className="text-gray-600">Course Instructor</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-baseline mb-2">
                      <span className="text-3xl font-bold text-gray-900">৳{courseData.price}</span>
                      {courseData.originalPrice && (
                        <span className="text-gray-500 line-through ml-2">৳{courseData.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">One-time payment</p>
                  </div>

                  <Button 
                    className="w-full mb-4" 
                    size="lg"
                    onClick={() => enrollMutation.mutate()}
                    disabled={!isAuthenticated || enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600 text-center">
                      Please <a href="/login" className="text-primary hover:underline">login</a> to enroll
                    </p>
                  )}

                  <div className="space-y-4 mt-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm">Lifetime access</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm">Certificate of completion</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm">30-day money-back guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {/* Course Objectives */}
                {courseData.objectives && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Objectives</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-600">{courseData.objectives}</p>
                    </div>
                  </div>
                )}

                {/* Syllabus */}
                {courseData.syllabus && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Syllabus</h2>
                    <div className="space-y-3">
                      {courseData.syllabus.map((item: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <BookOpen className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <span className="text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Details */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Duration</h3>
                        <p className="text-gray-600">{courseData.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <BookOpen className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Format</h3>
                        <p className="text-gray-600 capitalize">{courseData.format}</p>
                      </div>
                    </div>
                    {courseData.totalSessions && (
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <Users className="h-8 w-8 text-primary mr-4" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Sessions</h3>
                          <p className="text-gray-600">{courseData.totalSessions} sessions</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <Star className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Level</h3>
                        <p className="text-gray-600">All levels</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Course Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Students enrolled</span>
                        <span className="font-medium">{courseData.enrolledCount}+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average rating</span>
                        <span className="font-medium">{courseData.rating}/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Course format</span>
                        <span className="font-medium capitalize">{courseData.format}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Courses */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Related Courses</h3>
                    <p className="text-gray-600 text-sm">
                      Explore other courses in the {category?.name} category
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
