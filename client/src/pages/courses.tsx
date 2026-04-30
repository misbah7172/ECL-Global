import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  Star,
  Play,
  GraduationCap,
  Award,
  CheckCircle2,
  Video,
  Trophy,
  Sparkles,
  BookOpen,
  BadgeCheck,
  ArrowRight,
  MonitorPlay,
  UsersRound,
} from "lucide-react";

// Color Scheme Constants
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
  gold: '#FFD700',
  red: '#EF4444',
};

const quickGoals = [
  "Grammar & Writing",
  "IELTS Preparation",
  "Study Abroad Guidance",
  "University Admission",
  "Mock Tests",
];

const studentBenefits = [
  "Clear learning paths with practical outcomes",
  "Flexible schedules for busy students",
  "Expert-led lessons with guided progress",
];

// Horizontal Scroll Course Card Component
function HorizontalCourseCard({ course }: { course: any }) {
  return (
    <Card className="flex-shrink-0 w-80 overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-3xl">
      <div className="relative">
        <img 
          src={course.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop"} 
          alt={course.title} 
          className="w-full h-44 object-cover"
        />
        {course.isFeatured && (
          <Badge 
            className="absolute top-3 left-3 text-white font-semibold rounded-full px-3 py-1 shadow-lg"
            style={{ backgroundColor: COLORS.red }}
          >
            BESTSELLER
          </Badge>
        )}
      </div>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant="outline" 
            className="text-xs rounded-full"
            style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
          >
            {course.category?.name || "General"}
          </Badge>
          <div className="flex items-center text-yellow-400">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm ml-1 font-medium" style={{ color: COLORS.darkGrey }}>
              {course.rating || "4.8"}
            </span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: COLORS.deepBlue }}>
          {course.title}
        </h3>
        
        <div className="flex items-center text-sm gap-3 flex-wrap" style={{ color: COLORS.darkGrey }}>
          <Clock className="h-4 w-4 mr-1" />
          <span>{course.duration || "8 weeks"}</span>
          <Users className="h-4 w-4 mr-1" />
          <span>{course.enrolledCount || 0}</span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <span className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
              ৳{Number(course.price).toFixed(0)}
            </span>
            {course.originalPrice && Number(course.originalPrice) > Number(course.price) && (
              <span className="text-sm line-through ml-2" style={{ color: COLORS.darkGrey }}>
                ৳{Number(course.originalPrice).toFixed(0)}
              </span>
            )}
          </div>
          <Button 
            asChild
            size="sm"
            className="text-white font-semibold hover:opacity-90 rounded-full"
            style={{ backgroundColor: COLORS.red }}
          >
            <Link href={`/courses/${course.id}`}>Enroll</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Courses() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses");
      return response.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      return response.json();
    },
  });

  // Group courses by category
  const coursesByCategory = useMemo(() => {
    if (!Array.isArray(courses) || !Array.isArray(categories)) return {};
    
    const grouped: Record<string, any[]> = {};
    categories.forEach((cat: any) => {
      grouped[cat.name] = courses.filter((course: any) => course.categoryId === cat.id);
    });
    return grouped;
  }, [courses, categories]);

  // Featured and live courses
  const featuredCourses = useMemo(() => {
    return Array.isArray(courses) ? courses.filter((c: any) => c.isFeatured).slice(0, 4) : [];
  }, [courses]);

  const liveCourses = useMemo(() => {
    return Array.isArray(courses) ? courses.slice(0, 6) : [];
  }, [courses]);

  const bundleOffers = useMemo(() => {
    return Array.isArray(courses) ? courses.filter((c: any) => c.originalPrice && Number(c.originalPrice) > Number(c.price)).slice(0, 3) : [];
  }, [courses]);

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative w-24 h-24 mb-8">
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: COLORS.skyBlue }}
              />
              <div 
                className="absolute inset-2 rounded-full animate-pulse"
                style={{ backgroundColor: COLORS.midBlue }}
              />
              <div 
                className="absolute inset-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.deepBlue }}
              >
                <GraduationCap className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Loading Courses
              </h3>
              <p style={{ color: COLORS.darkGrey }}>Discovering amazing learning opportunities...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section 
        className="relative overflow-hidden px-4 py-16 md:py-20"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 48%, #EAF6FB 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#FFD700]/20 blur-3xl" />
        </div>
        <div className="container mx-auto">
          <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
            <div className="text-white">
              <Badge className="mb-5 rounded-full border-0 bg-white/15 px-4 py-2 text-white backdrop-blur">
                <Sparkles className="h-3 w-3 mr-1" />
                Student-friendly learning journeys
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight tracking-tight">
                Learn with clarity.
                <br />
                Grow with confidence.
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-xl mb-6">
                Explore courses designed for students who want a simple path, practical lessons, and visible progress from day one.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {studentBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
                    <BadgeCheck className="h-4 w-4 text-[#FFD700]" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg"
                  className="rounded-full px-6 text-white font-semibold hover:opacity-90"
                  style={{ backgroundColor: COLORS.red }}
                >
                  Explore Courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/40 bg-white/10 px-6 text-white hover:bg-white/20"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Learning Paths
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-6 rounded-[2rem] bg-white/20 blur-2xl" />
              <Card className="relative overflow-hidden rounded-[2rem] border-0 bg-white shadow-2xl">
                <div className="grid gap-0">
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=700&fit=crop"
                      alt="Students learning"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow">
                      Guided learning
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
                        <div className="text-xs text-gray-500">Courses</div>
                        <div className="text-lg font-bold" style={{ color: COLORS.deepBlue }}>{courses?.length || 0}+</div>
                      </div>
                      <div className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
                        <div className="text-xs text-gray-500">Categories</div>
                        <div className="text-lg font-bold" style={{ color: COLORS.deepBlue }}>{Array.isArray(categories) ? categories.length : 0}</div>
                      </div>
                      <div className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
                        <div className="text-xs text-gray-500">Live sessions</div>
                        <div className="text-lg font-bold" style={{ color: COLORS.deepBlue }}>Weekly</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 bg-white p-6 sm:grid-cols-3">
                    {quickGoals.map((goal) => (
                      <div key={goal} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                        {goal}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course discovery strip */}
      <section className="border-b bg-white px-4 py-6">
        <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: COLORS.skyBlue }}>
              Find your next course
            </p>
            <h2 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
              Start with the learning goal that fits you best
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickGoals.map((goal, index) => (
              <Badge
                key={goal}
                variant={index === 0 ? "default" : "outline"}
                className="rounded-full px-4 py-2 text-sm"
                style={index === 0 ? { backgroundColor: COLORS.red } : { borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
              >
                {goal}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Live Courses Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-14">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Badge className="mb-3 rounded-full px-4 py-1" style={{ backgroundColor: COLORS.skyBlue }}>
                <MonitorPlay className="h-3 w-3 mr-1" />
                Learn together in real time
              </Badge>
              <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Live Courses
              </h2>
              <p style={{ color: COLORS.darkGrey }}>
                Interactive sessions that help students stay engaged, ask questions, and learn with support.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-full bg-white shadow-sm"
                style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-full bg-white shadow-sm"
                style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {liveCourses.map((course: any) => (
              <HorizontalCourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Unbeatable Bundle Offers */}
      {bundleOffers.length > 0 && (
        <section className="py-14" style={{ backgroundColor: COLORS.offWhite }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 max-w-3xl mx-auto">
              <Badge 
                className="mb-4 rounded-full text-white font-semibold px-4 py-1"
                style={{ backgroundColor: COLORS.red }}
              >
                <Trophy className="h-4 w-4 mr-2" />
                LIMITED TIME OFFER
              </Badge>
              <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Unbeatable Bundle Offers
              </h2>
              <p style={{ color: COLORS.darkGrey }}>
                Curated bundles to help students build skills faster and save on combined enrollment.
              </p>
            </div>

            <div className="flex items-center justify-center mb-6">
              <Button 
                size="sm" 
                className="rounded-full text-white font-semibold"
                style={{ backgroundColor: COLORS.red }}
              >
                Explore all Bundles
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {bundleOffers.map((course: any) => (
                <Card key={course.id} className="overflow-hidden rounded-3xl border-0 bg-white shadow-lg hover:shadow-2xl transition-all">
                  <div className="relative">
                    <img 
                      src={course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge 
                      className="absolute top-3 right-3 rounded-full text-white font-bold px-3 py-1 shadow-lg"
                      style={{ backgroundColor: COLORS.red }}
                    >
                      SAVE {Math.round((1 - Number(course.price) / Number(course.originalPrice)) * 100)}%
                    </Badge>
                  </div>
                  <CardContent className="space-y-4 p-6">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2" style={{ color: COLORS.deepBlue }}>
                      {course.title}
                    </h3>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start text-sm" style={{ color: COLORS.darkGrey }}>
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        Lifetime Access
                      </li>
                      <li className="flex items-start text-sm" style={{ color: COLORS.darkGrey }}>
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        Expert Instruction
                      </li>
                      <li className="flex items-start text-sm" style={{ color: COLORS.darkGrey }}>
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        Certificate of Completion
                      </li>
                    </ul>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-bold" style={{ color: COLORS.deepBlue }}>
                        ৳{Number(course.price).toFixed(0)}
                      </span>
                      <span className="text-lg line-through" style={{ color: COLORS.darkGrey }}>
                        ৳{Number(course.originalPrice).toFixed(0)}
                      </span>
                    </div>
                    <Button 
                      asChild
                      className="w-full rounded-full text-white font-semibold hover:opacity-90"
                      style={{ backgroundColor: COLORS.red }}
                    >
                      <Link href={`/courses/${course.id}`}>Buy Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-14 bg-slate-950 text-white">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
                <p className="text-gray-400">Handpicked courses that feel approachable, structured, and student-ready.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 rounded-full border-white bg-white/5 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 rounded-full border-white bg-white/5 text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {featuredCourses.map((course: any) => (
                <Card key={course.id} className="flex-shrink-0 w-80 overflow-hidden rounded-3xl border-0 bg-white snap-start shadow-xl">
                  <div className="relative">
                    <img 
                      src={course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"}
                      alt={course.title}
                      className="w-full h-44 object-cover"
                    />
                    <Badge 
                      className="absolute top-3 left-3 rounded-full text-white font-semibold"
                      style={{ backgroundColor: COLORS.red }}
                    >
                      FEATURED
                    </Badge>
                  </div>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant="outline"
                        className="text-xs rounded-full"
                        style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                      >
                        {course.category?.name || "Featured"}
                      </Badge>
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm ml-1 font-medium" style={{ color: COLORS.darkGrey }}>
                          {course.rating || "4.9"}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: COLORS.deepBlue }}>
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center text-sm gap-3 flex-wrap mb-4" style={{ color: COLORS.darkGrey }}>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{course.duration || "8 weeks"}</span>
                      <Users className="h-4 w-4 mr-1" />
                      <span>{course.enrolledCount || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
                          ৳{Number(course.price).toFixed(0)}
                        </span>
                      </div>
                      <Button 
                        asChild
                        size="sm"
                        className="rounded-full text-white font-semibold hover:opacity-90"
                        style={{ backgroundColor: COLORS.red }}
                      >
                        <Link href={`/courses/${course.id}`}>Enroll</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse Other Courses by Category */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
              Browse Other Courses
            </h2>
            <p className="text-gray-600 mb-4">Browse categories to find a course that matches your current level and goals.</p>
            <Button 
              size="sm" 
              className="mt-2 rounded-full text-white font-semibold"
              style={{ backgroundColor: COLORS.red }}
            >
              Explore all Courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {Array.isArray(categories) && categories.slice(0, 3).map((category: any) => {
            const categoryCourses = coursesByCategory[category.name] || [];
            if (categoryCourses.length === 0) return null;

            return (
              <div key={category.id} className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
                    {category.name}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-11 w-11 rounded-full bg-white shadow-sm"
                      style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-11 w-11 rounded-full bg-white shadow-sm"
                      style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                  {categoryCourses.slice(0, 4).map((course: any) => (
                    <HorizontalCourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How to Start Section */}
      <section className="py-16" style={{ backgroundColor: COLORS.offWhite }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
              How to start
            </h2>
            <p className="text-gray-600">
              A simple path from discovering a course to earning a certificate.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: GraduationCap,
                title: "Sign up",
                description: "Create your account and set up your profile to get personalized course recommendations"
              },
              {
                icon: Video,
                title: "Select a course",
                description: "Browse our extensive catalog and choose courses that match your learning goals"
              },
              {
                icon: Play,
                title: "Start learning",
                description: "Access high-quality video lessons and interactive content at your own pace"
              },
              {
                icon: Award,
                title: "Get certificate",
                description: "Complete courses and earn certificates to showcase your new skills"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform cursor-pointer shadow-lg"
                  style={{ backgroundColor: COLORS.red }}
                >
                  <step.icon className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                  {step.title}
                </h3>
                <p className="text-sm" style={{ color: COLORS.darkGrey }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="py-12 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
              Our Partners
            </h2>
            <p className="text-gray-600 mt-2">Universities and organizations that support our students' journeys.</p>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap opacity-80">
            <div className="rounded-full border px-4 py-2 text-sm font-medium text-gray-500">Partner logos will appear here</div>
            <div className="rounded-full border px-4 py-2 text-sm font-medium text-gray-500">Student support network</div>
            <div className="rounded-full border px-4 py-2 text-sm font-medium text-gray-500">Global university pathways</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
