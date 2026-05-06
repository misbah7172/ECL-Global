import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, ClipboardList, GraduationCap, User } from "lucide-react";

const COLORS = {
  deepBlue: "#1C4E9C",
  skyBlue: "#33A9D9",
  midBlue: "#2A7CCD",
  darkGrey: "#4F4F4F",
  offWhite: "#F8F8F8",
  red: "#EF4444",
};

const consultationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().regex(/^\d{13}$/, "Phone number must be 13 digits"),
  email: z.string().email("Valid email is required"),
  ieltsStatus: z.enum(["No", "Yes - General Training", "Yes - Academic Training"]),
  age: z.coerce.number().min(15, "Age must be at least 15").max(40, "Age must be 40 or below"),
  gender: z.enum(["Male", "Female", "Other"]),
  educationLevel: z.enum([
    "SSC",
    "O levels",
    "HSC",
    "A levels",
    "Diploma",
    "Graduation",
    "Post Graduation (Master’s)",
  ]),
  location: z.enum(["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Other"]),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Select a time slot"),
  guardianFirstName: z.string().min(1, "Guardian first name is required"),
  guardianLastName: z.string().min(1, "Guardian last name is required"),
  guardianPhone: z.string().regex(/^\d{13}$/, "Guardian phone must be 13 digits"),
  subject: z.string().min(1, "Please add your group/subject"),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

const timeSlots = [
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "06:00 PM - 07:00 PM",
];

export default function ConsultationFormPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      sessionStorage.setItem("post-register-redirect", "/consultation");
      setLocation("/register?redirect=/consultation");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const { data: activeForm } = useQuery({
    queryKey: ["/api/consultation-forms/active"],
    queryFn: async () => {
      const response = await fetch("/api/consultation-forms/active");
      if (!response.ok) {
        return null;
      }
      return response.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ConsultationFormData) => {
      const response = await apiRequest("POST", "/api/consultation-submissions", {
        ...data,
        formId: activeForm?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Consultation booked",
        description: "Our team will contact you soon to confirm your slot.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      ieltsStatus: "No",
      age: 18,
      gender: "Male",
      educationLevel: "SSC",
      location: "Dhaka",
      preferredDate: "",
      preferredTime: "",
      guardianFirstName: "",
      guardianLastName: "",
      guardianPhone: "",
      subject: "",
    },
  });

  const onSubmit = async (data: ConsultationFormData) => {
    setSubmitting(true);
    try {
      await mutation.mutateAsync(data);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = useMemo(() => submitting || mutation.isPending, [submitting, mutation.isPending]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <BadgeBanner
              title={activeForm?.title || "Free Consultation"}
              description={activeForm?.description || "Tell us about your goals and we will plan your study abroad journey."}
            />
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl" style={{ color: COLORS.deepBlue }}>
                  Consultation Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number (13 digits)</FormLabel>
                            <FormControl>
                              <Input placeholder="8801XXXXXXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="ieltsStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IELTS Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Yes - General Training">Yes - General Training</SelectItem>
                                <SelectItem value="Yes - Academic Training">Yes - Academic Training</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" min={15} max={40} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="educationLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Completed Education</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SSC">SSC</SelectItem>
                                <SelectItem value="O levels">O levels</SelectItem>
                                <SelectItem value="HSC">HSC</SelectItem>
                                <SelectItem value="A levels">A levels</SelectItem>
                                <SelectItem value="Diploma">Diploma</SelectItem>
                                <SelectItem value="Graduation">Graduation</SelectItem>
                                <SelectItem value="Post Graduation (Master’s)">Post Graduation (Master’s)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Where do you live?</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Dhaka">Dhaka</SelectItem>
                                <SelectItem value="Chittagong">Chittagong</SelectItem>
                                <SelectItem value="Sylhet">Sylhet</SelectItem>
                                <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                                <SelectItem value="Khulna">Khulna</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="preferredDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Date (MM/DD/YYYY)</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/DD/YYYY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="preferredTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Time Slot</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time slot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeSlots.map((slot) => (
                                  <SelectItem key={slot} value={slot}>
                                    {slot}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="guardianFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guardian/Parents First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="guardianLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guardian/Parents Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="guardianPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guardian/Parents Contact Number (13 digits)</FormLabel>
                          <FormControl>
                            <Input placeholder="8801XXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group/Graduation Subject</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Science / B.Sc. in Textile Engineering"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full text-white font-semibold"
                      style={{ backgroundColor: COLORS.skyBlue }}
                      disabled={disabled}
                    >
                      {disabled ? "Submitting..." : "Submit Consultation Request"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl" style={{ color: COLORS.deepBlue }}>
                  What happens next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm" style={{ color: COLORS.darkGrey }}>
                {[
                  "We review your information within 24 hours.",
                  "A counselor confirms your preferred slot.",
                  "We share a personalized study roadmap.",
                ].map((step) => (
                  <div key={step} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <p>{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl" style={{ color: COLORS.deepBlue }}>
                  Consultation checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm" style={{ color: COLORS.darkGrey }}>
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-4 w-4 text-blue-500" />
                  Bring your academic documents
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  Note your preferred universities
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-blue-500" />
                  Keep guardian contact details ready
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function BadgeBanner({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 rounded-3xl bg-white px-6 py-5 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl p-3" style={{ backgroundColor: "#EAF6FB" }}>
          <Calendar className="h-6 w-6" style={{ color: "#1C4E9C" }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Consultation</p>
          <h2 className="text-2xl font-bold" style={{ color: "#1C4E9C" }}>{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
