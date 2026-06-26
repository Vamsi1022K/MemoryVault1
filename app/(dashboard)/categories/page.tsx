"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { categorySchema, CategorySchemaType } from "@/lib/schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, FolderPlus, HelpCircle } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  isCustom: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategorySchemaType>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: CategorySchemaType) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      toast.success("Custom category created successfully!");
      reset();
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Category Form */}
      <div className="lg:col-span-1">
        <Card className="bg-slate-900/30 border-slate-800 rounded-2xl lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-indigo-400" />
              Add Custom Category
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Create a custom group to classify your unique belongings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-350 text-xs">Category Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Important Documents, Memorabilia"
                  className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                {isSubmitting ? "Creating..." : "Create Category"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid List */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-slate-900/10 border-slate-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Folder className="h-4 w-4 text-indigo-400" />
              Active Vault Categories
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Categories available for classification
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Folder className="h-8 w-8 animate-pulse text-indigo-500" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-slate-700" />
                <p className="text-sm font-medium">No categories found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/memories?category=${category.id}`}
                    className={`p-4 rounded-xl border border-slate-850 bg-slate-900/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group shadow-sm ${
                      category.isCustom
                        ? "hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5"
                        : "hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.isCustom ? "bg-purple-500/10 text-purple-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                        <Folder className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-200">{category.name}</span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      category.isCustom
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-slate-800 text-slate-450 border-slate-700/50"
                    }`}>
                      {category.isCustom ? "Custom" : "Default"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
