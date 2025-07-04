import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { StudyAbroadService } from "../../../../shared/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Star,
  TrendingUp,
  Globe,
  Award,
  Shield,
  CheckCircle,
  Users,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminStudyAbroadServices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [selectedService, setSelectedService] = useState<StudyAbroadService | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/study-abroad-services", { search: searchTerm, serviceType: filterType }],
    queryFn: async (): Promise<StudyAbroadService[]> => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterType) params.append("serviceType", filterType);
      
      const response = await fetch(`/api/study-abroad-services?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.json();
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/study-abroad-services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete service");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-abroad-services"] });
      toast({ title: "Service deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
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

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "University Admission":
        return <Award className="h-4 w-4 text-blue-600" />;
      case "Visa Processing":
        return <Shield className="h-4 w-4 text-green-600" />;
      case "Scholarship Guidance":
        return <Star className="h-4 w-4 text-yellow-600" />;
      case "Study Permit":
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case "Career Counseling":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      default:
        return <Globe className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleDeleteService = (service: StudyAbroadService) => {
    if (window.confirm(`Are you sure you want to delete "${service.title}"?`)) {
      deleteServiceMutation.mutate(service.id || "");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Study Abroad Services</h2>
          <p className="text-muted-foreground">
            Manage study abroad services and inquiries
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
            </DialogHeader>
            <ServiceForm 
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/study-abroad-services"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterType === "" ? "default" : "outline"}
            onClick={() => setFilterType("")}
            size="sm"
          >
            All
          </Button>
          {serviceTypes.slice(0, 3).map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              onClick={() => setFilterType(type)}
              size="sm"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Services ({services.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Inquiries</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-gray-500">
                        <Globe className="h-8 w-8 mx-auto mb-2" />
                        <p>No services found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service: StudyAbroadService) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getServiceIcon(service.serviceType)}
                          <div>
                            <div className="font-medium">{service.title}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              {service.isFeatured && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                  Featured
                                </Badge>
                              )}
                              {service.isPopular && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  Popular
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.serviceType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span>{(service as any)._count?.inquiries || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => window.open(`/study-abroad-services/${service.slug}`, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedService(service);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteService(service)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <ServiceForm 
              service={selectedService}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedService(null);
                queryClient.invalidateQueries({ queryKey: ["/api/study-abroad-services"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServiceForm({ service, onSuccess }: { service?: StudyAbroadService; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: service?.title || "",
    slug: service?.slug || "",
    description: service?.description || "",
    shortDesc: service?.shortDesc || "",
    serviceType: service?.serviceType || "",
    price: service?.price || "",
    duration: service?.duration || "",
    features: service?.features ? service.features.join("\n") : "",
    countries: service?.countries ? service.countries.join("\n") : "",
    requirements: service?.requirements ? service.requirements.join("\n") : "",
    process: service?.process ? service.process.join("\n") : "",
    benefits: service?.benefits ? service.benefits.join("\n") : "",
    isActive: service?.isActive ?? true,
    isFeatured: service?.isFeatured ?? false,
    isPopular: service?.isPopular ?? false,
    order: service?.order ?? 0,
  });

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        features: formData.features.split("\n").filter((f: string) => f.trim()),
        countries: formData.countries.split("\n").filter((c: string) => c.trim()),
        requirements: formData.requirements.split("\n").filter((r: string) => r.trim()),
        process: formData.process.split("\n").filter((p: string) => p.trim()),
        benefits: formData.benefits.split("\n").filter((b: string) => b.trim()),
      };

      const url = service ? `/api/study-abroad-services/${service.id}` : "/api/study-abroad-services";
      const method = service ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed to ${service ? "update" : "create"} service`);

      toast({
        title: `Service ${service ? "updated" : "created"} successfully`,
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${service ? "update" : "create"} service`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({...formData, slug: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="serviceType">Service Type *</Label>
        <select
          id="serviceType"
          value={formData.serviceType}
          onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
          className="w-full p-2 border rounded-md"
          required
        >
          <option value="">Select service type</option>
          {serviceTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="shortDesc">Short Description</Label>
        <Textarea
          id="shortDesc"
          value={formData.shortDesc}
          onChange={(e) => setFormData({...formData, shortDesc: e.target.value})}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="e.g., $500"
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            placeholder="e.g., 2-3 weeks"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="features">Features (one per line)</Label>
        <Textarea
          id="features"
          value={formData.features}
          onChange={(e) => setFormData({...formData, features: e.target.value})}
          rows={3}
          placeholder="Expert consultation&#10;Document assistance&#10;24/7 support"
        />
      </div>

      <div>
        <Label htmlFor="countries">Countries (one per line)</Label>
        <Textarea
          id="countries"
          value={formData.countries}
          onChange={(e) => setFormData({...formData, countries: e.target.value})}
          rows={2}
          placeholder="USA&#10;Canada&#10;UK&#10;Australia"
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})}
          />
          <Label htmlFor="isFeatured">Featured</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isPopular"
            checked={formData.isPopular}
            onCheckedChange={(checked) => setFormData({...formData, isPopular: checked})}
          />
          <Label htmlFor="isPopular">Popular</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="order">Order</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : (service ? "Update Service" : "Create Service")}
      </Button>
    </form>
  );
}
