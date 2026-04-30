import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StudyAbroadService } from "../../../shared/types";
import { 
  Globe, 
  MapPin, 
  Clock, 
  Star, 
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  TrendingUp,
  Heart,
  Shield,
  Plane,
  BookOpen,
  GraduationCap,
  Target,
  ChevronRight,
  FileCheck
} from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

export default function StudyAbroadServices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/study-abroad-services", { search: searchTerm, serviceType: selectedType }],
    queryFn: async (): Promise<StudyAbroadService[]> => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedType) params.append("serviceType", selectedType);
      
      const response = await fetch(`/api/study-abroad-services?${params}`);
      return response.json();
    },
  });

  const serviceTypes = [
    "University Admission",
    "Visa Processing", 
    "Scholarship Guidance",
    "Study Permit",
    "Career Counseling",
    "Test Preparation",
    "Document Verification",
    "Pre-departure Support"
  ];

  const featuredServices = services.filter((service: StudyAbroadService) => service.isFeatured);
  const popularServices = services.filter((service: StudyAbroadService) => service.isPopular);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative py-24 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 50%, ${COLORS.skyBlue} 100%)`
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 border-4 border-white rounded-full"></div>
          <Plane className="absolute top-10 right-1/4 h-16 w-16 text-white opacity-20 transform rotate-45" />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">
                Study Abroad Services
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Your gateway to international education. Expert guidance for every step of your study abroad journey.
            </p>
            
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
              {[
                { value: "50+", label: "Countries" },
                { value: "500+", label: "Universities" },
                { value: "1000+", label: "Students Placed" },
                { value: "98%", label: "Visa Success" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="h-14 px-8 text-white font-semibold shadow-xl"
                style={{ backgroundColor: COLORS.skyBlue }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
              >
                <Globe className="mr-2 h-5 w-5" />
                Explore Services
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
                <Users className="mr-2 h-5 w-5" />
                Free Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 bg-white shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex-1 relative w-full lg:max-w-md">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                style={{ color: COLORS.darkGrey }}
              />
              <Input
                placeholder="Search study abroad services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 rounded-lg"
                style={{ borderColor: COLORS.skyBlue }}
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button 
                variant={selectedType === "" ? "default" : "outline"}
                onClick={() => setSelectedType("")}
                className={`font-medium transition-all ${
                  selectedType === "" ? 'text-white shadow-md' : ''
                }`}
                style={{
                  backgroundColor: selectedType === "" ? COLORS.skyBlue : COLORS.offWhite,
                  color: selectedType === "" ? 'white' : COLORS.darkGrey,
                  borderColor: COLORS.skyBlue
                }}
              >
                All Services
              </Button>
              {serviceTypes.slice(0, 4).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                  className={`font-medium transition-all ${
                    selectedType === type ? 'text-white shadow-md' : ''
                  }`}
                  style={{
                    backgroundColor: selectedType === type ? COLORS.skyBlue : COLORS.offWhite,
                    color: selectedType === type ? 'white' : COLORS.darkGrey,
                    borderColor: COLORS.skyBlue
                  }}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Active Filter Badge */}
          {(searchTerm || selectedType) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: COLORS.darkGrey }}>Active Filters:</span>
              {searchTerm && (
                <Badge 
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer"
                  style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}
                  onClick={() => setSearchTerm("")}
                >
                  "{searchTerm}" ✕
                </Badge>
              )}
              {selectedType && (
                <Badge 
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer"
                  style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}
                  onClick={() => setSelectedType("")}
                >
                  {selectedType} ✕
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <Badge 
                className="mb-4 px-4 py-2 text-white font-semibold"
                style={{ backgroundColor: COLORS.skyBlue }}
              >
                <Star className="h-4 w-4 mr-2 inline" />
                Featured Services
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>
                Most Popular Services
              </h2>
              <p className="text-lg" style={{ color: COLORS.darkGrey }}>
                Our most comprehensive and sought-after study abroad solutions
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service: StudyAbroadService) => (
                <ServiceCard key={service.id} service={service} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>
              Complete Service Portfolio
            </h2>
            <p className="text-lg" style={{ color: COLORS.darkGrey }}>
              Comprehensive study abroad services tailored to your unique journey
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="rounded-xl h-80" style={{ backgroundColor: COLORS.offWhite }}></div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto bg-white rounded-2xl p-12 shadow-lg" style={{ backgroundColor: COLORS.offWhite }}>
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                >
                  <Search className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>
                  No Services Found
                </h3>
                <p className="mb-6" style={{ color: COLORS.darkGrey }}>
                  No services match your search criteria. Try adjusting your filters.
                </p>
                <Button
                  onClick={() => { setSearchTerm(""); setSelectedType(""); }}
                  className="text-white font-semibold"
                  style={{ backgroundColor: COLORS.skyBlue }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service: StudyAbroadService) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      Why Choose Us Section
      <section className="py-16" style={{ backgroundColor: COLORS.offWhite }}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>
              Why Choose ECL Global?
            </h2>
            <p className="text-lg" style={{ color: COLORS.darkGrey }}>
              Your trusted partner in international education
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "15+ Years Experience",
                description: "Proven track record of successfully placing 10,000+ students in top universities worldwide."
              },
              {
                icon: Target,
                title: "95% Visa Success Rate",
                description: "Industry-leading visa approval rate backed by expert guidance and comprehensive documentation support."
              },
              {
                icon: Users,
                title: "Personalized Counseling",
                description: "One-on-one guidance from certified counselors tailored to your academic goals and career aspirations."
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="p-8 bg-white rounded-xl text-center hover:shadow-xl transition-all duration-300"
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
          <GraduationCap className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Study Abroad Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Get personalized guidance from our expert counselors and take the first step towards your dream education abroad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="h-14 px-8 text-white font-semibold shadow-xl"
              style={{ backgroundColor: COLORS.skyBlue }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
            >
              Book Free Consultation
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
              Download Service Brochure
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ServiceCard({ service, featured = false }: { service: StudyAbroadService; featured?: boolean }) {
  const getServiceIcon = (serviceType: string) => {
    const iconColor = COLORS.skyBlue;
    switch (serviceType) {
      case "University Admission":
        return <Award className="h-8 w-8" style={{ color: iconColor }} />;
      case "Visa Processing":
        return <Shield className="h-8 w-8" style={{ color: iconColor }} />;
      case "Scholarship Guidance":
        return <Star className="h-8 w-8" style={{ color: iconColor }} />;
      case "Study Permit":
        return <CheckCircle className="h-8 w-8" style={{ color: iconColor }} />;
      case "Career Counseling":
        return <TrendingUp className="h-8 w-8" style={{ color: iconColor }} />;
      case "Test Preparation":
        return <BookOpen className="h-8 w-8" style={{ color: iconColor }} />;
      case "Document Verification":
        return <FileCheck className="h-8 w-8" style={{ color: iconColor }} />;
      default:
        return <Globe className="h-8 w-8" style={{ color: iconColor }} />;
    }
  };

  return (
    <Card 
      className={`hover:shadow-2xl transition-all duration-300 h-full border-0 ${
        featured ? 'ring-2' : ''
      }`}
      style={{
        backgroundColor: 'white',
        borderColor: featured ? COLORS.skyBlue : 'transparent'
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${COLORS.skyBlue}20` }}
            >
              {getServiceIcon(service.serviceType)}
            </div>
            <div>
              <CardTitle className="text-lg font-bold" style={{ color: COLORS.deepBlue }}>
                {service.title}
              </CardTitle>
              <Badge 
                variant="outline" 
                className="text-xs mt-1"
                style={{ 
                  backgroundColor: `${COLORS.skyBlue}10`,
                  color: COLORS.midBlue,
                  borderColor: COLORS.skyBlue
                }}
              >
                {service.serviceType}
              </Badge>
            </div>
          </div>
          {featured && (
            <Badge 
              className="text-white font-semibold"
              style={{ backgroundColor: COLORS.skyBlue }}
            >
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 line-clamp-3 leading-relaxed" style={{ color: COLORS.darkGrey }}>
          {service.shortDesc || service.description}
        </p>
        
        {service.features && service.features.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2" style={{ color: COLORS.deepBlue }}>Key Features:</h4>
            <ul className="text-sm space-y-2" style={{ color: COLORS.darkGrey }}>
              {service.features.slice(0, 3).map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: COLORS.skyBlue }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: COLORS.offWhite }}>
          <div className="flex items-center gap-4 text-sm" style={{ color: COLORS.darkGrey }}>
            {service.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{service.duration}</span>
              </div>
            )}
            {service.countries && service.countries.length > 0 && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{service.countries.length} Countries</span>
              </div>
            )}
          </div>
          <Link href={`/study-abroad-services/${service.slug}`}>
            <Button 
              size="sm"
              className="text-white font-semibold"
              style={{ backgroundColor: COLORS.skyBlue }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
            >
              Learn More
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
