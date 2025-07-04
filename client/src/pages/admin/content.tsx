import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Filter, FileVideo, Play, Download, Eye, Upload, File, Video, Image, FileText, Music, Archive } from "lucide-react";

interface ContentItem {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'document' | 'image' | 'audio' | 'archive' | 'other';
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  duration?: number; // in seconds for video/audio
  courseId?: number;
  courseName?: string;
  moduleId?: number;
  moduleName?: string;
  isPublic: boolean;
  isActive: boolean;
  downloadCount: number;
  viewCount: number;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  tags: string[];
  url: string;
  thumbnailUrl?: string;
}

const contentTypeIcons = {
  video: Video,
  document: FileText,
  image: Image,
  audio: Music,
  archive: Archive,
  other: File,
};

const contentTypeColors = {
  video: 'bg-red-100 text-red-800',
  document: 'bg-blue-100 text-blue-800',
  image: 'bg-green-100 text-green-800',
  audio: 'bg-purple-100 text-purple-800',
  archive: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

export default function AdminContentLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video" as ContentItem['type'],
    courseId: "",
    moduleId: "",
    isPublic: false,
    isActive: true,
    tags: [] as string[],
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagInput, setTagInput] = useState("");

  const queryClient = useQueryClient();

  const { data: contentItems, isLoading } = useQuery({
    queryKey: ['/api/admin/content'],
    queryFn: async () => {
      // Mock data - in real app, this would fetch from API
      const mockData: ContentItem[] = [
        {
          id: 1,
          title: "Introduction to JavaScript",
          description: "A comprehensive introduction to JavaScript programming language",
          type: 'video',
          fileName: "javascript-intro.mp4",
          fileSize: 157286400, // 150MB
          mimeType: "video/mp4",
          duration: 1800, // 30 minutes
          courseId: 1,
          courseName: "Full Stack Web Development",
          moduleId: 1,
          moduleName: "JavaScript Fundamentals",
          isPublic: true,
          isActive: true,
          downloadCount: 45,
          viewCount: 234,
          uploadedBy: "Sarah Johnson",
          uploadedAt: "2024-01-10T10:00:00Z",
          updatedAt: "2024-01-15T14:30:00Z",
          tags: ["javascript", "programming", "web-development"],
          url: "/content/videos/javascript-intro.mp4",
          thumbnailUrl: "/content/thumbnails/javascript-intro.jpg",
        },
        {
          id: 2,
          title: "React Components Guide",
          description: "Complete guide to building React components with examples",
          type: 'document',
          fileName: "react-components-guide.pdf",
          fileSize: 5242880, // 5MB
          mimeType: "application/pdf",
          courseId: 1,
          courseName: "Full Stack Web Development",
          moduleId: 2,
          moduleName: "React Framework",
          isPublic: false,
          isActive: true,
          downloadCount: 78,
          viewCount: 156,
          uploadedBy: "Sarah Johnson",
          uploadedAt: "2024-01-12T09:30:00Z",
          updatedAt: "2024-01-18T11:45:00Z",
          tags: ["react", "components", "javascript", "guide"],
          url: "/content/documents/react-components-guide.pdf",
        },
        {
          id: 3,
          title: "Python Data Analysis Workshop",
          description: "Hands-on workshop materials for data analysis using Python",
          type: 'archive',
          fileName: "python-data-analysis.zip",
          fileSize: 104857600, // 100MB
          mimeType: "application/zip",
          courseId: 2,
          courseName: "Data Science Bootcamp",
          moduleId: 3,
          moduleName: "Data Analysis",
          isPublic: true,
          isActive: true,
          downloadCount: 123,
          viewCount: 89,
          uploadedBy: "Mike Chen",
          uploadedAt: "2024-01-08T14:20:00Z",
          updatedAt: "2024-01-20T16:00:00Z",
          tags: ["python", "data-analysis", "workshop", "pandas"],
          url: "/content/archives/python-data-analysis.zip",
        },
      ];
      return mockData;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      return [
        { id: 1, name: "Full Stack Web Development" },
        { id: 2, name: "Data Science Bootcamp" },
        { id: 3, name: "Mobile App Development" },
      ];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Simulate upload progress
      const response = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('Failed to upload content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      toast({ title: "Success", description: "Content uploaded successfully" });
      setIsUploadModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload content", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ContentItem> }) => {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      toast({ title: "Success", description: "Content updated successfully" });
      setIsEditModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update content", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      toast({ title: "Success", description: "Content deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete content", variant: "destructive" });
    },
  });

  const filteredContent = contentItems?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesCourse = courseFilter === "all" || item.courseName === courseFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && item.isActive) ||
                         (statusFilter === "inactive" && !item.isActive) ||
                         (statusFilter === "public" && item.isPublic) ||
                         (statusFilter === "private" && !item.isPublic);
    
    return matchesSearch && matchesType && matchesCourse && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "video",
      courseId: "",
      moduleId: "",
      isPublic: false,
      isActive: true,
      tags: [],
    });
    setTagInput("");
    setSelectedContent(null);
    setUploadProgress(0);
  };

  const handleUpload = () => {
    setIsUploadModalOpen(true);
    resetForm();
  };

  const handleEdit = (content: ContentItem) => {
    setSelectedContent(content);
    setFormData({
      title: content.title,
      description: content.description,
      type: content.type,
      courseId: content.courseId?.toString() || "",
      moduleId: content.moduleId?.toString() || "",
      isPublic: content.isPublic,
      isActive: content.isActive,
      tags: content.tags,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContent) {
      updateMutation.mutate({
        id: selectedContent.id,
        data: {
          title: formData.title,
          description: formData.description,
          isPublic: formData.isPublic,
          isActive: formData.isActive,
          tags: formData.tags,
        },
      });
    } else {
      // Handle file upload
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('type', formData.type);
      formDataObj.append('courseId', formData.courseId);
      formDataObj.append('moduleId', formData.moduleId);
      formDataObj.append('isPublic', formData.isPublic.toString());
      formDataObj.append('isActive', formData.isActive.toString());
      formDataObj.append('tags', JSON.stringify(formData.tags));
      
      uploadMutation.mutate(formDataObj);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (content: ContentItem) => {
    // Mock download functionality
    const link = document.createElement('a');
    link.href = content.url;
    link.download = content.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Download Started", description: `Downloading ${content.fileName}` });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalStorage = contentItems?.reduce((sum, item) => sum + item.fileSize, 0) || 0;

  return (
    <AdminLayout title="Content Library">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileVideo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contentItems?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {contentItems?.filter(c => c.isActive).length || 0} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(totalStorage)}</div>
              <p className="text-xs text-muted-foreground">
                Total storage
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contentItems?.reduce((sum, item) => sum + item.viewCount, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contentItems?.reduce((sum, item) => sum + item.downloadCount, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total downloads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Content Library</CardTitle>
                <CardDescription>
                  Manage all your educational content including videos, documents, and resources
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Content
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map(course => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredContent?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No content found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContent?.map((content) => {
                      const IconComponent = contentTypeIcons[content.type];
                      return (
                        <TableRow key={content.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-8 w-8 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{content.title}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {content.description}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {content.fileName}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={contentTypeColors[content.type]}>
                              {content.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {content.courseName || "No Course"}
                              {content.moduleName && (
                                <div className="text-xs text-muted-foreground">
                                  {content.moduleName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatFileSize(content.fileSize)}
                              {content.duration && (
                                <div className="text-xs text-muted-foreground">
                                  {formatDuration(content.duration)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{content.viewCount}</TableCell>
                          <TableCell>{content.downloadCount}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={content.isActive ? "default" : "secondary"}>
                                {content.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {content.isPublic && (
                                <Badge variant="outline" className="text-xs">
                                  Public
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDownload(content)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEdit(content)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDelete(content.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Upload Modal */}
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Content</DialogTitle>
              <DialogDescription>
                Upload new content to your library
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  accept="*/*"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: ContentItem['type']) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="archive">Archive</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course (Optional)</Label>
                  <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Course</SelectItem>
                      {courses?.map(course => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module">Module (Optional)</Label>
                  <Input
                    id="module"
                    value={formData.moduleId}
                    onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                    placeholder="Module ID"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                  <Label htmlFor="isPublic">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <Label>Upload Progress</Label>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
              <DialogDescription>
                Update content details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editIsPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                  <Label htmlFor="editIsPublic">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editIsActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="editIsActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
