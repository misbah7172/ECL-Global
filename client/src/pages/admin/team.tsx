import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";

const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialization?: string;
  experience?: string;
  credentials?: string;
  bio?: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  order?: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function TeamAdmin() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: "",
    role: "",
    specialization: "",
    experience: "",
    credentials: "",
    bio: "",
    imageUrl: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    order: 0,
    isFeatured: false,
    isActive: true,
  });

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["/api/admin/team"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<TeamMember>) => {
      const response = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create team member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<TeamMember>) => {
      const response = await fetch(`/api/admin/team/${editingMember?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update team member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete team member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
    },
  });

  const handleOpenDialog = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setFormData(member);
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        role: "",
        specialization: "",
        experience: "",
        credentials: "",
        bio: "",
        imageUrl: "",
        email: "",
        phone: "",
        linkedinUrl: "",
        order: 0,
        isFeatured: false,
        isActive: true,
      });
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingMember(null);
    setFormData({});
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.role) {
      alert("Name and role are required");
      return;
    }

    if (editingMember) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">Loading team members...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      <Header />

      <div className="container mx-auto px-4 max-w-6xl py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
              Team Management
            </h1>
            <p style={{ color: COLORS.darkGrey }}>
              Add and manage team members displayed on the homepage
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="text-white font-semibold"
            style={{ backgroundColor: COLORS.skyBlue }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle style={{ color: COLORS.deepBlue }}>
              Team Members ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: COLORS.darkGrey }} className="mb-4">
                  No team members added yet.
                </p>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="text-white font-semibold"
                  style={{ backgroundColor: COLORS.skyBlue }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Team Member
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ color: COLORS.deepBlue }} className="font-bold">
                        Name
                      </TableHead>
                      <TableHead style={{ color: COLORS.deepBlue }} className="font-bold">
                        Role
                      </TableHead>
                      <TableHead style={{ color: COLORS.deepBlue }} className="font-bold">
                        Specialization
                      </TableHead>
                      <TableHead style={{ color: COLORS.deepBlue }} className="font-bold">
                        Active
                      </TableHead>
                      <TableHead style={{ color: COLORS.deepBlue }} className="font-bold">
                        Featured
                      </TableHead>
                      <TableHead style={{ color: COLORS.deepBlue }} className="font-bold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member: TeamMember) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{member.specialization || "-"}</TableCell>
                        <TableCell>
                          {member.isActive ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </TableCell>
                        <TableCell>
                          {member.isFeatured ? (
                            <Badge
                              className="text-white font-semibold"
                              style={{ backgroundColor: COLORS.skyBlue }}
                            >
                              Featured
                            </Badge>
                          ) : (
                            <Badge variant="outline">Regular</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDialog(member)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Delete ${member.name}? This action cannot be undone.`
                                  )
                                ) {
                                  deleteMutation.mutate(member.id);
                                }
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: COLORS.deepBlue }}>
              {editingMember ? "Edit Team Member" : "Add New Team Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update team member information"
                : "Add a new team member to be displayed on the homepage"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                Name *
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Team member name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                Role *
              </label>
              <Input
                value={formData.role || ""}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., Director, Consultant, Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                Specialization
              </label>
              <Input
                value={formData.specialization || ""}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                placeholder="e.g., Study Abroad, Career Counseling"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                Experience
              </label>
              <Input
                value={formData.experience || ""}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g., 10+ years in education"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                Credentials
              </label>
              <Input
                value={formData.credentials || ""}
                onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                placeholder="e.g., M.A. Education, B.Sc. Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                Bio
              </label>
              <textarea
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief bio or description"
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                Image URL
              </label>
              <Input
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                Email
              </label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="team@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                Phone
              </label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                LinkedIn URL
              </label>
              <Input
                value={formData.linkedinUrl || ""}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.deepBlue }}>
                Order (Display Position)
              </label>
              <Input
                type="number"
                value={formData.order || 0}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium" style={{ color: COLORS.deepBlue }}>
                  Featured Member
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium" style={{ color: COLORS.deepBlue }}>
                  Active
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 text-white font-semibold"
                style={{ backgroundColor: COLORS.skyBlue }}
              >
                {editingMember ? "Update Member" : "Add Member"}
              </Button>
              <Button
                onClick={handleCloseDialog}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
