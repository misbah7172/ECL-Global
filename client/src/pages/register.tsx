import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { trackCompleteRegistration } from "@/lib/facebook-pixel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone as PhoneIcon, CheckCircle, Shield, Trophy, Globe, Star } from "lucide-react";
import ECLLogo from "@/assets/ECL-Logo.png";

// Color Scheme Constants
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await register(registerData);
      
      // Track registration in Facebook Pixel
      trackCompleteRegistration({
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to ECL Global Learning Platform.",
      });
      // Use window.location to ensure navigation happens after auth state update
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ['firstName', 'lastName', 'username'] as const
      : ['email', 'phone'] as const;
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Info Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 100%)` }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6">
              Begin Your Study Abroad Journey Today
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join 1000+ students who transformed their future with ECL Global.
            </p>
            
            <div className="space-y-6 mb-12">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${COLORS.skyBlue}40` }}>
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Free Consultation</h3>
                  <p className="text-blue-100 text-sm">Get personalized guidance from expert counselors</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${COLORS.skyBlue}40` }}>
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">50+ Partner Universities</h3>
                  <p className="text-blue-100 text-sm">Access to top institutions worldwide</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${COLORS.skyBlue}40` }}>
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">98% Success Rate</h3>
                  <p className="text-blue-100 text-sm">Proven track record of visa approvals</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${COLORS.skyBlue}40` }}>
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">End-to-End Support</h3>
                  <p className="text-blue-100 text-sm">From application to arrival</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: `${COLORS.skyBlue}20` }}>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="italic text-blue-100 mb-4">
                "Best decision ever! ECL Global made my MIT dream a reality."
              </p>
              <div className="flex items-center space-x-3">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b193?w=50&h=50&fit=crop&crop=face"
                  alt="Student"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">Fatima Khan</p>
                  <p className="text-sm text-blue-200">MIT, USA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24" style={{ backgroundColor: COLORS.offWhite }}>
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 mb-8 cursor-pointer">
              <img src={ECLLogo} alt="ECL Global Logo" className="h-8 mr-2" />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
                  ECL GLOBAL
                </h1>
                <div className="text-xs -mt-1" style={{ color: COLORS.darkGrey }}>
                  Study Abroad Solution
                </div>
              </div>
            </div>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold" style={{ color: COLORS.deepBlue }}>
              Create Your Account
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.darkGrey }}>
              Start your journey to global education
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      step >= s ? 'text-white' : 'text-gray-400'
                    }`}
                    style={{ backgroundColor: step >= s ? COLORS.skyBlue : COLORS.offWhite }}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div 
                      className="w-16 h-1 mx-2"
                      style={{ backgroundColor: step > s ? COLORS.skyBlue : COLORS.offWhite }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs" style={{ color: COLORS.darkGrey }}>
              <span>Personal</span>
              <span>Contact</span>
              <span>Security</span>
            </div>
          </div>

          {/* Form */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">{step === 1 && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: COLORS.darkGrey }}>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Md. Habibulla" className="h-11" {...field} />
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
                              <FormLabel style={{ color: COLORS.darkGrey }}>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Misba" className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.darkGrey }}>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-5 w-5" style={{ color: COLORS.skyBlue }} />
                                <Input placeholder="misba" className="pl-11 h-11" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.darkGrey }}>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5" style={{ color: COLORS.skyBlue }} />
                                <Input type="email" placeholder="patel@example.com" className="pl-11 h-11" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.darkGrey }}>Phone</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <PhoneIcon className="absolute left-3 top-3 h-5 w-5" style={{ color: COLORS.skyBlue }} />
                                <Input type="tel" placeholder="+880 1305841167" className="pl-11 h-11" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.darkGrey }}>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5" style={{ color: COLORS.skyBlue }} />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create password"
                                  className="pl-11 pr-11 h-11"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: COLORS.darkGrey }}>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5" style={{ color: COLORS.skyBlue }} />
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm password"
                                  className="pl-11 pr-11 h-11"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-3"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <div className="flex gap-3 pt-4">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        className="flex-1 h-11"
                        style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
                      >
                        Back
                      </Button>
                    )}
                    {step < 3 ? (
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 h-11 text-white font-semibold"
                        style={{ backgroundColor: COLORS.skyBlue }}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex-1 h-11 text-white font-semibold"
                        disabled={isLoading}
                        style={{ backgroundColor: COLORS.skyBlue }}
                      >
                        {isLoading ? "Creating..." : "Create Account"}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: COLORS.offWhite }} />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white" style={{ color: COLORS.darkGrey }}>
                      Already have an account?
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      className="w-full h-11 font-semibold"
                      style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
                    >
                      Sign In Instead
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-xs" style={{ color: COLORS.darkGrey }}>
            By creating an account, you agree to our{" "}
            <a href="#" className="font-medium hover:underline" style={{ color: COLORS.skyBlue }}>Terms</a>
            {" "}and{" "}
            <a href="#" className="font-medium hover:underline" style={{ color: COLORS.skyBlue }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
