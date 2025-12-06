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

  // Team Members
  const team = [
    {
      id: 1,
      name: "Dr. Ahmed Rahman",
      role: "Chief Education Consultant",
      specialization: "Study Abroad Expert - USA & Canada",
      experience: "15+ Years Experience",
      credentials: "PhD in Education, Cambridge Certified",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Helped 3,000+ students secure admissions to top universities including Harvard, MIT, and Stanford."
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Senior Test Prep Specialist",
      specialization: "IELTS & TOEFL Expert",
      experience: "12+ Years Experience",
      credentials: "CELTA & DELTA Certified",
      imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b193?w=400&h=400&fit=crop&crop=face",
      bio: "Average student score improvement: IELTS Band 7.5+. Trained over 5,000 students with 98% success rate."
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Visa & Immigration Consultant",
      specialization: "Student Visa Expert",
      experience: "10+ Years Experience",
      credentials: "Licensed Immigration Consultant",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "98% visa approval rate across USA, UK, Canada, and Australia. Successfully handled 4,500+ visa applications."
    },
    {
      id: 4,
      name: "Dr. Priya Sharma",
      role: "Career Counseling Director",
      specialization: "Academic & Career Pathways",
      experience: "14+ Years Experience",
      credentials: "PhD in Career Psychology",
      imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face",
      bio: "Specialized in matching students with perfect career paths. Over 2,000 successful career transitions."
    }
  ];

  // Testimonials with photos
  const testimonials = [
    {
      id: 1,
      name: "Rashid Ahmed",
      achievement: "IELTS Band 8.5 → University of Toronto",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "The personalized guidance and expert coaching helped me achieve my dream score. The team's dedication is unmatched. I'm now pursuing Computer Science at my dream university!",
      course: "IELTS Preparation",
      rating: 5
    },
    {
      id: 2,
      name: "Fatima Khan",
      achievement: "SAT 1550 → MIT",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b193?w=150&h=150&fit=crop&crop=face",
      quote: "The strategic approach and comprehensive materials made all the difference. The mock tests were incredibly accurate. ECL Global made my MIT dream a reality!",
      course: "SAT Preparation",
      rating: 5
    },
    {
      id: 3,
      name: "Arif Hassan",
      achievement: "Successful Visa → University of Melbourne",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      quote: "From application to visa approval, the support was exceptional. They handled everything professionally and I got my visa on the first attempt. Highly recommended!",
      course: "Study Abroad Consulting",
      rating: 5
    },
    {
      id: 4,
      name: "Nadia Islam",
      achievement: "TOEFL 118 → Stanford University",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "Outstanding instructors and world-class resources. The personalized study plan was exactly what I needed. Now I'm at Stanford thanks to ECL Global!",
      course: "TOEFL Preparation",
      rating: 5
    },
    {
      id: 5,
      name: "Karim Mahmud",
      achievement: "GRE 330 → Harvard Business School",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      quote: "The quality of instruction exceeded my expectations. Small class sizes meant individual attention. My dream of Harvard is now a reality!",
      course: "GRE Preparation",
      rating: 5
    }
  ];

  // Services/Key Offerings
  const services = [
    {
      icon: ClipboardCheck,
      title: "Test Preparation",
      description: "Expert coaching for IELTS, TOEFL, SAT, GRE, GMAT with guaranteed score improvement",
      features: [
        "Personal mentoring from certified experts",
        "Comprehensive practice tests & materials",
        "Score improvement guarantee",
        "Flexible online & offline classes"
      ],
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop"
    },
    {
      icon: Globe,
      title: "Study Abroad Consulting",
      description: "End-to-end guidance for studying at top universities worldwide",
      features: [
        "University selection & application",
        "Visa assistance (98% success rate)",
        "Scholarship guidance",
        "Pre-departure orientation"
      ],
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
    },
    {
      icon: Briefcase,
      title: "Career Counseling",
      description: "Professional career guidance aligned with your academic goals",
      features: [
        "Career assessment & planning",
        "Resume building & interview prep",
        "Job placement assistance",
        "Industry networking opportunities"
      ],
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop"
    },
    {
      icon: Languages,
      title: "Language Training",
      description: "Comprehensive language courses for academic and professional success",
      features: [
        "Speaking & pronunciation practice",
        "Grammar & vocabulary mastery",
        "Academic writing skills",
        "Business English training"
      ],
      image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop"
    }
  ];

  // Trust indicators
  const trustBadges = [
    { name: "British Council Partner", logo: "🇬🇧" },
    { name: "Cambridge Certified", logo: "📜" },
    { name: "IDP Education Partner", logo: "🎓" },
    { name: "15+ Years Excellence", logo: "🏆" }
  ];

  // FAQs
  const faqs = [
    {
      question: "What makes ECL Global different from other consultancies?",
      answer: "We offer personalized attention with a proven track record of 15,000+ successful placements, 98% visa approval rate, and partnerships with 50+ top universities worldwide. Our team consists of certified experts with decades of combined experience."
    },
    {
      question: "What is your visa success rate?",
      answer: "We maintain a 98% visa approval rate across all countries including USA, UK, Canada, Australia, and Europe. Our expert counselors ensure all documentation is perfect and provide comprehensive interview preparation."
    },
    {
      question: "Do you offer a score improvement guarantee?",
      answer: "Yes! We guarantee score improvement for all our test preparation programs. If you don't achieve the promised improvement, we offer additional coaching sessions at no extra cost."
    },
    {
      question: "Can I get a scholarship to study abroad?",
      answer: "Absolutely! We have dedicated scholarship counselors who help identify and apply for various scholarships, grants, and financial aid options. Many of our students receive partial to full scholarships."
    },
    {
      question: "What countries do you provide services for?",
      answer: "We provide comprehensive study abroad services for USA, UK, Canada, Australia, Germany, Netherlands, Sweden, Ireland, New Zealand, and 15+ other countries."
    },
    {
      question: "Do you offer online classes?",
      answer: "Yes, we offer both online and offline classes with live interactive sessions, recorded lectures, and 24/7 learning platform access for maximum flexibility."
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
              {/* Trust Badge */}
              <div className="flex flex-wrap gap-3">
                {trustBadges.map((badge, index) => (
                  <Badge key={index} className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                    <span className="mr-2">{badge.logo}</span>
                    {badge.name}
                  </Badge>
                ))}
              </div>

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
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden cursor-pointer"
                onClick={() => setActiveService(index)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <service.icon className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>
                    {service.title}
                  </h3>
                  <p className="mb-6" style={{ color: COLORS.darkGrey }}>
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
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
                  >
                    Learn More
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
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
            {testimonials.slice(0, 3).map((testimonial) => (
              <Card key={testimonial.id} className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                  
                  {/* Student Info */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2"
                      style={{ borderColor: COLORS.skyBlue }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: COLORS.deepBlue }}>
                        {testimonial.name}
                      </h4>
                      <p className="text-sm font-medium" style={{ color: COLORS.skyBlue }}>
                        {testimonial.achievement}
                      </p>
                      <p className="text-xs" style={{ color: COLORS.darkGrey }}>
                        {testimonial.course}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            {team.map((member) => (
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
            ))}
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
                    description: "Customized study plans and one-on-one mentoring tailored to your unique goals."
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

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-lg px-6 border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger 
                  className="text-left font-semibold hover:no-underline"
                  style={{ color: COLORS.deepBlue }}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent style={{ color: COLORS.darkGrey }}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

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
