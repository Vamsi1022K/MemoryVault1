"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { memorySchema, MemorySchemaType } from "@/lib/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

      const response = await fetch(url, {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-slate-900 border-slate-800 text-slate-100 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {isEdit ? "Edit Memory" : "Save a New Memory"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Item Name</Label>
            <Input
              id="name"
              placeholder="e.g., Passport, Spare Keys, Gold Necklace"
              className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-300">Category</Label>
            <Select
              value={watchedCategoryId}
              onValueChange={(val) => setValue("categoryId", val || "", { shouldValidate: true })}
            >
              <SelectTrigger id="category" className="bg-slate-950 border-slate-800 focus:ring-indigo-500 rounded-xl">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-850 text-slate-200 rounded-xl">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="cursor-pointer focus:bg-indigo-600 focus:text-white rounded-lg">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-red-400 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Storage Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-300">Storage Location</Label>
            <Input
              id="location"
              placeholder="e.g., Safe box, Blue drawer, Wardrobe shelf"
              className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-xs text-red-400 mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any helpful reminders, expiry details, descriptions, etc."
              rows={3}
              className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 rounded-xl resize-none"
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-red-400 mt-1">{errors.notes.message}</p>
            )}
          </div>

          {/* Reminder Date */}
          <div className="space-y-2">
            <Label htmlFor="reminderDate" className="text-slate-300">Reminder/Expiry Date (Optional)</Label>
            <Input
              id="reminderDate"
              type="datetime-local"
              className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 rounded-xl block w-full [color-scheme:dark]"
              min={getLocalDateTimeString()}
              onChange={(e) => {
                const dateStr = e.target.value;
                setValue("reminderDate", dateStr || null, { shouldValidate: true });
              }}
              value={formatLocalDateForInput(watch("reminderDate"))}
            />
            {errors.reminderDate && (
              <p className="text-xs text-red-400 mt-1">{errors.reminderDate.message}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-slate-300">Item Photo (Optional)</Label>
            
            {watchedPhotoUrl ? (
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden h-40 w-full group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={watchedPhotoUrl}
                  alt="Item Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setValue("photoUrl", "", { shouldValidate: true })}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-500 transition-colors shadow-md cursor-pointer flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950 rounded-xl h-40 w-full cursor-pointer transition-all group">
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-900 text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-350">Click to upload an image</span>
                    <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, or WEBP (Max 2MB)</p>
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
              <p className="text-xs text-red-400 mt-1">{errors.photoUrl.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/10"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
