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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  ClipboardCheck, 
  Languages, 
  Globe, 
  Star, 
  Clock, 
  Users, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Phone,
  BookOpen,
  Trophy,
  Target,
  Zap,
  Award,
  TrendingUp,
  Heart,
  Shield,
  Play,
  Video,
  ChevronRight,
  GraduationCap,
  Building,
  Briefcase,
  MessageSquare,
  FileText,
  Headphones,
  Gift
} from "lucide-react";

export default function Home() {
  const { data: featuredCourses = [] } = useQuery({
    queryKey: ["/api/courses", { featured: true }],
  });

  const { data: freeCourses = [] } = useQuery({
    queryKey: ["/api/courses", { isFree: true }],
    queryFn: async () => {
      const response = await fetch("/api/courses?isFree=true");
      return response.json();
    },
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["/api/events", { upcoming: true }],
  });

  const { data: branches = [] } = useQuery({
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

  const services = [
    {
      icon: ClipboardCheck,
      title: "Test Preparation",
      description: "IELTS, TOEFL, SAT, GRE, GMAT preparation with expert guidance",
      features: ["Personal mentoring", "Practice tests", "Score guarantee"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Globe,
      title: "Study Abroad Consulting",
      description: "Complete guidance for studying in top universities worldwide",
      features: ["University selection", "Visa assistance", "Document preparation"],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Briefcase,
      title: "Career Counseling",
      description: "Professional career guidance and job placement assistance",
      features: ["Resume building", "Interview prep", "Job placement"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: Languages,
      title: "Language Training",
      description: "Comprehensive language courses for academic and professional needs",
      features: ["Speaking practice", "Grammar mastery", "Writing skills"],
      color: "from-orange-500 to-orange-600"
    }
  ];

  const successStories = [
    {
      name: "Rashid Ahmed",
      achievement: "IELTS Band 8.5",
      university: "University of Toronto",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      quote: "The personalized guidance helped me achieve my dream score and secure admission to my dream university."
    },
    {
      name: "Fatima Khan",
      achievement: "SAT Score 1550",
      university: "MIT",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b193?w=200&h=200&fit=crop&crop=face",
      quote: "The strategic approach and comprehensive materials made all the difference in my preparation."
    },
    {
      name: "Arif Hassan",
      achievement: "Visa Success",
      university: "University of Melbourne",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      quote: "From application to visa approval, the support was exceptional throughout my journey."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      {/* Hero Section - Modern Design */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-20"></div>
        
        <div className="relative container py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <Trophy className="h-4 w-4 mr-2" />
                  #1 Study Abroad Consultant in Bangladesh
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Your Gateway to
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {" "}Global Education
                  </span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Transform your academic dreams into reality with our expert guidance, comprehensive test preparation, and personalized study abroad consulting services.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6 py-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">15K+</div>
                  <div className="text-sm text-blue-200">Students Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">98%</div>
                  <div className="text-sm text-blue-200">Visa Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">50+</div>
                  <div className="text-sm text-blue-200">Partner Universities</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold" asChild>
                  <Link href="/register">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Free Consultation
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black" asChild>
                  <Link href="/courses">
                    <Play className="h-5 w-5 mr-2" />
                    Watch Success Stories
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl opacity-20 blur-3xl"></div>
              <Card className="relative bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-center">Quick Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      IELTS Prep
                    </Button>
                    <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                      <Building className="h-4 w-4 mr-2" />
                      SAT Prep
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                      <Globe className="h-4 w-4 mr-2" />
                      Study Abroad
                    </Button>
                    <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Career Guide
                    </Button>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold">
                    Get Free Assessment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-50 text-blue-700 hover:bg-blue-100">
              Our Services
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Comprehensive Solutions for Your Educational Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From test preparation to visa guidance, we provide end-to-end support for your academic and professional success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${service.color} rounded-full flex items-center justify-center`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:text-blue-700">
                    Learn More
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-50 text-green-700 hover:bg-green-100">
              Student Success Stories
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Real Students, Real Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our personalized guidance and expert coaching helped students achieve their dreams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <img 
                      src={story.image} 
                      alt={story.name}
                      className="w-20 h-20 rounded-full mx-auto object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-2">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{story.name}</h3>
                  <div className="text-lg font-bold text-blue-600 mb-1">{story.achievement}</div>
                  <div className="text-sm text-gray-500 mb-4">{story.university}</div>
                  <p className="text-gray-600 italic">"{story.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-purple-50 text-purple-700 hover:bg-purple-100">
                Why Choose Us
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Your Success is Our Mission
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We combine cutting-edge technology with personalized mentoring to deliver exceptional results for every student.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Target,
                    title: "Personalized Learning Path",
                    description: "Customized study plans based on your goals, strengths, and timeline."
                  },
                  {
                    icon: Shield,
                    title: "Guaranteed Results",
                    description: "Score improvement guarantee or money back. We stand behind our methods."
                  },
                  {
                    icon: Headphones,
                    title: "24/7 Support",
                    description: "Round-the-clock assistance from our expert team whenever you need help."
                  },
                  {
                    icon: Award,
                    title: "Proven Track Record",
                    description: "15+ years of excellence with 15,000+ successful student placements."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl opacity-20 blur-3xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop" 
                alt="Student using online platform" 
                className="relative rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Score Improvement</div>
                    <div className="text-lg font-bold text-green-600">+280 Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Badge className="mb-4 bg-blue-50 text-blue-700 hover:bg-blue-100">
                Popular Courses
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Courses</h2>
              <p className="text-gray-600">Most popular courses chosen by our students</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/courses">
                View All Courses <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(featuredCourses) && featuredCourses.slice(0, 3).map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Free Courses Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200">
              <Gift className="h-4 w-4 mr-2" />
              100% Free Learning
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Start Learning for Free
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access our collection of completely free courses. No cost, no registration required - just quality education to get you started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {Array.isArray(freeCourses) && freeCourses.slice(0, 3).map((course: any) => (
              <div key={course.id} className="relative">
                <CourseCard course={course} />
                {/* Free badge */}
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md flex items-center">
                  <Gift className="h-4 w-4 mr-1" />
                  FREE
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
              <Link href="/free-courses">
                <BookOpen className="h-5 w-5 mr-2" />
                Explore All Free Courses
              </Link>
            </Button>
          </div>

          {/* Benefits of Free Courses */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality Content
              </h3>
              <p className="text-gray-600">
                Same high-quality content as our paid courses, completely free.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Registration Required
              </h3>
              <p className="text-gray-600">
                Start learning immediately without any signup or hidden fees.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lifetime Access
              </h3>
              <p className="text-gray-600">
                Access your free courses anytime, anywhere, forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Study Abroad Services Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              Study Abroad Services
            </Badge>
            <h2 className="text-4xl font-bold mb-6">Your Path to Global Education</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert guidance and comprehensive support for every step of your international education journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: <Award className="h-8 w-8 text-blue-600" />,
                title: "University Admission",
                description: "Expert guidance for applications to top universities worldwide",
                features: ["Application review", "Essay assistance", "Interview prep"]
              },
              {
                icon: <Shield className="h-8 w-8 text-green-600" />,
                title: "Visa Processing",
                description: "Complete visa application support with high success rates",
                features: ["Document preparation", "Application filing", "Interview coaching"]
              },
              {
                icon: <Star className="h-8 w-8 text-yellow-600" />,
                title: "Scholarship Guidance",
                description: "Maximize funding opportunities for your international education",
                features: ["Scholarship search", "Application strategy", "Interview prep"]
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-red-600" />,
                title: "Career Counseling",
                description: "Strategic career planning and academic pathway guidance",
                features: ["Career assessment", "Course selection", "Industry insights"]
              }
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {service.icon}
                    <h3 className="font-semibold text-lg">{service.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Why Choose Our Study Abroad Services?</h3>
              <div className="space-y-4">
                {[
                  { stat: "98%", label: "Visa Success Rate", icon: <Shield className="h-5 w-5 text-green-500" /> },
                  { stat: "15K+", label: "Students Placed", icon: <Users className="h-5 w-5 text-blue-500" /> },
                  { stat: "50+", label: "Partner Universities", icon: <Building className="h-5 w-5 text-purple-500" /> },
                  { stat: "25+", label: "Countries", icon: <Globe className="h-5 w-5 text-red-500" /> }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-2xl font-bold text-gray-900">{item.stat}</span>
                    </div>
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl">
              <h4 className="text-2xl font-bold mb-6 text-center">Ready to Start Your Journey?</h4>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Free initial consultation</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Personalized study plan</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">End-to-end support</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1" asChild>
                  <Link href="/study-abroad-services">
                    <Globe className="h-4 w-4 mr-2" />
                    Explore Services
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Book Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-white/10 text-white hover:bg-white/20">
                Try It Now
              </Badge>
              <h2 className="text-4xl font-bold mb-6">Experience Our Platform</h2>
              <p className="text-xl text-blue-100 mb-8">
                Take a free mock test and see how our AI-powered platform provides instant feedback and personalized improvement suggestions.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Real exam simulation with timer",
                  "Instant AI-powered feedback",
                  "Detailed performance analytics",
                  "Personalized study recommendations"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="bg-green-500 rounded-full p-1 mr-3">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-blue-100">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold" asChild>
                  <Link href="/mock-tests">
                    <Play className="h-5 w-5 mr-2" />
                    Start Free Mock Test
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black" asChild>
                  <Link href="/dashboard">
                    <Video className="h-5 w-5 mr-2" />
                    Watch Demo
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-center">Mock Test Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-blue-200">Reading Comprehension</span>
                      <span className="text-white">85%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-blue-200">Writing Skills</span>
                      <span className="text-white">72%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: "72%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-blue-200">Speaking Practice</span>
                      <span className="text-white">91%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{ width: "91%" }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">7.5</div>
                      <div className="text-xs text-blue-200">IELTS Band</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">1480</div>
                      <div className="text-xs text-blue-200">SAT Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Instructors */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-50 text-orange-700 hover:bg-orange-100">
              Our Expert Team
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Learn from the Best
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our instructors are industry experts with proven track records in test preparation and international education consulting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {instructors.map((instructor) => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-50 text-red-700 hover:bg-red-100">
              Our Locations
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Find Us Near You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Visit any of our conveniently located branches across Bangladesh for in-person consultations and classes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {Array.isArray(branches) && branches.slice(0, 3).map((branch: any) => (
              <Card key={branch.id} className="hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-lg mr-4">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{branch.name}</h3>
                      <p className="text-sm text-gray-500">
                        {branch.isMain ? "Main Branch" : "Regional Branch"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-3" />
                      <p className="text-gray-600">{branch.address}</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <p className="text-gray-600">{branch.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-3" />
                      <p className="text-gray-600">{branch.hours}</p>
                    </div>
                  </div>
                  <Button className="w-full group-hover:bg-red-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
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

      {/* Events */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
              Upcoming Events
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Educational Events & Seminars
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our educational events, workshops, and study abroad fairs to enhance your knowledge and network with experts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {Array.isArray(upcomingEvents) && upcomingEvents.slice(0, 2).map((event: any) => (
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10"></div>
        
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/10 text-white hover:bg-white/20">
              Ready to Start?
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              Your Educational Journey Starts Here
            </h2>
            <p className="text-xl mb-12 text-blue-100 max-w-3xl mx-auto">
              Join thousands of successful students who transformed their futures with our expert guidance. Get started with a free consultation today.
            </p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
              <LeadForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <Phone className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-lg font-semibold mb-2">Call Now</h3>
                <p className="text-blue-200">+880 1777-123456</p>
              </div>
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-lg font-semibold mb-2">WhatsApp</h3>
                <p className="text-blue-200">Instant messaging support</p>
              </div>
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-lg font-semibold mb-2">Book Meeting</h3>
                <p className="text-blue-200">Free consultation</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold">
                <Calendar className="h-5 w-5 mr-2" />
                Book Free Consultation
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                <MessageSquare className="h-5 w-5 mr-2" />
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
