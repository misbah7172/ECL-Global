import { useState, useMemo } from "react";
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
  Trophy
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

// Horizontal Scroll Course Card Component
function HorizontalCourseCard({ course }: { course: any }) {
  return (
    <Card className="flex-shrink-0 w-80 overflow-hidden hover:shadow-xl transition-all duration-300 bg-white">
      <div className="relative">
        <img 
          src={course.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop"} 
          alt={course.title} 
          className="w-full h-44 object-cover"
        />
        {course.isFeatured && (
          <Badge 
            className="absolute top-3 left-3 text-white font-semibold"
            style={{ backgroundColor: COLORS.red }}
          >
            BESTSELLER
          </Badge>
        )}
      </div>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant="outline" 
            className="text-xs"
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
        
        <div className="flex items-center text-sm mb-4" style={{ color: COLORS.darkGrey }}>
          <Clock className="h-4 w-4 mr-1" />
          <span>{course.duration || "8 weeks"}</span>
          <span className="mx-2">•</span>
          <Users className="h-4 w-4 mr-1" />
          <span>{course.enrolledCount || 0}</span>
        </div>
        
        <div className="flex items-center justify-between">
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
            className="text-white font-semibold hover:opacity-90"
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

      {/* Top Banner - Grammar & Writing Course */}
      <section 
        className="relative py-16 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 100%)`
        }}
      >
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <Badge className="mb-4 bg-white/20 text-white border-0 px-4 py-1">
                <Trophy className="h-3 w-3 mr-1" />
                Top Online Grammar & Writing Course in Bangladesh
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Grammar & Writing<br />Course in Bangladesh
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Master English grammar and writing skills with expert instructors and comprehensive curriculum
              </p>
              <Button 
                size="lg"
                className="text-white font-semibold hover:opacity-90"
                style={{ backgroundColor: COLORS.red }}
              >
                Enroll Now
              </Button>
            </div>
            <div className="relative hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Online Learning"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live Courses Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Live Courses
              </h2>
              <p style={{ color: COLORS.darkGrey }}>Join our interactive live sessions</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full w-10 h-10"
                style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full w-10 h-10"
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
        <section className="py-12" style={{ backgroundColor: COLORS.offWhite }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge 
                className="mb-4 text-white font-semibold px-4 py-1"
                style={{ backgroundColor: COLORS.red }}
              >
                <Trophy className="h-4 w-4 mr-2" />
                LIMITED TIME OFFER
              </Badge>
              <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Unbeatable Bundle Offers
              </h2>
              <p style={{ color: COLORS.darkGrey }}>
                ✨ Level your Skill Bundle from the following courses @₹2,799 ✨
              </p>
            </div>

            <div className="flex items-center justify-center mb-6">
              <Button 
                size="sm" 
                className="text-white font-semibold"
                style={{ backgroundColor: COLORS.red }}
              >
                Explore all Bundles
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {bundleOffers.map((course: any) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all bg-white">
                  <div className="relative">
                    <img 
                      src={course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge 
                      className="absolute top-3 right-3 text-white font-bold px-3 py-1"
                      style={{ backgroundColor: COLORS.red }}
                    >
                      SAVE {Math.round((1 - Number(course.price) / Number(course.originalPrice)) * 100)}%
                    </Badge>
                  </div>
                  <CardContent className="p-6">
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
                      className="w-full text-white font-semibold hover:opacity-90"
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
        <section className="py-12 bg-black text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
                <p className="text-gray-400">Handpicked courses that deliver exceptional results</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-white text-white hover:bg-white/10 w-10 h-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-white text-white hover:bg-white/10 w-10 h-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {featuredCourses.map((course: any) => (
                <Card key={course.id} className="flex-shrink-0 w-80 overflow-hidden bg-white snap-start">
                  <div className="relative">
                    <img 
                      src={course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"}
                      alt={course.title}
                      className="w-full h-44 object-cover"
                    />
                    <Badge 
                      className="absolute top-3 left-3 text-white font-semibold"
                      style={{ backgroundColor: COLORS.red }}
                    >
                      FEATURED
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant="outline"
                        className="text-xs"
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
                    
                    <div className="flex items-center text-sm mb-4" style={{ color: COLORS.darkGrey }}>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{course.duration || "8 weeks"}</span>
                      <span className="mx-2">•</span>
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
                        className="text-white font-semibold hover:opacity-90"
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
              Browse Other Courses
            </h2>
            <Button 
              size="sm" 
              className="mt-2 text-white font-semibold"
              style={{ backgroundColor: COLORS.red }}
            >
              Explore all Courses
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
                      className="rounded-full w-10 h-10"
                      style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full w-10 h-10"
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
              How to start
            </h2>
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
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform cursor-pointer"
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
          </div>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
            {/* Add partner logos here if available */}
            <div className="text-gray-400 text-sm">Partner logos will appear here</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
