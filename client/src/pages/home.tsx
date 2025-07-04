import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import StatsSection from "@/components/stats-section";
import CourseCard from "@/components/course-card";
import InstructorCard from "@/components/instructor-card";
import EventCard from "@/components/event-card";
import LeadForm from "@/components/lead-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ClipboardCheck, Languages, Globe, Star, Clock, Users, ArrowRight, MapPin, Calendar, Phone } from "lucide-react";

export default function Home() {
  const { data: featuredCourses } = useQuery({
    queryKey: ["/api/courses", { featured: true }],
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["/api/events", { upcoming: true }],
  });

  const { data: branches } = useQuery({
    queryKey: ["/api/branches"],
  });

  // Mock instructors data for display
  const instructors = [
    {
      id: 1,
      name: "Dr. Ahmed Rahman",
      specialization: "IELTS Expert",
      experience: "8+ Years Experience",
      rating: "4.9 (245 reviews)",
      achievement: "Average student score: Band 7.5",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      specialization: "SAT Specialist",
      experience: "12+ Years Experience",
      rating: "4.8 (189 reviews)",
      achievement: "Average score improvement: 280 points",
      imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b193?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Michael Chen",
      specialization: "Study Abroad Counselor",
      experience: "10+ Years Experience",
      rating: "5.0 (156 reviews)",
      achievement: "98% visa approval rate",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Dr. Priya Sharma",
      specialization: "English Language",
      experience: "15+ Years Experience",
      rating: "4.9 (312 reviews)",
      achievement: "Cambridge certified trainer",
      imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white">
        <div className="container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Excel in IELTS, SAT & Study Abroad Dreams
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Join thousands of students who achieved their academic goals with our expert guidance, comprehensive courses, and proven methodologies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">Book Free Consultation</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary" asChild>
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in-up">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop" 
                alt="Diverse group of students studying together" 
                className="rounded-lg shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="bg-secondary/20 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-lg font-bold text-gray-900">98.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <StatsSection />

      {/* Course Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title">Popular Course Categories</h2>
            <p className="section-subtitle">
              Choose from our comprehensive range of courses designed to help you achieve your academic and professional goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Test Preparation */}
            <Card className="course-card overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=300&fit=crop" 
                alt="Test preparation materials" 
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <ClipboardCheck className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">Test Preparation</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  IELTS, TOEFL, SAT, GRE preparation with expert instructors and proven methodologies.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">8 Courses</span>
                  <Button variant="link" className="p-0" asChild>
                    <Link href="/courses?category=test-prep">
                      View Courses <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Language Development */}
            <Card className="course-card overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=300&fit=crop" 
                alt="Language learning classroom" 
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Languages className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">Language Development</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  English proficiency, grammar, writing, and communication skills enhancement programs.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">12 Courses</span>
                  <Button variant="link" className="p-0" asChild>
                    <Link href="/courses?category=language">
                      View Courses <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Study Abroad */}
            <Card className="course-card overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=300&fit=crop" 
                alt="Students planning study abroad" 
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Globe className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">Study Abroad</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Complete guidance for studying in USA, UK, Canada, Australia, and more countries.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">15 Services</span>
                  <Button variant="link" className="p-0" asChild>
                    <Link href="/courses?category=study-abroad">
                      View Services <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="text-gray-600">Most popular courses chosen by our students</p>
            </div>
            <Button variant="link" asChild>
              <Link href="/courses">
                View All Courses <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses?.slice(0, 3).map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Mock Test Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Practice with Real Mock Tests</h2>
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
                    <CheckCircle className="h-5 w-5 text-secondary mr-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/mock-tests">Start Free Mock Test</Link>
              </Button>
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

      {/* Instructor Showcase */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title">Meet Our Expert Instructors</h2>
            <p className="section-subtitle">
              Learn from industry experts with years of experience in test preparation and international education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {instructors.map((instructor) => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
        </div>
      </section>

      {/* Student Dashboard Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Track Your Progress</h2>
              <p className="text-lg text-gray-600 mb-8">
                Monitor your learning journey with our comprehensive student dashboard featuring progress tracking, assignments, and performance analytics.
              </p>
              <div className="space-y-6 mb-8">
                {[
                  {
                    icon: CheckCircle,
                    title: "Performance Analytics",
                    description: "Detailed insights into your strengths and areas for improvement"
                  },
                  {
                    icon: ClipboardCheck,
                    title: "Assignment Tracking",
                    description: "Keep track of assignments, deadlines, and submission status"
                  },
                  {
                    icon: Calendar,
                    title: "Schedule Management",
                    description: "View upcoming classes, sessions, and important dates"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-lg mr-4">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild>
                <Link href="/dashboard">View Dashboard Demo</Link>
              </Button>
            </div>
            <div className="relative">
              {/* Dashboard mockup */}
              <Card className="shadow-2xl">
                <div className="bg-primary text-white p-4 rounded-t-lg">
                  <h3 className="font-semibold">Student Dashboard</h3>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Course Progress</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>IELTS Preparation</span>
                            <span>75%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>SAT Math</span>
                            <span>60%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-secondary h-2 rounded-full" style={{ width: "60%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Recent Test Scores</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-primary/5 rounded-lg">
                          <div className="text-lg font-bold text-primary">7.5</div>
                          <div className="text-xs text-gray-600">IELTS Mock</div>
                        </div>
                        <div className="text-center p-3 bg-secondary/5 rounded-lg">
                          <div className="text-lg font-bold text-secondary">1480</div>
                          <div className="text-xs text-gray-600">SAT Practice</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title">Find a Branch Near You</h2>
            <p className="section-subtitle">
              Visit any of our conveniently located branches across Bangladesh for in-person consultations and classes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {branches?.slice(0, 3).map((branch: any) => (
              <Card key={branch.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{branch.name}</h3>
                      <p className="text-sm text-gray-500">
                        {branch.isMain ? "Main Branch" : "Regional Branch"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-3" />
                      <p className="text-sm text-gray-600">{branch.address}</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <p className="text-sm text-gray-600">{branch.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-3" />
                      <p className="text-sm text-gray-600">{branch.hours}</p>
                    </div>
                  </div>
                  <Button className="w-full">Get Directions</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/branches">View All Branches</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title">Upcoming Events & Seminars</h2>
            <p className="section-subtitle">
              Join our educational events, workshops, and study abroad fairs to enhance your knowledge and network with experts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {upcomingEvents?.slice(0, 2).map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 hero-gradient text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of successful students who achieved their dreams with our expert guidance and comprehensive programs.
            </p>
            
            <LeadForm />

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button variant="secondary" size="lg">
                <Phone className="h-5 w-5 mr-2" />
                Call Now: +880 1777-123456
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary">
                WhatsApp Chat
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
