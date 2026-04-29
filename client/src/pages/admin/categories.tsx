import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/admin/admin-layout";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, Folder, BookOpen, Tag, BarChart3 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
}

interface Course {
  id: number;
  categoryId: number;
  isActive: boolean;
}

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "BookOpen",
      isActive: true,
    },
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Fetch courses to count by category
  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeCategories = categories.filter((cat: Category) => cat.isActive).length;
    const totalCourses = courses.length;
    const categoriesWithCourses = new Set(courses.map((c: Course) => c.categoryId)).size;
    
    return {
      totalCategories: categories.length,
      activeCategories,
      totalCourses,
      categoriesWithCourses,
    };
  }, [categories, courses]);

  // Get course count per category
  const getCourseCount = (categoryId: number) => {
    return courses.filter((c: Course) => c.categoryId === categoryId).length;
  };

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    return categories.filter((cat: Category) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [categories, search]);

  // Create/Update mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      form.reset();
      toast({
        title: "Success",
        description: editingCategory ? "Category updated successfully" : "Category created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/categories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "BookOpen",
      isActive: category.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    const courseCount = getCourseCount(category.id);
    if (courseCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `This category has ${courseCount} course(s). Please reassign or delete the courses first.`,
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const onSubmit = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  if (categoriesLoading) {
    return (
      <AdminLayout title="Categories">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="relative w-32 h-32">
            {/* Triple-layer pulsing circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-[#1C4E9C]/20 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '75ms' }}>
              <div className="w-24 h-24 rounded-full bg-[#2A7CCD]/30 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '150ms' }}>
              <div className="w-16 h-16 rounded-full bg-[#33A9D9]/40 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Folder className="h-12 w-12 text-[#1C4E9C]" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Categories">
      {/* Hero Section */}
      <div className="relative mb-8 rounded-lg overflow-hidden bg-gradient-to-r from-[#1C4E9C] to-[#2A7CCD] p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Category Management</h1>
              <p className="text-blue-100">Organize and manage course categories</p>
            </div>
            <Folder className="h-16 w-16 opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-[#1C4E9C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Categories</p>
                <p className="text-3xl font-bold text-[#1C4E9C]">{stats.totalCategories}</p>
              </div>
              <div className="bg-[#1C4E9C]/10 p-3 rounded-lg">
                <Folder className="h-8 w-8 text-[#1C4E9C]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#33A9D9]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Categories</p>
                <p className="text-3xl font-bold text-[#33A9D9]">{stats.activeCategories}</p>
              </div>
              <div className="bg-[#33A9D9]/10 p-3 rounded-lg">
                <Tag className="h-8 w-8 text-[#33A9D9]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#2A7CCD]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-[#2A7CCD]">{stats.totalCourses}</p>
              </div>
              <div className="bg-[#2A7CCD]/10 p-3 rounded-lg">
                <BookOpen className="h-8 w-8 text-[#2A7CCD]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#FFD700]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">With Courses</p>
                <p className="text-3xl font-bold text-[#FFD700]">{stats.categoriesWithCourses}</p>
              </div>
              <div className="bg-[#FFD700]/10 p-3 rounded-lg">
                <BarChart3 className="h-8 w-8 text-[#FFD700]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            form.reset();
            setIsDialogOpen(true);
          }}
          className="bg-[#1C4E9C] hover:bg-[#2A7CCD]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No categories found</p>
            <p className="text-gray-400 text-sm">
              {search ? "Try a different search term" : "Get started by creating your first category"}
            </p>
          </div>
        ) : (
          filteredCategories.map((category: Category) => {
            const courseCount = getCourseCount(category.id);
            return (
              <Card
                key={category.id}
                className={`hover:shadow-lg transition-shadow ${
                  !category.isActive ? 'opacity-60' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#1C4E9C]/10 p-2 rounded-lg">
                        <Folder className="h-6 w-6 text-[#1C4E9C]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Badge variant={category.isActive ? "default" : "secondary"} className="mt-1">
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                    {category.description || "No description provided"}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-500">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{courseCount} course{courseCount !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., IELTS Preparation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the category..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-gray-500">
                        Make this category visible to users
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingCategory(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                  className="bg-[#1C4E9C] hover:bg-[#2A7CCD]"
                >
                  {createCategoryMutation.isPending
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
