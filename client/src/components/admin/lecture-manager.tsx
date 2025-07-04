import { useState } from "react";
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Move, Video, FileText, Eye, Lock } from "lucide-react";
import { CourseFormData, Lecture } from "@/types/course";

interface LectureManagerProps {
  control: Control<CourseFormData>;
}

export function LectureManager({ control }: LectureManagerProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "lectures",
  });

  const [editingLecture, setEditingLecture] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addLecture = () => {
    append({
      title: "",
      description: "",
      duration: 0,
      videoUrl: "",
      content: "",
      order: fields.length + 1,
      isFree: fields.length === 0, // First lecture is free by default
      materials: [],
    });
    setEditingLecture(fields.length);
    setIsDialogOpen(true);
  };

  const editLecture = (index: number) => {
    setEditingLecture(index);
    setIsDialogOpen(true);
  };

  const deleteLecture = (index: number) => {
    remove(index);
    // Reorder remaining lectures
    for (let i = index; i < fields.length - 1; i++) {
      // Update order values
    }
  };

  const moveLecture = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Course Lectures</h3>
        <Button onClick={addLecture} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Lecture
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h4 className="font-medium text-gray-900 mb-2">No lectures added yet</h4>
            <p className="text-gray-500 mb-4">Add your first lecture to get started</p>
            <Button onClick={addLecture}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Lecture
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const lecture = field as Lecture;
            return (
              <Card key={field.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">
                          Lecture {index + 1}
                        </span>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Free Preview
                          </Badge>
                        )}
                        {index > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">
                        {lecture.title || `Lecture ${index + 1}`}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editLecture(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLecture(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>{lecture.duration} minutes</span>
                      {lecture.videoUrl && (
                        <Badge variant="outline" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                      {lecture.content && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Content
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveLecture(index, index - 1)}
                        >
                          ↑
                        </Button>
                      )}
                      {index < fields.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveLecture(index, index + 1)}
                        >
                          ↓
                        </Button>
                      )}
                    </div>
                  </div>
                  {lecture.description && (
                    <p className="text-sm text-gray-600 mt-2">{lecture.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Lecture Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLecture !== null 
                ? `Edit Lecture ${editingLecture + 1}` 
                : "Add New Lecture"}
            </DialogTitle>
          </DialogHeader>

          {editingLecture !== null && (
            <div className="space-y-4">
              <FormField
                control={control}
                name={`lectures.${editingLecture}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecture Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lecture title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`lectures.${editingLecture}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter lecture description" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`lectures.${editingLecture}.duration`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="30" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`lectures.${editingLecture}.isFree`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 pt-8">
                      <FormControl>
                        <Switch 
                          checked={field.value || editingLecture === 0} 
                          onCheckedChange={field.onChange}
                          disabled={editingLecture === 0} // First lecture is always free
                        />
                      </FormControl>
                      <FormLabel>Free Preview</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name={`lectures.${editingLecture}.videoUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/video.mp4" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`lectures.${editingLecture}.content`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecture Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter lecture content, notes, or transcript" 
                        {...field} 
                        rows={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  Save Lecture
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
