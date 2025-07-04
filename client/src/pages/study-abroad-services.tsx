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
  Shield
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Study Abroad Services
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your gateway to international education. Expert guidance for every step of your study abroad journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Globe className="mr-2 h-5 w-5" />
              Explore Services
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Users className="mr-2 h-5 w-5" />
              Free Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={selectedType === "" ? "default" : "outline"}
                onClick={() => setSelectedType("")}
                size="sm"
              >
                All Services
              </Button>
              {serviceTypes.slice(0, 4).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                  size="sm"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Services</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our most popular and comprehensive study abroad services
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">All Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete range of study abroad services tailored to your needs
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No services found matching your criteria.</p>
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get personalized guidance from our expert counselors and take the first step towards your dream education.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Book Free Consultation
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ServiceCard({ service, featured = false }: { service: StudyAbroadService; featured?: boolean }) {
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "University Admission":
        return <Award className="h-8 w-8 text-blue-600" />;
      case "Visa Processing":
        return <Shield className="h-8 w-8 text-green-600" />;
      case "Scholarship Guidance":
        return <Star className="h-8 w-8 text-yellow-600" />;
      case "Study Permit":
        return <CheckCircle className="h-8 w-8 text-purple-600" />;
      case "Career Counseling":
        return <TrendingUp className="h-8 w-8 text-red-600" />;
      default:
        return <Globe className="h-8 w-8 text-blue-600" />;
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${featured ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getServiceIcon(service.serviceType)}
            <div>
              <CardTitle className="text-xl">{service.title}</CardTitle>
              <Badge variant="outline" className="text-xs mt-1">
                {service.serviceType}
              </Badge>
            </div>
          </div>
          {featured && (
            <Badge className="bg-yellow-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {service.shortDesc || service.description}
        </p>
        
        {service.features && service.features.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {service.features.slice(0, 3).map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {service.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.duration}
              </div>
            )}
            {service.countries && service.countries.length > 0 && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {service.countries.length} Countries
              </div>
            )}
          </div>
          <Link href={`/study-abroad-services/${service.slug}`}>
            <Button size="sm">
              Learn More
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
