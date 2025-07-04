import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StudyAbroadService, StudyAbroadInquiry } from "../../../shared/types";
import { 
  Globe, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle,
  Users,
  Award,
  TrendingUp,
  Heart,
  Shield,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  DollarSign,
  Calendar,
  Target,
  Lightbulb,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudyAbroadServiceDetail() {
  const { slug } = useParams();
  const { toast } = useToast();
  
  const [inquiryForm, setInquiryForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    course: "",
    university: "",
    budget: "",
    timeline: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: [`/api/study-abroad-services/slug/${slug}`],
    queryFn: async (): Promise<StudyAbroadService> => {
      const response = await fetch(`/api/study-abroad-services/slug/${slug}`);
      if (!response.ok) throw new Error("Service not found");
      return response.json();
    },
  });

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/study-abroad-inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...inquiryForm,
          serviceId: service?.id
        }),
      });

      if (!response.ok) throw new Error("Failed to submit inquiry");

      toast({
        title: "Inquiry Submitted Successfully!",
        description: "Our team will contact you within 24 hours.",
      });

      // Reset form
      setInquiryForm({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        course: "",
        university: "",
        budget: "",
        timeline: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-200 rounded-lg h-96"></div>
              <div className="bg-gray-200 rounded-lg h-96"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-8">The service you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "University Admission":
        return <Award className="h-12 w-12 text-blue-600" />;
      case "Visa Processing":
        return <Shield className="h-12 w-12 text-green-600" />;
      case "Scholarship Guidance":
        return <Star className="h-12 w-12 text-yellow-600" />;
      case "Study Permit":
        return <CheckCircle className="h-12 w-12 text-purple-600" />;
      case "Career Counseling":
        return <TrendingUp className="h-12 w-12 text-red-600" />;
      default:
        return <Globe className="h-12 w-12 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              {getServiceIcon(service.serviceType)}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{service.title}</h1>
            <p className="text-xl md:text-2xl mb-8">{service.shortDesc || service.description}</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-white text-blue-600 text-sm px-4 py-2">
                {service.serviceType}
              </Badge>
              {service.isFeatured && (
                <Badge className="bg-yellow-500 text-white text-sm px-4 py-2">
                  <Star className="h-4 w-4 mr-1" />
                  Featured
                </Badge>
              )}
              {service.isPopular && (
                <Badge className="bg-red-500 text-white text-sm px-4 py-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <MessageSquare className="mr-2 h-5 w-5" />
                Get Free Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Service Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Service Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>

              {/* Service Features */}
              {service.features && service.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Key Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {service.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Countries */}
              {service.countries && service.countries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Available Countries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {service.countries.map((country: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Process */}
              {service.process && service.process.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Our Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {service.process.map((step: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {service.benefits && service.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {service.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <ArrowRight className="h-5 w-5 text-blue-500 mt-0.5" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Inquiry Form */}
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Request Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Get personalized guidance for your study abroad journey
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitInquiry} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={inquiryForm.fullName}
                          onChange={(e) => setInquiryForm({...inquiryForm, fullName: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Preferred Country</Label>
                        <Input
                          id="country"
                          value={inquiryForm.country}
                          onChange={(e) => setInquiryForm({...inquiryForm, country: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="course">Course/Field of Study</Label>
                        <Input
                          id="course"
                          value={inquiryForm.course}
                          onChange={(e) => setInquiryForm({...inquiryForm, course: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="university">Target University</Label>
                        <Input
                          id="university"
                          value={inquiryForm.university}
                          onChange={(e) => setInquiryForm({...inquiryForm, university: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget">Budget Range</Label>
                        <Input
                          id="budget"
                          value={inquiryForm.budget}
                          onChange={(e) => setInquiryForm({...inquiryForm, budget: e.target.value})}
                          placeholder="e.g., $20,000 - $50,000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="timeline">Timeline</Label>
                        <Input
                          id="timeline"
                          value={inquiryForm.timeline}
                          onChange={(e) => setInquiryForm({...inquiryForm, timeline: e.target.value})}
                          placeholder="e.g., Fall 2024"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Additional Message</Label>
                      <Textarea
                        id="message"
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                        rows={4}
                        placeholder="Tell us more about your study abroad goals..."
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Service Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm"><strong>Duration:</strong> {service.duration}</span>
                    </div>
                  )}
                  {service.price && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm"><strong>Price:</strong> {service.price}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm"><strong>Inquiries:</strong> {(service as any)._count?.inquiries || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
