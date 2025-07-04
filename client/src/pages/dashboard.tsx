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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Dashboard Header */}
      <section className="bg-white border-b">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Track your progress and continue your learning journey
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-3 rounded-lg mr-4">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {enrollments?.length || 0}
                        </p>
                        <p className="text-gray-600 text-sm">Enrolled Courses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-secondary/10 p-3 rounded-lg mr-4">
                        <FileText className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockTestAttempts?.length || 0}
                        </p>
                        <p className="text-gray-600 text-sm">Tests Attempted</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockTestAttempts?.filter((attempt: any) => attempt.isCompleted)?.length || 0}
                        </p>
                        <p className="text-gray-600 text-sm">Tests Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Course Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    My Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enrollments && enrollments.length > 0 ? (
                    <div className="space-y-4">
                      {enrollments.map((enrollment: any) => (
                        <div key={enrollment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">
                              Course #{enrollment.courseId}
                            </h3>
                            <Badge variant={enrollment.isActive ? "default" : "secondary"}>
                              {enrollment.isActive ? "Active" : "Completed"}
                            </Badge>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{enrollment.progress}%</span>
                            </div>
                            <Progress value={enrollment.progress} className="h-2" />
                          </div>
                          <p className="text-sm text-gray-600">
                            Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
                      <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
                      <Button asChild>
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Test Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Recent Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mockTestAttempts && mockTestAttempts.length > 0 ? (
                    <div className="space-y-4">
                      {mockTestAttempts.slice(0, 5).map((attempt: any) => (
                        <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Mock Test #{attempt.mockTestId}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(attempt.startedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {attempt.isCompleted ? (
                              <div>
                                <p className="text-lg font-bold text-primary">
                                  {attempt.score}
                                </p>
                                <p className="text-sm text-gray-600">Score</p>
                              </div>
                            ) : (
                              <Badge variant="outline">In Progress</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No tests taken yet</h3>
                      <p className="text-gray-600 mb-4">Practice with our mock tests to improve your skills</p>
                      <Button asChild>
                        <Link href="/mock-tests">Start Mock Test</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/courses">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/mock-tests">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Take Mock Test
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/events">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Events
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents && upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingEvents.slice(0, 3).map((event: any) => (
                        <div key={event.id} className="border-l-4 border-primary pl-4">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">No upcoming events</p>
                  )}
                </CardContent>
              </Card>

              {/* Study Streak */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Study Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary mb-2">7</p>
                    <p className="text-gray-600 text-sm">Days in a row</p>
                    <p className="text-xs text-gray-500 mt-2">Keep it up!</p>
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
