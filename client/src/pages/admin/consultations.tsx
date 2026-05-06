import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Trash2, ClipboardList } from "lucide-react";

export default function AdminConsultations() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  });

  const { data: forms = [] } = useQuery({
    queryKey: ["/api/admin/consultation-forms"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/consultation-forms");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["/api/admin/consultation-submissions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/consultation-submissions");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/admin/consultation-forms", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Form created", description: "Consultation form added successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultation-forms"] });
      setFormData({ title: "", description: "", isActive: true });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create form",
        variant: "destructive",
      });
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/consultation-forms/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Form deleted", description: "Consultation form removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultation-forms"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete form",
        variant: "destructive",
      });
    },
  });

  const deleteSubmissionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/consultation-submissions/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Submission deleted", description: "Consultation submission removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultation-submissions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete submission",
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout title="Consultations">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Consultation Forms</h2>
            <p className="text-sm text-gray-500">Create and manage consultation forms.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add Form
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Consultation Form</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Free Consultation"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description for students"
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Active Form</p>
                    <p className="text-xs text-gray-500">Use this form on the website.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate(formData)}
                  disabled={!formData.title}
                >
                  Create Form
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forms</CardTitle>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <div className="text-sm text-gray-500">No forms yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form: any) => (
                    <TableRow key={form.id}>
                      <TableCell>
                        <div className="font-medium">{form.title}</div>
                        <p className="text-xs text-gray-500">{form.description || "No description"}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={form.isActive ? "default" : "secondary"}>
                          {form.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFormMutation.mutate(form.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Consultation Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-sm text-gray-500">No submissions yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>IELTS</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission: any) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="font-medium">
                          {submission.firstName} {submission.lastName}
                        </div>
                        <p className="text-xs text-gray-500">{submission.email}</p>
                      </TableCell>
                      <TableCell>{submission.phone}</TableCell>
                      <TableCell>{submission.ieltsStatus}</TableCell>
                      <TableCell>
                        {new Date(submission.preferredDate).toLocaleDateString()} • {submission.preferredTime}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubmissionMutation.mutate(submission.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
