import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link, Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp, 
  Award,
  PlayCircle,
  FileText,
  User,
  Target,
  GraduationCap,
  Rocket,
  MapPin
} from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
  });

  const { data: mockTestAttempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ["/api/mock-test-attempts"],
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["/api/events", { upcoming: true }],
  });

  const isLoading = enrollmentsLoading || attemptsLoading;

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      <Header />
      
      {/* Dashboard Hero */}
      <section 
        className="py-12 text-white"
        style={{
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 50%, ${COLORS.skyBlue} 100%)`
        }}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-xl text-blue-100">
                Track your progress and continue your learning journey
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <p className="text-blue-100 text-sm mb-1">Student ID</p>
                <p className="font-bold text-lg">#{user?.id}</p>
              </div>
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
              >
                <User className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: COLORS.skyBlue }} />
              <div className="absolute inset-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.midBlue }} />
              <div className="absolute inset-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.deepBlue }}>
                <GraduationCap className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>Loading Dashboard</h3>
            <p style={{ color: COLORS.darkGrey }}>Preparing your personalized learning experience...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                      >
                        <BookOpen className="h-6 w-6" style={{ color: COLORS.skyBlue }} />
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold mb-1" style={{ color: COLORS.deepBlue }}>
                      {Array.isArray(enrollments) ? enrollments.length : 0}
                    </p>
                    <p className="text-sm" style={{ color: COLORS.darkGrey }}>Enrolled Courses</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${COLORS.midBlue}20` }}
                      >
                        <FileText className="h-6 w-6" style={{ color: COLORS.midBlue }} />
                      </div>
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold mb-1" style={{ color: COLORS.deepBlue }}>
                      {Array.isArray(mockTestAttempts) ? mockTestAttempts.length : 0}
                    </p>
                    <p className="text-sm" style={{ color: COLORS.darkGrey }}>Tests Attempted</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#10B98120' }}
                      >
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold mb-1" style={{ color: COLORS.deepBlue }}>
                      {Array.isArray(mockTestAttempts) ? mockTestAttempts.filter((attempt: any) => attempt.isCompleted).length : 0}
                    </p>
                    <p className="text-sm" style={{ color: COLORS.darkGrey }}>Tests Completed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Course Progress */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
                      Course Progress
                    </h2>
                    <Button 
                      asChild 
                      variant="outline"
                      style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                    >
                      <Link href="/courses">Browse All</Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {Array.isArray(enrollments) && enrollments.length > 0 ? (
                      enrollments.map((enrollment: any) => (
                        <div 
                          key={enrollment.id} 
                          className="p-6 rounded-xl hover:shadow-md transition-shadow"
                          style={{ backgroundColor: COLORS.offWhite }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                                >
                                  <BookOpen className="h-5 w-5" style={{ color: COLORS.skyBlue }} />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg" style={{ color: COLORS.deepBlue }}>
                                    Course #{enrollment.courseId}
                                  </h3>
                                  <p className="text-sm" style={{ color: COLORS.darkGrey }}>
                                    Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Badge 
                              className="text-white font-semibold"
                              style={{ backgroundColor: enrollment.isActive ? '#10B981' : COLORS.darkGrey }}
                            >
                              {enrollment.isActive ? "Active" : "Completed"}
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span style={{ color: COLORS.darkGrey }}>Progress</span>
                              <span className="font-bold" style={{ color: COLORS.deepBlue }}>
                                {enrollment.progress}%
                              </span>
                            </div>
                            <Progress 
                              value={enrollment.progress} 
                              className="h-2"
                              style={{ 
                                backgroundColor: COLORS.offWhite,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                          style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                        >
                          <BookOpen className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                          No courses enrolled yet
                        </h3>
                        <p className="mb-6" style={{ color: COLORS.darkGrey }}>
                          Start your learning journey by enrolling in a course
                        </p>
                        <Button 
                          asChild 
                          className="text-white font-semibold"
                          style={{ backgroundColor: COLORS.skyBlue }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                        >
                          <Link href="/courses">
                            <Rocket className="h-4 w-4 mr-2" />
                            Browse Courses
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Test Results */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center" style={{ color: COLORS.deepBlue }}>
                      <Award className="h-6 w-6 mr-3" style={{ color: COLORS.skyBlue }} />
                      Recent Test Results
                    </h2>
                    <Button 
                      asChild 
                      variant="outline"
                      style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                    >
                      <Link href="/mock-tests">View All</Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {Array.isArray(mockTestAttempts) && mockTestAttempts.length > 0 ? (
                      mockTestAttempts.slice(0, 5).map((attempt: any) => (
                        <div 
                          key={attempt.id} 
                          className="p-5 rounded-xl hover:shadow-md transition-shadow"
                          style={{ backgroundColor: COLORS.offWhite }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${COLORS.midBlue}20` }}
                              >
                                <FileText className="h-6 w-6" style={{ color: COLORS.midBlue }} />
                              </div>
                              <div>
                                <h3 className="font-bold" style={{ color: COLORS.deepBlue }}>
                                  Mock Test #{attempt.mockTestId}
                                </h3>
                                <p className="text-sm flex items-center gap-2" style={{ color: COLORS.darkGrey }}>
                                  <Clock className="h-3 w-3" />
                                  {new Date(attempt.startedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {attempt.isCompleted ? (
                                <div>
                                  <p className="text-3xl font-bold text-green-600">
                                    {attempt.score}
                                  </p>
                                  <p className="text-xs" style={{ color: COLORS.darkGrey }}>Score</p>
                                </div>
                              ) : (
                                <Badge 
                                  className="text-white font-semibold"
                                  style={{ backgroundColor: '#F59E0B' }}
                                >
                                  In Progress
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                          style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                        >
                          <FileText className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                          No tests taken yet
                        </h3>
                        <p className="mb-6" style={{ color: COLORS.darkGrey }}>
                          Practice with our mock tests to improve your skills
                        </p>
                        <Button 
                          asChild 
                          className="text-white font-semibold"
                          style={{ backgroundColor: COLORS.skyBlue }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                        >
                          <Link href="/mock-tests">
                            <Target className="h-4 w-4 mr-2" />
                            Start Mock Test
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6" style={{ color: COLORS.deepBlue }}>
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Button 
                      asChild 
                      className="w-full justify-start h-12 text-white font-semibold"
                      style={{ backgroundColor: COLORS.skyBlue }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                    >
                      <Link href="/courses">
                        <BookOpen className="h-5 w-5 mr-3" />
                        Browse Courses
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      className="w-full justify-start h-12"
                      variant="outline"
                      style={{ borderColor: COLORS.midBlue, color: COLORS.midBlue }}
                    >
                      <Link href="/mock-tests">
                        <FileText className="h-5 w-5 mr-3" />
                        Take Mock Test
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      className="w-full justify-start h-12"
                      variant="outline"
                      style={{ borderColor: COLORS.midBlue, color: COLORS.midBlue }}
                    >
                      <Link href="/events">
                        <Calendar className="h-5 w-5 mr-3" />
                        View Events
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      className="w-full justify-start h-12"
                      variant="outline"
                      style={{ borderColor: COLORS.midBlue, color: COLORS.midBlue }}
                    >
                      <Link href="/study-abroad-services">
                        <MapPin className="h-5 w-5 mr-3" />
                        Study Abroad
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: COLORS.deepBlue }}>
                    <Calendar className="h-5 w-5 mr-2" style={{ color: COLORS.skyBlue }} />
                    Upcoming Events
                  </h2>
                  <div className="space-y-4">
                    {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 ? (
                      upcomingEvents.slice(0, 3).map((event: any) => (
                        <div 
                          key={event.id} 
                          className="p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          style={{ backgroundColor: COLORS.offWhite }}
                        >
                          <h3 className="font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                            {event.title}
                          </h3>
                          <div className="flex items-center text-sm mb-2" style={{ color: COLORS.darkGrey }}>
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(event.eventDate).toLocaleDateString()}
                          </div>
                          <Badge 
                            className="text-xs text-white"
                            style={{ backgroundColor: COLORS.midBlue }}
                          >
                            {event.eventType}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                        >
                          <Calendar className="h-6 w-6" style={{ color: COLORS.skyBlue }} />
                        </div>
                        <p className="text-sm" style={{ color: COLORS.darkGrey }}>
                          No upcoming events
                        </p>
                      </div>
                    )}
                  </div>
                  {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 && (
                    <Button 
                      asChild 
                      variant="ghost" 
                      className="w-full mt-4"
                      style={{ color: COLORS.skyBlue }}
                    >
                      <Link href="/events">View All Events →</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* User Profile Card */}
              <Card className="border-0 shadow-lg" style={{ background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 100%)` }}>
                <CardContent className="p-6 text-white">
                  <div className="flex items-center mb-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mr-4"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-sm text-blue-100 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-blue-100">
                      <span className="font-semibold">Email:</span> {user?.email}
                    </p>
                    {user?.phone && (
                      <p className="text-blue-100">
                        <span className="font-semibold">Phone:</span> {user?.phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
