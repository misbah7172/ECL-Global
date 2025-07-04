import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const leadFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  interest: z.string().min(1, "Please select your interest"),
  message: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

export default function LeadForm() {
  const { toast } = useToast();
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      interest: "",
      message: "",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: LeadFormData) => apiRequest("POST", "/api/leads", data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "We'll contact you soon for your free consultation.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormData) => {
    createLeadMutation.mutate(data);
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 mb-8">
      <h3 className="text-xl font-semibold mb-6">Get Your Free Consultation</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Full Name" 
                      className="bg-white text-gray-900 placeholder-gray-500"
                      {...field} 
                    />
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
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Email Address" 
                      className="bg-white text-gray-900 placeholder-gray-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Phone Number" 
                      className="bg-white text-gray-900 placeholder-gray-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white text-gray-900">
                        <SelectValue placeholder="Select Interest" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ielts">IELTS Preparation</SelectItem>
                      <SelectItem value="sat">SAT Preparation</SelectItem>
                      <SelectItem value="toefl">TOEFL Preparation</SelectItem>
                      <SelectItem value="study-abroad">Study Abroad Counseling</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about your goals and preferred study destination" 
                    rows={3}
                    className="bg-white text-gray-900 placeholder-gray-500 resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-white text-primary hover:bg-gray-50"
            disabled={createLeadMutation.isPending}
          >
            {createLeadMutation.isPending ? "Submitting..." : "Request Free Consultation"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
