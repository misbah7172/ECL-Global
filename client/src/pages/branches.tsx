import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Mail, ExternalLink } from "lucide-react";

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
      <div className="min-h-screen">
        <Header />
        <div className="container py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <section className="bg-white py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Branches</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Visit any of our conveniently located branches across Bangladesh and internationally for in-person consultations and classes.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{branches?.length || 0}</h3>
              <p className="text-gray-600">Local Branches</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
              <p className="text-gray-600">Support Available</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ExternalLink className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">2</h3>
              <p className="text-gray-600">International Offices</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-16">
        {/* Local Branches */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Bangladesh Branches</h2>
          
          {branches && branches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {branches.map((branch: any) => (
                <Card key={branch.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-3 rounded-lg mr-4">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                        <div className="flex items-center space-x-2">
                          {branch.isMain && (
                            <Badge variant="default">Main Branch</Badge>
                          )}
                          <Badge variant="outline">
                            {branch.city}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{branch.address}</p>
                      </div>
                      
                      {branch.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-3" />
                          <p className="text-sm text-gray-600">{branch.phone}</p>
                        </div>
                      )}
                      
                      {branch.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-3" />
                          <p className="text-sm text-gray-600">{branch.email}</p>
                        </div>
                      )}
                      
                      {branch.hours && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-3" />
                          <p className="text-sm text-gray-600">{branch.hours}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Button className="w-full">
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                      {branch.phone && (
                        <Button variant="outline" className="w-full">
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
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No branches found</h3>
              <p className="text-gray-600">Branch information will be available soon.</p>
            </div>
          )}
        </section>

        {/* International Offices */}
        <section className="bg-gray-100 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">International Offices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {internationalOffices.map((office) => (
              <Card key={office.id} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <ExternalLink className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{office.name}</h3>
                      <Badge variant="secondary">{office.country}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                      <p className="text-sm text-gray-600">{office.address}</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <p className="text-sm text-gray-600">{office.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <p className="text-sm text-gray-600">{office.email}</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Office
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Our international offices provide local support for students studying abroad.
            </p>
            <Button>
              <Phone className="h-4 w-4 mr-2" />
              Contact International Team
            </Button>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help Finding Us?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team is here to help you find the most convenient location and schedule your visit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              <Phone className="h-5 w-5 mr-2" />
              Call Main Office
            </Button>
            <Button variant="outline" size="lg">
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
