import { Loader2 } from "lucide-react";
import AdminLayout from "./admin-layout";

interface AdminLoadingProps {
  title?: string;
  message?: string;
}

export function AdminLoading({ title, message = "Loading..." }: AdminLoadingProps) {
  return (
    <AdminLayout title={title}>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-gray-700">{message}</p>
        </div>
      </div>
    </AdminLayout>
  );
}
