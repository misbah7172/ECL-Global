import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import StatsSection from "@/components/stats-section";
import CourseCard from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Globe, 
  Star, 
  Users, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Phone,
  Trophy,
  Target,
  Award,
  Shield,
  Play,
  ChevronRight,
  GraduationCap,
  Briefcase,
  MessageSquare,
  FileText,
  Headphones,
  BookOpen,
  TrendingUp,
  Languages,
  ClipboardCheck,
  ChevronDown,
  Mail,
  Clock,
  Building
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Helper function to get icon for service type
function getServiceIcon(serviceType: string) {
  const iconMap: { [key: string]: any } = {
    "University Admission": ClipboardCheck,
    "Visa Processing": Globe,
    "Scholarship Guidance": Trophy,
    "Career Counseling": Briefcase,
    "Language Training": Languages,
  };
  return iconMap[serviceType] || Award;
}

function getServiceImage(serviceType: string, defaultImage: string) {
  const imageMap: { [key: string]: string } = {
    "University Admission": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop",
    "Visa Processing": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
    "Scholarship Guidance": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
    "Career Counseling": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
    "Language Training": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop",
  };
  return imageMap[serviceType] || defaultImage;
}

// Color Scheme Constants
const COLORS = {
  deepBlue: '#1C4E9C',      // Primary Brand Color
  skyBlue: '#33A9D9',       // Call-to-Action/Accent Color
  midBlue: '#2A7CCD',       // Hover/Secondary Accent Color
  darkGrey: '#4F4F4F',      // Body Text/Secondary Headings
  offWhite: '#F8F8F8',      // Background Color
};

