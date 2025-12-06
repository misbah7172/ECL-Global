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
  Eye,
  PlayCircle,
  Award
} from "lucide-react";
import { Course, Lecture } from "@/types/course";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

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
      <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            {/* Beautiful Pulsing Animation */}
            <div className="relative w-24 h-24 mb-8">
              {/* Outer ring - pulsing */}
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: COLORS.skyBlue }}
              />
              {/* Middle ring */}
              <div 
                className="absolute inset-2 rounded-full animate-pulse"
                style={{ backgroundColor: COLORS.midBlue }}
              />
              {/* Inner circle with icon */}
              <div 
                className="absolute inset-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.deepBlue }}
              >
                <BookOpen className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Loading Course
              </h3>
              <p style={{ color: COLORS.darkGrey }}>Preparing your learning experience...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto bg-white rounded-2xl p-12 shadow-lg">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${COLORS.skyBlue}20` }}
            >
              <BookOpen className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
            </div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>Course Not Found</h1>
            <p className="mb-6" style={{ color: COLORS.darkGrey }}>The course you're looking for doesn't exist.</p>
            <Button
              asChild
              className="text-white font-semibold"
              style={{ backgroundColor: COLORS.skyBlue }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
            >
              <a href="/courses">Browse All Courses</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      <Header />
      
      {/* Course Header */}
      <section 
        className="py-12 text-white"
        style={{
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 50%, ${COLORS.skyBlue} 100%)`
        }}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge 
                  className="text-white font-semibold px-3 py-1"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Free Preview Available
                </Badge>
                <Badge 
                  className="text-white font-semibold px-3 py-1"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  {course.difficulty}
                </Badge>
                <Badge 
                  className="text-white font-semibold px-3 py-1"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  {course.lectures?.length || 0} Lectures
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{course.title}</h1>
              <p className="text-lg text-blue-100 mb-5 leading-relaxed">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-300 text-yellow-300 mr-1" />
                  <span className="text-sm">({course.reviewCount || 0} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">{course.enrolledCount || 0} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{course.duration}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4 border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="mb-4 text-center">
                    <div className="flex items-baseline justify-center mb-1">
                      <span className="text-4xl font-bold" style={{ color: COLORS.deepBlue }}>৳{course.price}</span>
                      {course.originalPrice && (
                        <span className="text-gray-400 line-through ml-2 text-xl">৳{course.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {enrollment ? (
                    <div className="space-y-3">
                      <Button 
                        className="w-full h-12 text-white font-bold shadow-lg"
                        size="lg"
                        style={{ backgroundColor: COLORS.skyBlue }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Continue Learning
                      </Button>
                      <div className="text-center">
                        <Badge style={{ backgroundColor: '#10B981' }} className="text-white">Enrolled</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        className="w-full h-12 text-white font-bold shadow-lg" 
                        size="lg"
                        onClick={() => enrollMutation.mutate()}
                        disabled={enrollMutation.isPending}
                        style={{ backgroundColor: COLORS.skyBlue }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                      >
                        {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full h-12 font-semibold"
                        onClick={() => setSelectedLecture(0)}
                        style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview First Lecture
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="lectures" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white h-auto p-0 rounded-t-xl" style={{ borderBottom: `1px solid ${COLORS.offWhite}` }}>
                <TabsTrigger 
                  value="lectures" 
                  className="data-[state=active]:text-white data-[state=active]:shadow-none rounded-none font-semibold py-4"
                  style={{ 
                    borderBottom: '3px solid transparent',
                  }}
                  data-active-style={{ borderBottom: `3px solid ${COLORS.skyBlue}`, color: COLORS.deepBlue }}
                >
                  Lectures
                </TabsTrigger>
                <TabsTrigger 
                  value="overview"
                  className="data-[state=active]:text-white data-[state=active]:shadow-none rounded-none font-semibold py-4"
                  style={{ borderBottom: '3px solid transparent' }}
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="instructor"
                  className="data-[state=active]:text-white data-[state=active]:shadow-none rounded-none font-semibold py-4"
                  style={{ borderBottom: '3px solid transparent' }}
                >
                  Instructor
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews"
                  className="data-[state=active]:text-white data-[state=active]:shadow-none rounded-none font-semibold py-4"
                  style={{ borderBottom: '3px solid transparent' }}
                >
                  Reviews
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="lectures" className="bg-white rounded-b-xl p-8 shadow-lg mt-0">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>Course Content</h2>
                  <p className="mb-6" style={{ color: COLORS.darkGrey }}>
                    {course.lectures?.length || 0} lectures • First lecture is free
                  </p>
                  
                  <div className="space-y-3">
                    {course.lectures?.map((lecture, index) => (
                      <div 
                        key={lecture.id || index}
                        className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        style={{ backgroundColor: COLORS.offWhite }}
                        onClick={() => canAccessLecture(index) && setSelectedLecture(index)}
                      >
                        <div className="flex items-center flex-1">
                          {canAccessLecture(index) ? (
                            <PlayCircle className="h-5 w-5 mr-3" style={{ color: COLORS.skyBlue }} />
                          ) : (
                            <Lock className="h-5 w-5 mr-3" style={{ color: COLORS.darkGrey }} />
                          )}
                          <div>
                            <h3 className="font-semibold" style={{ color: COLORS.deepBlue }}>
                              Lecture {index + 1}  {lecture.title}
                            </h3>
                            {lecture.description && (
                              <p className="text-sm mt-1" style={{ color: COLORS.darkGrey }}>{lecture.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {index === 0 && (
                            <Badge 
                              className="text-white font-semibold"
                              style={{ backgroundColor: '#10B981' }}
                            >
                              Free
                            </Badge>
                          )}
                          <span className="text-sm" style={{ color: COLORS.darkGrey }}>{lecture.duration} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="overview" className="bg-white rounded-b-xl p-8 shadow-lg mt-0">
                <div className="space-y-6">
                  {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>What You'll Learn</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.whatYouWillLearn.map((item, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: COLORS.skyBlue }} />
                            <span style={{ color: COLORS.darkGrey }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {course.requirements && course.requirements.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>Requirements</h2>
                      <ul className="list-disc list-inside space-y-2">
                        {course.requirements.map((req, index) => (
                          <li key={index} style={{ color: COLORS.darkGrey }}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="instructor" className="bg-white rounded-b-xl p-8 shadow-lg mt-0">
                <div>
                  <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.deepBlue }}>About the Instructor</h2>
                  <div className="flex items-start">
                    <div 
                      className="h-20 w-20 rounded-full flex items-center justify-center mr-6 flex-shrink-0"
                      style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                    >
                      <User className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: COLORS.deepBlue }}>{course.instructor?.name}</h3>
                      <p style={{ color: COLORS.darkGrey }}>{course.instructor?.bio || 'Professional instructor with years of experience.'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="bg-white rounded-b-xl p-8 shadow-lg mt-0">
                <div>
                  <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.deepBlue }}>Student Reviews</h2>
                  <div className="text-center py-12">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                    >
                      <Star className="h-8 w-8" style={{ color: COLORS.skyBlue }} />
                    </div>
                    <p className="text-lg font-semibold mb-2" style={{ color: COLORS.deepBlue }}>
                      {course.rating}/5.0 Average Rating
                    </p>
                    <p style={{ color: COLORS.darkGrey }}>Based on {course.enrolledCount || 0} student reviews</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4" style={{ color: COLORS.deepBlue }}>Course Details</h3>
                <div className="space-y-4">
                  {[
                    { icon: Video, label: "Lectures", value: `${course.lectures?.length || 0} videos` },
                    { icon: Clock, label: "Duration", value: course.duration },
                    { icon: Users, label: "Enrolled", value: `${course.enrolledCount || 0} students` },
                    { icon: Star, label: "Rating", value: `${course.rating || 0}/5.0` },
                    { icon: Award, label: "Level", value: course.difficulty || 'Beginner' }
                  ].map((detail, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                        style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                      >
                        <detail.icon className="h-5 w-5" style={{ color: COLORS.skyBlue }} />
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: COLORS.darkGrey }}>{detail.label}</p>
                        <p className="font-semibold capitalize" style={{ color: COLORS.deepBlue }}>{detail.value}</p>
                      </div>
                    </div>
                  ))}
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
