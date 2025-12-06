import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, BookOpen, CheckCircle, User, Award, TrendingUp, Target, ChevronRight, Download, Share2, PlayCircle, Eye } from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

export default function CourseDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('lectures');

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
      <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div 
              className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full" 
              style={{ borderColor: COLORS.skyBlue, borderTopColor: 'transparent' }}
            />
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

  const courseData = course.course;
  const instructor = course.instructor;
  const category = course.category;

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      <Header />
      
      {/* Course Hero */}
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
                {courseData.isFree && (
                  <Badge 
                    className="text-white font-semibold px-3 py-1"
                    style={{ backgroundColor: '#10B981' }}
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Free Preview Available
                  </Badge>
                )}
                <Badge 
                  className="text-white font-semibold px-3 py-1"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  {courseData.difficulty || 'Beginner'}
                </Badge>
                {courseData.lectures && courseData.lectures.length > 0 && (
                  <Badge 
                    className="text-white font-semibold px-3 py-1"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                  >
                    {courseData.lectures.length} Lecture{courseData.lectures.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{courseData.title}</h1>
              <p className="text-lg text-blue-100 mb-5 leading-relaxed">{courseData.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-300 text-yellow-300 mr-1" />
                  <span className="text-sm">({courseData.rating} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">{courseData.enrolledCount} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{courseData.duration}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4 border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="mb-4 text-center">
                    <div className="flex items-baseline justify-center mb-1">
                      <span className="text-4xl font-bold" style={{ color: COLORS.deepBlue }}>৳{courseData.price || 654}</span>
                      {courseData.originalPrice && (
                        <span className="text-gray-400 line-through ml-2 text-xl">৳{courseData.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full mb-3 h-12 text-white font-bold shadow-lg" 
                    size="lg"
                    onClick={() => enrollMutation.mutate()}
                    disabled={!isAuthenticated || enrollMutation.isPending}
                    style={{ backgroundColor: COLORS.skyBlue }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                  >
                    {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                  </Button>

                  {courseData.lectures && courseData.lectures.some((l: any) => l.isFree) && (
                    <Button 
                      variant="outline" 
                      className="w-full mb-3 h-12 font-semibold"
                      style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview First Lecture
                    </Button>
                  )}

                  {!isAuthenticated && (
                    <p className="text-sm text-center" style={{ color: COLORS.darkGrey }}>
                      Please <a href="/login" className="font-semibold" style={{ color: COLORS.skyBlue }}>login</a> to enroll
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Tabs Navigation */}
              <div className="bg-white rounded-t-xl border-b" style={{ borderColor: COLORS.offWhite }}>
                <div className="flex">
                  {['lectures', 'overview', 'instructor', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="px-6 py-4 font-semibold capitalize transition-all"
                      style={{
                        color: activeTab === tab ? COLORS.deepBlue : COLORS.darkGrey,
                        borderBottom: activeTab === tab ? `3px solid ${COLORS.skyBlue}` : '3px solid transparent',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-b-xl p-8 shadow-lg">
                {activeTab === 'lectures' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>Course Content</h2>
                    <p className="mb-6" style={{ color: COLORS.darkGrey }}>
                      {courseData.lectures?.length || 1} lectures • First lecture is free
                    </p>
                    
                    <div className="space-y-3">
                      {courseData.lectures && courseData.lectures.length > 0 ? (
                        courseData.lectures.map((lecture: any, index: number) => (
                          <div 
                            key={lecture.id || index}
                            className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            style={{ backgroundColor: COLORS.offWhite }}
                          >
                            <div className="flex items-center flex-1">
                              <PlayCircle className="h-5 w-5 mr-3" style={{ color: COLORS.skyBlue }} />
                              <div>
                                <h3 className="font-semibold" style={{ color: COLORS.deepBlue }}>
                                  Lecture {lecture.order || index + 1}  {lecture.title}
                                </h3>
                                {lecture.description && (
                                  <p className="text-sm mt-1" style={{ color: COLORS.darkGrey }}>{lecture.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {lecture.isFree && (
                                <Badge 
                                  className="text-white font-semibold"
                                  style={{ backgroundColor: '#10B981' }}
                                >
                                  Free
                                </Badge>
                              )}
                              <span className="text-sm" style={{ color: COLORS.darkGrey }}>{lecture.duration || 100} min</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div 
                          className="flex items-center justify-between p-4 rounded-lg"
                          style={{ backgroundColor: COLORS.offWhite }}
                        >
                          <div className="flex items-center flex-1">
                            <PlayCircle className="h-5 w-5 mr-3" style={{ color: COLORS.skyBlue }} />
                            <div>
                              <h3 className="font-semibold" style={{ color: COLORS.deepBlue }}>Lecture 1  {courseData.title}</h3>
                              <p className="text-sm mt-1" style={{ color: COLORS.darkGrey }}>{courseData.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {courseData.isFree && (
                              <Badge 
                                className="text-white font-semibold"
                                style={{ backgroundColor: '#10B981' }}
                              >
                                Free
                              </Badge>
                            )}
                            <span className="text-sm" style={{ color: COLORS.darkGrey }}>100 min</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {courseData.objectives && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>Course Objectives</h2>
                        <p className="text-base leading-relaxed" style={{ color: COLORS.darkGrey }}>{courseData.objectives}</p>
                      </div>
                    )}

                    {courseData.whatYouWillLearn && courseData.whatYouWillLearn.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>What You'll Learn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {courseData.whatYouWillLearn.map((item: string, index: number) => (
                            <div key={index} className="flex items-start">
                              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: COLORS.skyBlue }} />
                              <span style={{ color: COLORS.darkGrey }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {courseData.syllabus && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>Syllabus</h2>
                        <div className="space-y-2">
                          {courseData.syllabus.map((item: string, index: number) => (
                            <div key={index} className="flex items-start">
                              <BookOpen className="h-5 w-5 mr-2 mt-0.5" style={{ color: COLORS.skyBlue }} />
                              <span style={{ color: COLORS.darkGrey }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {courseData.requirements && courseData.requirements.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>Requirements</h2>
                        <ul className="list-disc list-inside space-y-2">
                          {courseData.requirements.map((item: string, index: number) => (
                            <li key={index} style={{ color: COLORS.darkGrey }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.deepBlue }}>Instructor</h2>
                    {instructor ? (
                      <div className="flex items-start">
                        <div 
                          className="h-20 w-20 rounded-full flex items-center justify-center mr-6 flex-shrink-0"
                          style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                        >
                          <User className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1" style={{ color: COLORS.deepBlue }}>
                            {instructor.firstName} {instructor.lastName}
                          </h3>
                          <p className="mb-3" style={{ color: COLORS.darkGrey }}>{instructor.email}</p>
                          <p style={{ color: COLORS.darkGrey }}>Professional instructor with expertise in {category?.name}.</p>
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: COLORS.darkGrey }}>Instructor information not available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
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
                        {courseData.rating}/5.0 Average Rating
                      </p>
                      <p style={{ color: COLORS.darkGrey }}>Based on {courseData.enrolledCount} student reviews</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4" style={{ color: COLORS.deepBlue }}>Course Details</h3>
                  <div className="space-y-4">
                    {[
                      { icon: Clock, label: "Duration", value: courseData.duration },
                      { icon: BookOpen, label: "Format", value: courseData.format },
                      { icon: Users, label: "Enrolled", value: `${courseData.enrolledCount} students` },
                      { icon: Star, label: "Rating", value: `${courseData.rating}/5.0` },
                      { icon: Award, label: "Level", value: courseData.difficulty || 'Beginner' }
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
      </section>

      <Footer />
    </div>
  );
}
