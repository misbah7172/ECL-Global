import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Mail, Lock, CheckCircle, Shield, Trophy, Globe } from "lucide-react";
import AnimatedAirplaneLogo from "@/components/animated-airplane-logo";

// Color Scheme Constants
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24" style={{ backgroundColor: COLORS.offWhite }}>
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 mb-8 cursor-pointer group">
              <AnimatedAirplaneLogo size="md" />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
                  ECL Global
                </h1>
                <div className="text-xs -mt-1" style={{ color: COLORS.darkGrey }}>
                  Study Abroad Experts
                </div>
              </div>
            </div>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold" style={{ color: COLORS.deepBlue }}>
              Welcome Back
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.darkGrey }}>
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: COLORS.darkGrey }}>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5" style={{ color: COLORS.skyBlue }} />
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              className="pl-11 h-11 border-2 focus:border-2"
                              style={{ 
                                borderColor: COLORS.offWhite,
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = COLORS.skyBlue}
                              onBlur={(e) => e.currentTarget.style.borderColor = COLORS.offWhite}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              placeholder="Enter your password"
                              className="pl-11 pr-11 h-11 border-2 focus:border-2"
                              style={{ 
                                borderColor: COLORS.offWhite,
                              }}
                              onFocus={(e) => e.currentTarget.style.borderColor = COLORS.skyBlue}
                              onBlur={(e) => e.currentTarget.style.borderColor = COLORS.offWhite}
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 h-5 w-5"
                              onClick={() => setShowPassword(!showPassword)}
                              style={{ color: COLORS.darkGrey }}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded"
                        style={{ accentColor: COLORS.skyBlue }}
                      />
                      <label htmlFor="remember-me" className="ml-2 text-sm" style={{ color: COLORS.darkGrey }}>
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-sm font-medium hover:underline" style={{ color: COLORS.skyBlue }}>
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    disabled={isLoading}
                    style={{ backgroundColor: COLORS.skyBlue }}
                    onMouseEnter={(e) => {
                      if (!isLoading) e.currentTarget.style.backgroundColor = COLORS.midBlue;
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) e.currentTarget.style.backgroundColor = COLORS.skyBlue;
                    }}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: COLORS.offWhite }} />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white" style={{ color: COLORS.darkGrey }}>
                      New to ECL Global?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/register">
                    <Button 
                      variant="outline" 
                      className="w-full h-11 font-semibold"
                      style={{ 
                        borderColor: COLORS.deepBlue,
                        color: COLORS.deepBlue,
                      }}
                    >
                      Create an Account
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <div className="mt-8 text-center">
            <p className="text-xs mb-3" style={{ color: COLORS.darkGrey }}>
              Trusted by 15,000+ students worldwide
            </p>
            <div className="flex justify-center space-x-4">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" style={{ color: COLORS.skyBlue }} />
                <span className="text-xs" style={{ color: COLORS.darkGrey }}>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" style={{ color: COLORS.skyBlue }} />
                <span className="text-xs" style={{ color: COLORS.darkGrey }}>Verified</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy className="h-4 w-4" style={{ color: COLORS.skyBlue }} />
                <span className="text-xs" style={{ color: COLORS.darkGrey }}>Award Winning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Info Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 100%)` }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6">
              Your Gateway to Global Education
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of students who achieved their dreams with our expert guidance.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: Globe, text: "Access to 50+ partner universities worldwide" },
                { icon: Trophy, text: "98% visa approval success rate" },
                { icon: CheckCircle, text: "Personalized study abroad consultation" },
                { icon: Shield, text: "Trusted by 15,000+ students" }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${COLORS.skyBlue}40` }}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="text-blue-100 pt-2">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-xl" style={{ backgroundColor: `${COLORS.skyBlue}20` }}>
              <p className="italic text-blue-100 mb-4">
                "ECL Global helped me get into my dream university. The personalized guidance was invaluable!"
              </p>
              <div className="flex items-center space-x-3">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                  alt="Student"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">Rashid Ahmed</p>
                  <p className="text-sm text-blue-200">University of Toronto</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
