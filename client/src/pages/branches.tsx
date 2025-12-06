import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Mail, ExternalLink, Globe, Navigation, ChevronRight, Users, Award } from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

export default function Branches() {
  const { data: branches, isLoading } = useQuery({
    queryKey: ["/api/branches"],
  });

  // Mock international offices data
  const internationalOffices = [
    {
      id: 1,
      name: "USA Office - New York",
      address: "Manhattan, NY 10001",
      country: "USA",
      phone: "+1 (555) 123-4567",
      email: "usa@mentors.com.bd"
    },
    {
      id: 2,
      name: "Australia Office - Sydney",
      address: "Sydney, NSW 2000",
      country: "Australia",
      phone: "+61 2 1234 5678",
      email: "australia@mentors.com.bd"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            {/* Beautiful Pulsing Animation */}
            <div className="relative w-24 h-24 mb-8">
              {/* Outer ring - pulsing */}
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: COLORS.skyBlue }}
              />
              {/* Middle ring */}
              <div 
                className="absolute inset-2 rounded-full animate-pulse"
                style={{ backgroundColor: COLORS.midBlue }}
              />
              {/* Inner circle with icon */}
              <div 
                className="absolute inset-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.deepBlue }}
              >
                <MapPin className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Loading Branches
              </h3>
              <p style={{ color: COLORS.darkGrey }}>Finding our locations near you...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      <Header />
      
      {/* Hero Section */}
      <section 
        className="py-20 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 50%, ${COLORS.skyBlue} 100%)`
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center px-6 py-3 rounded-full mb-6 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <MapPin className="h-5 w-5 mr-2" />
              <span className="font-semibold">Visit Our Locations</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our Branches
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Visit any of our conveniently located branches across Bangladesh and internationally for in-person consultations and expert guidance.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div 
              className="text-center p-8 rounded-2xl backdrop-blur-sm hover:shadow-2xl transition-all"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
              >
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">{branches?.length || 0}</h3>
              <p className="text-blue-100 font-medium">Local Branches</p>
            </div>
            <div 
              className="text-center p-8 rounded-2xl backdrop-blur-sm hover:shadow-2xl transition-all"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
              >
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">24/7</h3>
              <p className="text-blue-100 font-medium">Support Available</p>
            </div>
            <div 
              className="text-center p-8 rounded-2xl backdrop-blur-sm hover:shadow-2xl transition-all"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
              >
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">2</h3>
              <p className="text-blue-100 font-medium">International Offices</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl py-16">
        {/* Local Branches */}
        <section className="mb-16">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>
              Bangladesh Branches
            </h2>
            <p className="text-lg" style={{ color: COLORS.darkGrey }}>
              Find the nearest branch for personalized consultations
            </p>
          </div>
          
          {branches && branches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {branches.map((branch: any) => (
                <Card key={branch.id} className="hover:shadow-2xl transition-all duration-300 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div 
                        className="p-3 rounded-xl mr-4"
                        style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                      >
                        <MapPin className="h-6 w-6" style={{ color: COLORS.skyBlue }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2" style={{ color: COLORS.deepBlue }}>
                          {branch.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {branch.isMain && (
                            <Badge 
                              className="text-white font-semibold"
                              style={{ backgroundColor: COLORS.skyBlue }}
                            >
                              Main Branch
                            </Badge>
                          )}
                          <Badge 
                            variant="outline"
                            style={{ borderColor: COLORS.skyBlue, color: COLORS.midBlue }}
                          >
                            {branch.city}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mt-1 mr-3 flex-shrink-0" style={{ color: COLORS.darkGrey }} />
                        <p className="text-sm" style={{ color: COLORS.darkGrey }}>{branch.address}</p>
                      </div>
                      
                      {branch.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-3" style={{ color: COLORS.darkGrey }} />
                          <p className="text-sm" style={{ color: COLORS.darkGrey }}>{branch.phone}</p>
                        </div>
                      )}
                      
                      {branch.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-3" style={{ color: COLORS.darkGrey }} />
                          <p className="text-sm" style={{ color: COLORS.darkGrey }}>{branch.email}</p>
                        </div>
                      )}
                      
                      {branch.hours && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-3" style={{ color: COLORS.darkGrey }} />
                          <p className="text-sm" style={{ color: COLORS.darkGrey }}>{branch.hours}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        className="w-full text-white font-semibold"
                        style={{ backgroundColor: COLORS.skyBlue }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                      {branch.phone && (
                        <Button 
                          variant="outline" 
                          className="w-full font-semibold"
                          style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Branch
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto bg-white rounded-2xl p-12 shadow-lg">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                >
                  <MapPin className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>No Branches Found</h3>
                <p style={{ color: COLORS.darkGrey }}>Branch information will be available soon.</p>
              </div>
            </div>
          )}
        </section>

        {/* International Offices */}
        <section className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>
              International Offices
            </h2>
            <p className="text-lg" style={{ color: COLORS.darkGrey }}>
              Global support for students studying abroad
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {internationalOffices.map((office) => (
              <Card key={office.id} className="border-0 shadow-md hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div 
                      className="p-3 rounded-xl mr-4"
                      style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                    >
                      <Globe className="h-6 w-6" style={{ color: COLORS.skyBlue }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: COLORS.deepBlue }}>
                        {office.name}
                      </h3>
                      <Badge 
                        className="mt-1 text-white font-semibold"
                        style={{ backgroundColor: COLORS.midBlue }}
                      >
                        {office.country}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-3" style={{ color: COLORS.darkGrey }} />
                      <p className="text-sm" style={{ color: COLORS.darkGrey }}>{office.address}</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-3" style={{ color: COLORS.darkGrey }} />
                      <p className="text-sm" style={{ color: COLORS.darkGrey }}>{office.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-3" style={{ color: COLORS.darkGrey }} />
                      <p className="text-sm" style={{ color: COLORS.darkGrey }}>{office.email}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full font-semibold"
                    style={{ borderColor: COLORS.skyBlue, color: COLORS.skyBlue }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Office
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <p className="mb-6 text-lg" style={{ color: COLORS.darkGrey }}>
              Our international offices provide local support for students studying abroad.
            </p>
            <Button
              size="lg"
              className="text-white font-semibold"
              style={{ backgroundColor: COLORS.skyBlue }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
            >
              <Phone className="h-5 w-5 mr-2" />
              Contact International Team
            </Button>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>
              Why Visit Our Branches?
            </h2>
            <p className="text-lg" style={{ color: COLORS.darkGrey }}>
              Experience personalized service at any of our locations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Expert Counselors",
                description: "Meet face-to-face with our certified education consultants for personalized guidance."
              },
              {
                icon: Award,
                title: "Full Support Services",
                description: "Access course enrollment, test preparation, visa assistance, and document processing."
              },
              {
                icon: Clock,
                title: "Convenient Hours",
                description: "Extended hours and weekend availability to fit your schedule and needs."
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
        </section>

        {/* Contact CTA */}
        <section 
          className="text-center py-20 rounded-2xl text-white"
          style={{
            background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 100%)`
          }}
        >
          <MapPin className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Help Finding Us?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Our team is here to help you find the most convenient location and schedule your visit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="h-14 px-8 text-white font-semibold shadow-xl"
              style={{ backgroundColor: COLORS.skyBlue }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Main Office
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
              <Mail className="h-5 w-5 mr-2" />
              Send Inquiry
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
