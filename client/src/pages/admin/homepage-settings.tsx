import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

interface HomepageSettings {
  id?: number;
  studentsPlaced?: string;
  visaSuccessRate?: string;
  universityPartners?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  email?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  leadFormTitle?: string;
  leadFormSubtitle?: string;
}

export default function AdminHomepageSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<HomepageSettings>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["/api/settings/homepage"],
    queryFn: async () => {
      const response = await fetch("/api/settings/homepage");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  useEffect(() => {
    if (settings.id) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: HomepageSettings) => {
      const response = await fetch("/api/admin/settings/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/homepage"] });
      toast({
        title: "Success",
        description: "Homepage settings updated successfully!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    await updateMutation.mutateAsync(formData);
    setIsSaving(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.deepBlue }}>
            Homepage Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: COLORS.darkGrey }}>
            Manage all homepage content including statistics, contact information, and promotional text
          </p>
        </div>

        {isLoading ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-12 text-gray-500">Loading settings...</div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Hero Statistics Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader style={{ backgroundColor: COLORS.offWhite, borderBottom: `2px solid ${COLORS.skyBlue}` }}>
                <CardTitle style={{ color: COLORS.deepBlue }}>Hero Statistics</CardTitle>
                <p className="text-xs mt-1" style={{ color: COLORS.darkGrey }}>
                  These statistics are displayed prominently in the hero section
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                      Students Placed
                    </label>
                    <Input
                      value={formData.studentsPlaced || ""}
                      onChange={(e) => setFormData({ ...formData, studentsPlaced: e.target.value })}
                      placeholder="e.g., 15,000+"
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: 15,000+</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                      Visa Success Rate
                    </label>
                    <Input
                      value={formData.visaSuccessRate || ""}
                      onChange={(e) => setFormData({ ...formData, visaSuccessRate: e.target.value })}
                      placeholder="e.g., 98%"
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: 98%</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                      University Partners
                    </label>
                    <Input
                      value={formData.universityPartners || ""}
                      onChange={(e) => setFormData({ ...formData, universityPartners: e.target.value })}
                      placeholder="e.g., 50+"
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: 50+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader style={{ backgroundColor: COLORS.offWhite, borderBottom: `2px solid ${COLORS.skyBlue}` }}>
                <CardTitle style={{ color: COLORS.deepBlue }}>Contact Information</CardTitle>
                <p className="text-xs mt-1" style={{ color: COLORS.darkGrey }}>
                  Contact details displayed throughout the website
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                      Phone Number
                    </label>
                    <Input
                      value={formData.phoneNumber || ""}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+880 1777-123456"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                      WhatsApp Number
                    </label>
                    <Input
                      value={formData.whatsappNumber || ""}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="+880 1777-123456"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="info@eclglobal.com"
                      className="text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hero Section Text */}
            <Card className="border-0 shadow-lg">
              <CardHeader style={{ backgroundColor: COLORS.offWhite, borderBottom: `2px solid ${COLORS.skyBlue}` }}>
                <CardTitle style={{ color: COLORS.deepBlue }}>Hero Section Text</CardTitle>
                <p className="text-xs mt-1" style={{ color: COLORS.darkGrey }}>
                  Main heading and subtitle displayed in the hero section
                </p>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                    Hero Title
                  </label>
                  <Input
                    value={formData.heroTitle || ""}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    placeholder="Your Passport to Academic Adventure"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Main heading visible at the top of the homepage
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                    Hero Subtitle
                  </label>
                  <Textarea
                    value={formData.heroSubtitle || ""}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                    placeholder="Bangladesh's #1 Study Abroad Consultant. Transform your global education dreams..."
                    className="text-sm"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supporting text below the hero title
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Lead Form Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader style={{ backgroundColor: COLORS.offWhite, borderBottom: `2px solid ${COLORS.skyBlue}` }}>
                <CardTitle style={{ color: COLORS.deepBlue }}>Lead Form Text</CardTitle>
                <p className="text-xs mt-1" style={{ color: COLORS.darkGrey }}>
                  Text for the lead capture form (services are fetched from Study Abroad Services)
                </p>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                    Form Title
                  </label>
                  <Input
                    value={formData.leadFormTitle || ""}
                    onChange={(e) => setFormData({ ...formData, leadFormTitle: e.target.value })}
                    placeholder="Start Your Journey Today"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                    Form Subtitle
                  </label>
                  <Input
                    value={formData.leadFormSubtitle || ""}
                    onChange={(e) => setFormData({ ...formData, leadFormSubtitle: e.target.value })}
                    placeholder="Get personalized guidance from our experts"
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm" style={{ color: COLORS.deepBlue }}>
                <p className="font-medium">All changes take effect immediately</p>
                <p className="text-xs opacity-75 mt-1">
                  Services displayed in the lead form are automatically populated from your Study Abroad Services database. Make sure to create services there first.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || updateMutation.isPending}
                className="text-white font-semibold"
                style={{ backgroundColor: COLORS.skyBlue }}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