export default function HomeRedesigned() {
  const [activeService, setActiveService] = useState(0);

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

  const { data: services = [] } = useQuery({
    queryKey: ["/api/study-abroad-services"],
    queryFn: async () => {
      const response = await fetch("/api/study-abroad-services");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/reviews", { featured: true }],
    queryFn: async () => {
      const response = await fetch("/api/reviews?featured=true&limit=6");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: team = [] } = useQuery({
    queryKey: ["/api/team"],
    queryFn: async () => {
      const response = await fetch("/api/team");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Team Members (fallback - will be replaced by API data)
  const teamStatic = [
    {
      id: 1,
      name: "Dr. Ahmed Rahman",
      role: "Chief Education Consultant",
      specialization: "Study Abroad Expert - USA & Canada",
      experience: "15+ Years Experience",
      credentials: "PhD in Education, Cambridge Certified",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Helped 3,000+ students secure admissions to top universities including Harvard, MIT, and Stanford."
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <Header />
      </div>
      
      {/* Hero Section with Value Proposition */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C4E9C] via-[#2A7CCD] to-[#33A9D9]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div className="text-white space-y-8">


              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Your Passport to
                <span className="block" style={{ color: COLORS.skyBlue }}>
                  Academic Adventure
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed">
                Bangladesh's #1 Study Abroad Consultant. Transform your global education dreams into reality with expert guidance, proven results, and personalized support.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 py-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: COLORS.skyBlue }}>15K+</div>
                  <div className="text-sm text-blue-200">Students Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">98%</div>
                  <div className="text-sm text-blue-200">Visa Success</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">50+</div>
                  <div className="text-sm text-blue-200">Universities</div>
                </div>
              </div>
              
              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-white font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  style={{ backgroundColor: COLORS.skyBlue }}
                  asChild
                >
                  <Link href="/register">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Free Consultation
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-[#1C4E9C] font-semibold"
                  asChild
                >
                  <Link href="#services">
                    <Play className="h-5 w-5 mr-2" />
                    Explore Services
                  </Link>
                </Button>
              </div>

              {/* Contact Options */}
              <div className="flex gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <Phone className="h-4 w-4" />
                  <span>+880 1777-123456</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Chat</span>
                </div>
              </div>
            </div>
            
            {/* Lead Form Card */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl opacity-20 blur-3xl" style={{ background: `linear-gradient(to right, ${COLORS.skyBlue}, ${COLORS.midBlue})` }}></div>
              <Card className="relative bg-white shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-center" style={{ color: COLORS.deepBlue }}>
                    Start Your Journey Today
                  </CardTitle>
                  <p className="text-center text-sm" style={{ color: COLORS.darkGrey }}>
                    Get personalized guidance from our experts
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33A9D9] focus:border-transparent"
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33A9D9] focus:border-transparent"
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33A9D9] focus:border-transparent"
                    />
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33A9D9] focus:border-transparent">
                      <option>Select Service</option>
                      <option>IELTS Preparation</option>
                      <option>SAT Preparation</option>
                      <option>Study Abroad Consulting</option>
                      <option>Career Counseling</option>
                    </select>
                  </div>
                  <Button 
                    className="w-full font-semibold text-white"
                    style={{ backgroundColor: COLORS.skyBlue }}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Free Consultation
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    <CheckCircle className="h-3 w-3 inline mr-1 text-green-500" />
                    No commitment required. Free expert advice.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white" />
        </div>
      </section>

      {/* Services Section with Card UI */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4" style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}>
              Our Services
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: COLORS.deepBlue }}>
              Comprehensive Solutions for Your Success
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: COLORS.darkGrey }}>
              From test preparation to visa approval, we provide end-to-end support for your educational journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service: any, index: number) => {
              const IconComponent = getServiceIcon(service.serviceType);
              const imageUrl = getServiceImage(service.serviceType, service.imageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop");
              const featureList = Array.isArray(service.features) ? service.features : [];
              
              return (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden cursor-pointer"
                onClick={() => setActiveService(index)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <IconComponent className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>
                    {service.title}
                  </h3>
                  <p className="mb-6" style={{ color: COLORS.darkGrey }}>
                    {service.shortDesc || service.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {featureList.slice(0, 4).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: COLORS.skyBlue }} />
                        <span style={{ color: COLORS.darkGrey }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:text-white transition-colors"
                    style={{ 
                      borderColor: COLORS.skyBlue,
                      color: COLORS.deepBlue
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    asChild
                  >
                    <Link href="/study-abroad-services">
                      Learn More
                      <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonial Slider/Carousel */}
      <section className="py-20" style={{ backgroundColor: COLORS.offWhite }}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-50 text-green-700">
              <Star className="h-4 w-4 mr-2" />
              Student Success Stories
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: COLORS.deepBlue }}>
              Real Students, Real Success
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: COLORS.darkGrey }}>
              See how our personalized guidance helped students achieve their dreams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.slice(0, 3).length > 0 ? reviews.slice(0, 3).map((review: any) => (
              <Card key={review.id} className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i: number) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-gray-700 italic mb-6">"{review.comment}"</p>
                  
                  {/* Student Info */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={review.studentAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"} 
                      alt={review.studentName}
                      className="w-16 h-16 rounded-full object-cover border-2"
                      style={{ borderColor: COLORS.skyBlue }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: COLORS.deepBlue }}>
                        {review.studentName}
                      </h4>
                      <p className="text-sm font-medium" style={{ color: COLORS.skyBlue }}>
                        {review.title}
                      </p>
                      <p className="text-xs" style={{ color: COLORS.darkGrey }}>
                        {review.courseName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center py-12">
                <p style={{ color: COLORS.darkGrey }}>No approved student reviews yet. Check back soon for featured student success stories!</p>
              </div>
            )}
          </div>

          {/* Show More Testimonials */}
          <div className="mt-12 text-center">
            <Button 
              variant="outline"
              style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
            >
              View All Success Stories
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4" style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}>
              <Users className="h-4 w-4 mr-2" />
              Our Expert Team
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: COLORS.deepBlue }}>
              Meet Your Success Partners
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: COLORS.darkGrey }}>
              Our team of certified experts brings decades of experience to help you achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.length > 0 ? team.map((member: any) => (
              <Card key={member.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={member.imageUrl} 
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm">{member.bio}</p>
                  </div>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                    {member.name}
                  </h3>
                  <p className="font-semibold mb-2" style={{ color: COLORS.skyBlue }}>
                    {member.role}
                  </p>
                  <p className="text-sm mb-2" style={{ color: COLORS.darkGrey }}>
                    {member.specialization}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-3">
                    <Award className="h-4 w-4" />
                    <span>{member.experience}</span>
                  </div>
                  <Badge variant="outline" style={{ borderColor: COLORS.skyBlue, color: COLORS.deepBlue }}>
                    {member.credentials}
                  </Badge>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center py-12">
                <p style={{ color: COLORS.darkGrey }}>Team members will be added by admin. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20" style={{ backgroundColor: COLORS.offWhite }}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4" style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}>
                Why Choose ECL Global
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: COLORS.deepBlue }}>
                Your Trust is Our Foundation
              </h2>
              <p className="text-xl mb-8" style={{ color: COLORS.darkGrey }}>
                15+ years of excellence, 15,000+ successful placements, and 98% visa approval rate make us Bangladesh's most trusted educational consultancy.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "98% Visa Success Rate",
                    description: "Our expert counselors ensure perfect documentation and comprehensive interview preparation."
                  },
                  {
                    icon: Trophy,
                    title: "15,000+ Successful Placements",
                    description: "Students placed in Harvard, MIT, Stanford, Oxford, Cambridge, and 50+ top universities."
                  },
                  {
                    icon: Target,
                    title: "Personalized Guidance",
                    description: "Customized study plans and one-on-one ECL Globaling tailored to your unique goals."
                  },
                  {
                    icon: Headphones,
                    title: "24/7 Support",
                    description: "Round-the-clock assistance from our expert team whenever you need help."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${COLORS.skyBlue}20` }}>
                      <feature.icon className="h-6 w-6" style={{ color: COLORS.deepBlue }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.deepBlue }}>
                        {feature.title}
                      </h3>
                      <p style={{ color: COLORS.darkGrey }}>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl opacity-20 blur-3xl" style={{ background: `linear-gradient(to right, ${COLORS.skyBlue}, ${COLORS.midBlue})` }}></div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop" 
                alt="Students studying" 
                className="relative rounded-2xl shadow-2xl w-full"
              />
              
              {/* Trust Indicator Overlay */}
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: COLORS.skyBlue }}>
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>15+</div>
                    <div className="text-sm" style={{ color: COLORS.darkGrey }}>Years Excellence</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge style={{ backgroundColor: COLORS.skyBlue }} className="text-white">
                    British Council Partner
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Badge className="mb-4" style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}>
                Popular Courses
              </Badge>
              <h2 className="text-4xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>
                Start Your Preparation
              </h2>
              <p style={{ color: COLORS.darkGrey }}>Expert-led courses with proven results</p>
            </div>
            <Button 
              variant="outline" 
              asChild
              style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
            >
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

      {/* FAQ Accordion */}
      <section className="py-20" style={{ backgroundColor: COLORS.offWhite }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <Badge className="mb-4" style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}>
              Frequently Asked Questions
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: COLORS.deepBlue }}>
              Got Questions? We Have Answers
            </h2>
            <p className="text-xl" style={{ color: COLORS.darkGrey }}>
              Everything you need to know about our services
            </p>
          </div>

          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p style={{ color: COLORS.darkGrey }} className="mb-4">
              FAQs will be added and managed by admin. Check back soon for frequently asked questions and answers!
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4" style={{ color: COLORS.darkGrey }}>
              Still have questions?
            </p>
            <Button 
              style={{ backgroundColor: COLORS.skyBlue }}
              className="text-white"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Contact Our Experts
            </Button>
          </div>
        </div>
      </section>

      {/* Fixed/Floating CTA Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          size="lg"
          className="rounded-full shadow-2xl text-white font-semibold animate-pulse hover:animate-none"
          style={{ backgroundColor: COLORS.skyBlue }}
          asChild
        >
          <Link href="/register">
            <Calendar className="h-5 w-5 mr-2" />
            Book Free Consultation
          </Link>
        </Button>
      </div>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-[#1C4E9C] to-[#2A7CCD] text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "15,000+", label: "Students Placed", icon: Users },
              { number: "98%", label: "Visa Success Rate", icon: Trophy },
              { number: "50+", label: "Partner Universities", icon: Building },
              { number: "25+", label: "Countries", icon: Globe }
            ].map((stat, index) => (
              <div key={index} className="space-y-3">
                <stat.icon className="h-12 w-12 mx-auto" style={{ color: COLORS.skyBlue }} />
                <div className="text-4xl lg:text-5xl font-bold">{stat.number}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge className="mb-6" style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}>
            Ready to Start?
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: COLORS.deepBlue }}>
            Begin Your Journey Today
          </h2>
          <p className="text-xl mb-12" style={{ color: COLORS.darkGrey }}>
            Join 15,000+ successful students who transformed their futures with ECL Global
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-xl" style={{ backgroundColor: COLORS.offWhite }}>
              <Phone className="h-10 w-10 mx-auto mb-4" style={{ color: COLORS.skyBlue }} />
              <h3 className="font-semibold mb-2" style={{ color: COLORS.deepBlue }}>Call Us</h3>
              <p className="text-sm" style={{ color: COLORS.darkGrey }}>+880 1777-123456</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: COLORS.offWhite }}>
              <MessageSquare className="h-10 w-10 mx-auto mb-4" style={{ color: COLORS.skyBlue }} />
              <h3 className="font-semibold mb-2" style={{ color: COLORS.deepBlue }}>WhatsApp</h3>
              <p className="text-sm" style={{ color: COLORS.darkGrey }}>Instant Support</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: COLORS.offWhite }}>
              <Mail className="h-10 w-10 mx-auto mb-4" style={{ color: COLORS.skyBlue }} />
              <h3 className="font-semibold mb-2" style={{ color: COLORS.deepBlue }}>Email Us</h3>
              <p className="text-sm" style={{ color: COLORS.darkGrey }}>info@eclglobal.com</p>
            </div>
          </div>

          <Button 
            size="lg"
            className="text-white font-semibold shadow-xl hover:shadow-2xl"
            style={{ backgroundColor: COLORS.skyBlue }}
            asChild
          >
            <Link href="/register">
              <Calendar className="h-5 w-5 mr-2" />
              Book Your Free Consultation Now
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
