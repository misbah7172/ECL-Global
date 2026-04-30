import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MockTestCard from "@/components/mock-test-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Clock, TrendingUp, Award, Play, Filter, Target, CheckCircle, BookOpen, ChevronRight, Users } from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

export default function MockTests() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTestType, setSelectedTestType] = useState("all");
  const [activeTab, setActiveTab] = useState("available");

  const { data: mockTests, isLoading } = useQuery({
    queryKey: ["/api/mock-tests", selectedTestType],
    queryFn: async () => {
      const url = selectedTestType === "all" ? "/api/mock-tests" : `/api/mock-tests?testType=${selectedTestType}`;
      const response = await fetch(url);
      return response.json();
    },
  });

  const { data: myAttempts } = useQuery({
    queryKey: ["/api/mock-test-attempts"],
    queryFn: async () => {
      const response = await fetch("/api/mock-test-attempts");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const startTestMutation = useMutation({
    mutationFn: (testId: number) => apiRequest("POST", `/api/mock-tests/${testId}/start`),
    onSuccess: (data) => {
      toast({
        title: "Test Started!",
        description: "Good luck with your mock test.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mock-test-attempts"] });
      // In a real app, this would redirect to the test interface
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start test",
        variant: "destructive",
      });
    },
  });

  const testTypes = ["IELTS", "PTE", "TOEFL", "GERMAN", "DEUTSCH"];

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
                <FileText className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Loading Mock Tests
              </h3>
              <p style={{ color: COLORS.darkGrey }}>Preparing practice tests for you...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      <Header />
      
      {/* Hero Section */}
      <section 
        className="text-white py-20 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 50%, ${COLORS.skyBlue} 100%)`
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">Mock Tests</h1>
              </div>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Get exam-ready with our comprehensive mock test engine featuring real exam patterns, auto-grading, and detailed performance analytics.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Full-length practice tests for IELTS, PTE, TOEFL, GERMAN, DEUTSCH",
                  "Instant auto-grading and detailed feedback",
                  "Performance analytics and improvement suggestions",
                  "Adaptive difficulty based on your skill level"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-blue-50">{feature}</span>
                  </div>
                ))}
              </div>
              {!isAuthenticated && (
                <Button 
                  size="lg"
                  className="h-14 px-8 text-white font-semibold shadow-xl"
                  style={{ backgroundColor: COLORS.skyBlue }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                >
                  <a href="/register" className="flex items-center gap-2">
                    Sign Up to Start Testing
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop" 
                alt="Online test interface" 
                className="rounded-2xl shadow-2xl w-full"
              />
              <div 
                className="absolute -bottom-6 -left-6 p-6 rounded-xl shadow-2xl backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: COLORS.deepBlue }}>25,000+</div>
                  <div className="text-sm font-medium" style={{ color: COLORS.darkGrey }}>Tests Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList 
            className="grid w-full grid-cols-2 max-w-md h-14"
            style={{ backgroundColor: COLORS.offWhite }}
          >
            <TabsTrigger 
              value="available"
              className="font-semibold data-[state=active]:text-white"
              style={{
                color: activeTab === 'available' ? 'white' : COLORS.darkGrey,
                backgroundColor: activeTab === 'available' ? COLORS.skyBlue : 'transparent'
              }}
            >
              Available Tests
            </TabsTrigger>
            <TabsTrigger 
              value="my-results" 
              disabled={!isAuthenticated}
              className="font-semibold data-[state=active]:text-white"
              style={{
                color: activeTab === 'my-results' ? 'white' : COLORS.darkGrey,
                backgroundColor: activeTab === 'my-results' ? COLORS.skyBlue : 'transparent'
              }}
            >
              My Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-8">
            {/* Filters */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
              <Filter className="h-5 w-5" style={{ color: COLORS.darkGrey }} />
              <span className="font-semibold" style={{ color: COLORS.deepBlue }}>Filter by:</span>
              <Select value={selectedTestType} onValueChange={setSelectedTestType}>
                <SelectTrigger 
                  className="w-56 h-12 border-2 font-medium"
                  style={{ borderColor: COLORS.skyBlue, color: COLORS.deepBlue }}
                >
                  <SelectValue placeholder="All Test Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Test Types</SelectItem>
                  {testTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTestType !== 'all' && (
                <Badge 
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer"
                  style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}
                  onClick={() => setSelectedTestType('all')}
                >
                  {selectedTestType} ✕
                </Badge>
              )}
            </div>

            {/* Available Tests */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>Practice Tests</h2>
                <p style={{ color: COLORS.darkGrey }}>Choose a test to begin your practice session</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTests && mockTests.length > 0 ? (
                  mockTests.map((test: any) => (
                    <MockTestCard 
                      key={test.id} 
                      test={test} 
                      onStart={() => startTestMutation.mutate(test.id)}
                      isStarting={startTestMutation.isPending}
                      isAuthenticated={isAuthenticated}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20">
                    <div className="max-w-md mx-auto bg-white rounded-2xl p-12 shadow-lg">
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                      >
                        <FileText className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                      </div>
                      <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>No Tests Available</h3>
                      <p style={{ color: COLORS.darkGrey }}>Check back later for new mock tests.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-results" className="space-y-8">
            {isAuthenticated ? (
              <>
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div 
                          className="p-3 rounded-xl mr-4"
                          style={{ backgroundColor: `${COLORS.deepBlue}20` }}
                        >
                          <FileText className="h-6 w-6" style={{ color: COLORS.deepBlue }} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
                            {myAttempts?.length || 0}
                          </p>
                          <p className="text-sm" style={{ color: COLORS.darkGrey }}>Total Attempts</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div 
                          className="p-3 rounded-xl mr-4"
                          style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                        >
                          <Award className="h-6 w-6" style={{ color: COLORS.skyBlue }} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
                            {myAttempts?.filter((attempt: any) => attempt.isCompleted)?.length || 0}
                          </p>
                          <p className="text-sm" style={{ color: COLORS.darkGrey }}>Completed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div 
                          className="p-3 rounded-xl mr-4"
                          style={{ backgroundColor: `${COLORS.midBlue}20` }}
                        >
                          <TrendingUp className="h-6 w-6" style={{ color: COLORS.midBlue }} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
                            {myAttempts?.filter((attempt: any) => attempt.isCompleted)
                              .reduce((avg: number, attempt: any, index: number) => 
                                (avg * index + parseFloat(attempt.score || 0)) / (index + 1), 0)
                              .toFixed(1) || "0.0"}
                          </p>
                          <p className="text-sm" style={{ color: COLORS.darkGrey }}>Avg Score</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div 
                          className="p-3 rounded-xl mr-4"
                          style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                        >
                          <Clock className="h-6 w-6" style={{ color: COLORS.skyBlue }} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
                            {Math.round(myAttempts?.filter((attempt: any) => attempt.timeSpent)
                              .reduce((avg: number, attempt: any, index: number) => 
                                (avg * index + attempt.timeSpent) / (index + 1), 0) || 0)}
                          </p>
                          <p className="text-sm" style={{ color: COLORS.darkGrey }}>Avg Time (min)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Test History */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle style={{ color: COLORS.deepBlue }}>Test History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myAttempts && myAttempts.length > 0 ? (
                      <div className="space-y-4">
                        {myAttempts.map((attempt: any) => (
                          <div 
                            key={attempt.id} 
                            className="border-2 rounded-xl p-5 hover:shadow-md transition-shadow"
                            style={{ borderColor: COLORS.offWhite }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg" style={{ color: COLORS.deepBlue }}>
                                  Mock Test #{attempt.mockTestId}
                                </h3>
                                <p className="text-sm" style={{ color: COLORS.darkGrey }}>
                                  Started: {new Date(attempt.startedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                {attempt.isCompleted ? (
                                  <div>
                                    <Badge 
                                      className="mb-2 text-white font-semibold"
                                      style={{ backgroundColor: COLORS.skyBlue }}
                                    >
                                      Completed
                                    </Badge>
                                    <p className="text-lg font-bold" style={{ color: COLORS.deepBlue }}>
                                      Score: {attempt.score}
                                    </p>
                                    {attempt.timeSpent && (
                                      <p className="text-sm" style={{ color: COLORS.darkGrey }}>
                                        Time: {attempt.timeSpent} minutes
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <Badge 
                                    variant="outline"
                                    style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                                  >
                                    In Progress
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {attempt.completedAt && (
                              <p className="text-sm" style={{ color: COLORS.darkGrey }}>
                                Completed: {new Date(attempt.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                        >
                          <FileText className="h-8 w-8" style={{ color: COLORS.skyBlue }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.deepBlue }}>No test attempts yet</h3>
                        <p className="mb-4" style={{ color: COLORS.darkGrey }}>Start taking mock tests to see your results here</p>
                        <Button 
                          onClick={() => setActiveTab("available")}
                          className="text-white font-semibold"
                          style={{ backgroundColor: COLORS.skyBlue }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                        >
                          Take Your First Test
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto bg-white rounded-2xl p-12 shadow-lg">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                  >
                    <Users className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>Login to View Results</h3>
                  <p className="mb-6" style={{ color: COLORS.darkGrey }}>Track your progress and view detailed performance analytics</p>
                  <Button 
                    asChild
                    className="text-white font-semibold"
                    style={{ backgroundColor: COLORS.skyBlue }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                  >
                    <a href="/login">Login Now</a>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>
              Why Practice with Our Mock Tests?
            </h2>
            <p className="text-lg" style={{ color: COLORS.darkGrey }}>
              Comprehensive test preparation designed for your success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Real Exam Simulation",
                description: "Experience authentic exam conditions with questions modeled after actual test patterns and difficulty levels."
              },
              {
                icon: TrendingUp,
                title: "Detailed Analytics",
                description: "Track your progress over time with comprehensive performance metrics and personalized improvement suggestions."
              },
              {
                icon: Award,
                title: "Instant Results",
                description: "Get immediate feedback with auto-grading, detailed explanations, and score breakdowns for each section."
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="p-8 rounded-xl text-center hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: COLORS.offWhite }}
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                >
                  <benefit.icon className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>
                  {benefit.title}
                </h3>
                <p className="leading-relaxed" style={{ color: COLORS.darkGrey }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 text-white"
        style={{
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 100%)`
        }}
      >
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Award className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Ace Your Exam?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Start practicing today with our expert-designed mock tests and boost your exam confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="h-14 px-8 text-white font-semibold shadow-xl"
              style={{ backgroundColor: COLORS.skyBlue }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
              onClick={() => setActiveTab('available')}
            >
              Start Practice Test
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="h-14 px-8 border-2 border-white text-white hover:bg-white font-semibold"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = COLORS.deepBlue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              View All Courses
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
