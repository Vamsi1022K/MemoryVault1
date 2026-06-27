import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { memorySchema, MemorySchemaType } from "@/lib/schemas";
import { Upload, X } from "lucide-react";
import { useApi } from "@/lib/api";

interface Category {
  id: string;
  name: string;
}

interface Memory {
  id: string;
  name: string;
  location: string;
  notes?: string | null;
  photoUrl?: string | null;
  categoryId: string;
  reminderDate?: string | Date | null;
}

interface MemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memoryToEdit: Memory | null;
  categories: Category[];
  onSuccess: () => void;
}

export default function MemoryDialog({
  open,
  onOpenChange,
  memoryToEdit,
  categories,
  onSuccess,
}: MemoryDialogProps) {
  const apiFetch = useApi();
  const isEdit = !!memoryToEdit;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemorySchemaType>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      name: "",
      location: "",
      notes: "",
      photoUrl: "",
      categoryId: "",
      reminderDate: null,
    },
  });

  const watchedCategoryId = watch("categoryId");
  const watchedPhotoUrl = watch("photoUrl");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setValue("photoUrl", base64String, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const getLocalDateTimeString = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const formatLocalDateForInput = (dateVal: string | Date | null | undefined) => {
    if (!dateVal) return "";
    const dateObj = new Date(dateVal);
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    return new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Populate form with existing values when in editing mode
  useEffect(() => {
    if (memoryToEdit) {
      reset({
        name: memoryToEdit.name,
        location: memoryToEdit.location,
        notes: memoryToEdit.notes || "",
        photoUrl: memoryToEdit.photoUrl || "",
        categoryId: memoryToEdit.categoryId,
        reminderDate: memoryToEdit.reminderDate
          ? formatLocalDateForInput(memoryToEdit.reminderDate)
          : null,
      });
    } else {
      reset({
        name: "",
        location: "",
        notes: "",
        photoUrl: "",
        categoryId: "",
        reminderDate: null,
      });
    }
  }, [memoryToEdit, reset, open]);

  const onSubmit = async (data: MemorySchemaType) => {
    try {
      const url = isEdit ? `/api/memories/${memoryToEdit.id}` : "/api/memories";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...data,
        notes: data.notes || null,
        photoUrl: data.photoUrl || null,
        reminderDate: data.reminderDate
          ? new Date(data.reminderDate).toISOString()
          : null,
      };

      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEdit ? "update" : "create"} memory`);
      }

      toast.success(`Memory ${isEdit ? "updated" : "saved"} successfully!`);
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-[480px] bg-white border border-appBorder text-appTextPrimary rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-appTextSecondary hover:text-appTextPrimary hover:bg-appMuted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-appTextPrimary mb-4">
          {isEdit ? "Edit Memory" : "Save a New Memory"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-appTextSecondary">Item Name</label>
            <input
              id="name"
              placeholder="e.g., Passport, Spare Keys, Gold Necklace"
              className="w-full bg-white border border-appBorder focus:outline-none focus:ring-2 focus:ring-appPrimary focus:border-transparent rounded-xl px-3.5 py-2.5 text-appTextPrimary outline-none text-sm shadow-soft"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-appTextSecondary">Category</label>
            <select
              id="category"
              value={watchedCategoryId || ""}
              onChange={(e) => setValue("categoryId", e.target.value || "", { shouldValidate: true })}
              className="w-full bg-white border border-appBorder focus:outline-none focus:ring-2 focus:ring-appPrimary focus:border-transparent rounded-xl px-3.5 py-2.5 text-appTextPrimary outline-none text-sm shadow-soft"
            >
              <option value="" disabled className="text-appTextSecondary/60">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="text-appTextPrimary">
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Storage Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-appTextSecondary">Storage Location</label>
            <input
              id="location"
              placeholder="e.g., Safe box, Blue drawer, Wardrobe shelf"
              className="w-full bg-white border border-appBorder focus:outline-none focus:ring-2 focus:ring-appPrimary focus:border-transparent rounded-xl px-3.5 py-2.5 text-appTextPrimary outline-none text-sm shadow-soft"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-appTextSecondary">Notes (Optional)</label>
            <textarea
              id="notes"
              placeholder="Add any helpful reminders, expiry details, descriptions, etc."
              rows={3}
              className="w-full bg-white border border-appBorder focus:outline-none focus:ring-2 focus:ring-appPrimary focus:border-transparent rounded-xl px-3.5 py-2.5 text-appTextPrimary outline-none text-sm resize-none shadow-soft"
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>
            )}
          </div>

          {/* Reminder Date */}
          <div className="space-y-2">
            <label htmlFor="reminderDate" className="block text-sm font-medium text-appTextSecondary">Reminder/Expiry Date (Optional)</label>
            <input
              id="reminderDate"
              type="datetime-local"
              className="w-full bg-white border border-appBorder focus:outline-none focus:ring-2 focus:ring-appPrimary focus:border-transparent rounded-xl px-3.5 py-2.5 text-appTextPrimary outline-none text-sm block shadow-soft"
              min={getLocalDateTimeString()}
              onChange={(e) => {
                const dateStr = e.target.value;
                setValue("reminderDate", dateStr || null, { shouldValidate: true });
              }}
              value={formatLocalDateForInput(watch("reminderDate"))}
            />
            {errors.reminderDate && (
              <p className="text-xs text-red-500 mt-1">{errors.reminderDate.message}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-appTextSecondary font-semibold">Item Photo (Optional)</label>
            
            {watchedPhotoUrl ? (
              <div className="relative rounded-xl border border-appBorder bg-appMuted/30 overflow-hidden h-40 w-full group">
                <img
                  src={watchedPhotoUrl}
                  alt="Item Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setValue("photoUrl", "", { shouldValidate: true })}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-650/90 text-white hover:bg-red-600 transition-colors shadow-md cursor-pointer flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-appBorder hover:border-appPrimary/40 bg-appMuted/20 hover:bg-appMuted/35 rounded-xl h-40 w-full cursor-pointer transition-all group">
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="p-2.5 rounded-lg bg-white text-appTextSecondary group-hover:text-appPrimary transition-colors shadow-soft">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-appTextSecondary">Click to upload an image</span>
                    <p className="text-[10px] text-appTextSecondary/70 mt-1">PNG, JPG, or WEBP (Max 2MB)</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            {errors.photoUrl && (
              <p className="text-xs text-red-500 mt-1">{errors.photoUrl.message}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-appBorder">
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-appBorder text-appTextSecondary hover:bg-appMuted hover:text-appTextPrimary transition-colors cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-appPrimary hover:bg-appPrimary-hover text-white shadow-md shadow-appPrimary/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>

  );
}
