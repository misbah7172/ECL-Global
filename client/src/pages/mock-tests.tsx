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
import { FileText, Clock, TrendingUp, Award, Play, Filter } from "lucide-react";

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

  const testTypes = ["IELTS", "SAT", "TOEFL", "GRE"];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-6">Practice with Real Mock Tests</h1>
              <p className="text-gray-300 text-lg mb-8">
                Get exam-ready with our comprehensive mock test engine featuring real exam patterns, auto-grading, and detailed performance analytics.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Full-length practice tests for IELTS, SAT, TOEFL",
                  "Instant auto-grading and detailed feedback",
                  "Performance analytics and improvement suggestions",
                  "Adaptive difficulty based on your skill level"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="bg-secondary/20 p-1 rounded-full mr-3">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {!isAuthenticated && (
                <Button variant="secondary" size="lg">
                  <a href="/register">Sign Up to Start Testing</a>
                </Button>
              )}
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop" 
                alt="Online test interface" 
                className="rounded-lg shadow-2xl w-full"
              />
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">25,000+</div>
                  <div className="text-sm text-gray-600">Tests Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="available">Available Tests</TabsTrigger>
            <TabsTrigger value="my-results" disabled={!isAuthenticated}>
              My Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-8">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <Select value={selectedTestType} onValueChange={setSelectedTestType}>
                <SelectTrigger className="w-48">
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
            </div>

            {/* Available Tests */}
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
                <div className="col-span-full text-center py-16">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests available</h3>
                  <p className="text-gray-600">Check back later for new mock tests.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-results" className="space-y-8">
            {isAuthenticated ? (
              <>
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-3 rounded-lg mr-4">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {myAttempts?.length || 0}
                          </p>
                          <p className="text-gray-600 text-sm">Total Attempts</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="bg-secondary/10 p-3 rounded-lg mr-4">
                          <Award className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {myAttempts?.filter((attempt: any) => attempt.isCompleted)?.length || 0}
                          </p>
                          <p className="text-gray-600 text-sm">Completed</p>
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
                            {myAttempts?.filter((attempt: any) => attempt.isCompleted)
                              .reduce((avg: number, attempt: any, index: number) => 
                                (avg * index + parseFloat(attempt.score || 0)) / (index + 1), 0)
                              .toFixed(1) || "0.0"}
                          </p>
                          <p className="text-gray-600 text-sm">Avg Score</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round(myAttempts?.filter((attempt: any) => attempt.timeSpent)
                              .reduce((avg: number, attempt: any, index: number) => 
                                (avg * index + attempt.timeSpent) / (index + 1), 0) || 0)}
                          </p>
                          <p className="text-gray-600 text-sm">Avg Time (min)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Test History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Test History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myAttempts && myAttempts.length > 0 ? (
                      <div className="space-y-4">
                        {myAttempts.map((attempt: any) => (
                          <div key={attempt.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  Mock Test #{attempt.mockTestId}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Started: {new Date(attempt.startedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                {attempt.isCompleted ? (
                                  <div>
                                    <Badge variant="default" className="mb-2">Completed</Badge>
                                    <p className="text-lg font-bold text-primary">
                                      Score: {attempt.score}
                                    </p>
                                    {attempt.timeSpent && (
                                      <p className="text-sm text-gray-600">
                                        Time: {attempt.timeSpent} minutes
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <Badge variant="outline">In Progress</Badge>
                                )}
                              </div>
                            </div>
                            {attempt.completedAt && (
                              <p className="text-sm text-gray-600">
                                Completed: {new Date(attempt.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No test attempts yet</h3>
                        <p className="text-gray-600 mb-4">Start taking mock tests to see your results here</p>
                        <Button onClick={() => setActiveTab("available")}>
                          Take Your First Test
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Login to view your results</h3>
                <Button asChild>
                  <a href="/login">Login</a>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
