import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link, Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  User
} from "lucide-react";

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

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const isLoading = enrollmentsLoading || attemptsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      
      {/* Modern Dashboard Header */}
      <section className="relative py-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.2),transparent_50%)]"></div>
        
        <div className="container relative z-10">
          <div className="glass-card rounded-3xl p-8 shadow-xl border-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-xl text-gray-600">
                  Track your progress and continue your learning journey
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 capitalize px-3 py-1 bg-blue-100 rounded-full">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="glass-card rounded-2xl p-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-600 mt-4 text-center">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Modern Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Array.isArray(enrollments) ? enrollments.length : 0}
                      </p>
                      <p className="text-gray-600 text-sm">Enrolled Courses</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Array.isArray(mockTestAttempts) ? mockTestAttempts.length : 0}
                      </p>
                      <p className="text-gray-600 text-sm">Tests Attempted</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Array.isArray(mockTestAttempts) ? mockTestAttempts.filter((attempt: any) => attempt.isCompleted).length : 0}
                      </p>
                      <p className="text-gray-600 text-sm">Tests Completed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Progress */}
              <div className="glass-card rounded-2xl p-8 shadow-xl border-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Progress</h2>
                <div className="space-y-6">
                  {Array.isArray(enrollments) && enrollments.length > 0 ? (
                    enrollments.map((enrollment: any) => (
                      <div key={enrollment.id} className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-900 text-lg">
                            Course #{enrollment.courseId}
                          </h3>
                          <Badge variant={enrollment.isActive ? "default" : "secondary"} className="px-3 py-1">
                            {enrollment.isActive ? "Active" : "Completed"}
                          </Badge>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-gray-900">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-3" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No courses enrolled</h3>
                      <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                      <Button asChild className="modern-button">
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Test Results */}
              <div className="glass-card rounded-2xl p-8 shadow-xl border-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Award className="h-6 w-6 mr-3" />
                  Recent Test Results
                </h2>
                <div className="space-y-4">
                  {Array.isArray(mockTestAttempts) && mockTestAttempts.length > 0 ? (
                    mockTestAttempts.slice(0, 5).map((attempt: any) => (
                      <div key={attempt.id} className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              Mock Test #{attempt.mockTestId}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(attempt.startedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {attempt.isCompleted ? (
                              <div>
                                <p className="text-2xl font-bold text-emerald-600">
                                  {attempt.score}
                                </p>
                                <p className="text-sm text-gray-600">Score</p>
                              </div>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No tests taken yet</h3>
                      <p className="text-gray-600 mb-6">Practice with our mock tests to improve your skills</p>
                      <Button asChild className="modern-button">
                        <Link href="/mock-tests">Start Mock Test</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="glass-card rounded-2xl p-8 shadow-xl border-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4">
                  <Button asChild className="modern-button h-14 justify-start">
                    <Link href="/courses">
                      <BookOpen className="h-5 w-5 mr-3" />
                      Browse Courses
                    </Link>
                  </Button>
                  <Button asChild className="modern-button h-14 justify-start">
                    <Link href="/mock-tests">
                      <FileText className="h-5 w-5 mr-3" />
                      Take Mock Test
                    </Link>
                  </Button>
                  <Button asChild className="modern-button h-14 justify-start">
                    <Link href="/events">
                      <Calendar className="h-5 w-5 mr-3" />
                      View Events
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="glass-card rounded-2xl p-8 shadow-xl border-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="h-6 w-6 mr-3" />
                  Upcoming Events
                </h2>
                <div className="space-y-4">
                  {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 ? (
                    upcomingEvents.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:shadow-md transition-all">
                        <h3 className="font-bold text-gray-900 mb-2">{event.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(event.startDateTime).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.eventType}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-gray-600 text-sm">No upcoming events</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
