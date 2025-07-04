import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Shield,
  Activity,
  Clock
} from "lucide-react";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  avatar: string;
  bio: string;
  location: string;
  permissions: string[];
  lastLogin: string;
  totalActions: number;
  status: 'active' | 'inactive';
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

// Mock API functions
const fetchAdminProfile = async (): Promise<AdminProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "admin-001",
        name: "John Administrator",
        email: "admin@mentors.com",
        phone: "+1234567890",
        role: "Super Admin",
        department: "Administration",
        joinDate: "2023-01-15",
        avatar: "/api/placeholder/150/150",
        bio: "Experienced administrator with 5+ years in educational technology management.",
        location: "New York, USA",
        permissions: ["full_access", "user_management", "system_config", "data_export"],
        lastLogin: "2024-01-15T14:30:00Z",
        totalActions: 1247,
        status: 'active'
      });
    }, 1000);
  });
};

const fetchActivityLog = async (): Promise<ActivityLog[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          action: "User Created",
          timestamp: "2024-01-15T14:25:00Z",
          details: "Created new student account for Sarah Johnson",
          ipAddress: "192.168.1.100"
        },
        {
          id: "2",
          action: "Course Updated",
          timestamp: "2024-01-15T14:20:00Z",
          details: "Updated course 'Advanced Mathematics' syllabus",
          ipAddress: "192.168.1.100"
        },
        {
          id: "3",
          action: "System Backup",
          timestamp: "2024-01-15T14:15:00Z",
          details: "Initiated system backup",
          ipAddress: "192.168.1.100"
        },
        {
          id: "4",
          action: "Login",
          timestamp: "2024-01-15T14:10:00Z",
          details: "Successful login",
          ipAddress: "192.168.1.100"
        }
      ]);
    }, 1000);
  });
};

const updateAdminProfile = async (profile: Partial<AdminProfile>): Promise<AdminProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "admin-001",
        name: profile.name || "John Administrator",
        email: profile.email || "admin@mentors.com",
        phone: profile.phone || "+1234567890",
        role: "Super Admin",
        department: "Administration",
        joinDate: "2023-01-15",
        avatar: "/api/placeholder/150/150",
        bio: profile.bio || "Experienced administrator with 5+ years in educational technology management.",
        location: profile.location || "New York, USA",
        permissions: ["full_access", "user_management", "system_config", "data_export"],
        lastLogin: "2024-01-15T14:30:00Z",
        totalActions: 1247,
        status: 'active'
      });
    }, 1000);
  });
};

export default function AdminProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminProfile>>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: fetchAdminProfile,
  });

  const { data: activityLog } = useQuery({
    queryKey: ['admin-activity-log'],
    queryFn: fetchActivityLog,
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: profile?.name,
      email: profile?.email,
      phone: profile?.phone,
      bio: profile?.bio,
      location: profile?.location,
    });
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Profile</h1>
            <p className="text-muted-foreground">Manage your admin account and settings</p>
          </div>
          {!isEditing && (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar} alt={profile?.name} />
                    <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{profile?.name}</h3>
                    <Badge variant="secondary">{profile?.role}</Badge>
                    <Badge variant={profile?.status === 'active' ? 'default' : 'secondary'}>
                      {profile?.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter name"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{profile?.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{profile?.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Phone</Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile?.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    {isEditing ? (
                      <Input
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter location"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{profile?.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Department</Label>
                    <div className="flex items-center gap-2">
                      <span>{profile?.department}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Join Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(profile?.joinDate || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Enter bio"
                      className="min-h-20"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profile?.bio}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile?.permissions.map((permission) => (
                    <Badge key={permission} variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      {permission.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog?.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-3 border rounded-lg">
                      <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{log.action}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">IP: {log.ipAddress}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Last Login</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(profile?.lastLogin || '').toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Actions</Label>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>{profile?.totalActions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline">Change Password</Button>
                  <Button variant="outline" className="ml-2">Enable Two-Factor Authentication</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
