"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MapPin,
  Tag,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  Archive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MemoryDialog from "@/components/memory-dialog";

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
  category: Category;
  createdAt: string;
}

function MemoriesContent() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategoryId(categoryParam);
    }
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [categoryParam, searchParam]);

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memoryToEdit, setMemoryToEdit] = useState<Memory | null>(null);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch Memories
  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (selectedCategoryId !== "all") queryParams.set("categoryId", selectedCategoryId);

      const res = await fetch(`/api/memories?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      } else {
        toast.error("Failed to load memories");
      }
    } catch (error) {
      console.error("Error fetching memories:", error);
      toast.error("Failed to load memories");
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategoryId]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMemories();
    }, 300); // 300ms debounce for search input
    return () => clearTimeout(timer);
  }, [search, selectedCategoryId, fetchMemories]);

  // Delete Memory
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this memory?")) return;

    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Memory deleted successfully");
        fetchMemories();
      } else {
        toast.error("Failed to delete memory");
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast.error("Failed to delete memory");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name, location, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-slate-100 rounded-xl focus-visible:ring-indigo-500 w-full"
          />
        </div>

        {/* Category Filter and Add Button */}
        <div className="flex gap-3">
          <Select value={selectedCategoryId} onValueChange={(value) => setSelectedCategoryId(value || "all")}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-800 text-slate-200 rounded-xl">
              <SelectValue placeholder="Category: All" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200 rounded-xl">
              <SelectItem value="all" className="cursor-pointer focus:bg-indigo-600 focus:text-white rounded-lg">
                All Categories
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="cursor-pointer focus:bg-indigo-600 focus:text-white rounded-lg">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Memory Button */}
          <Button
            onClick={() => {
              setMemoryToEdit(null);
              setDialogOpen(true);
            }}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/10 gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Memory
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Archive className="h-10 w-10 animate-bounce text-indigo-500" />
          <span className="text-sm font-medium mt-4">Searching vault...</span>
        </div>
      ) : memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 text-center">
          <Archive className="h-12 w-12 text-slate-750 mb-4" />
          <h3 className="text-lg font-bold text-slate-350">No memories found</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1 px-4">
            We couldn&apos;t find any items matching your criteria. Try adjusting your search query, selecting another category, or add a new memory.
          </p>
          <Button
            onClick={() => {
              setMemoryToEdit(null);
              setDialogOpen(true);
            }}
            variant="outline"
            className="mt-6 border-slate-850 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl"
          >
            Create New Memory
          </Button>
        </div>
      ) : (
        /* Memories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <Card
              key={memory.id}
              className="bg-slate-900/35 border-slate-850 hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col overflow-hidden h-full group shadow-md hover:shadow-xl hover:shadow-indigo-500/5"
            >
              {/* Photo display */}
              {memory.photoUrl ? (
                <div className="h-40 w-full overflow-hidden border-b border-slate-900 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={memory.photoUrl}
                    alt={memory.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ""; 
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : null}

              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base font-bold text-white line-clamp-1">
                    {memory.name}
                  </CardTitle>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                    {memory.category.name}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 py-0 space-y-3">
                {/* Location */}
                <div className="flex items-start gap-2.5 text-slate-350">
                  <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-medium">Storage Location</span>
                    <span className="text-sm font-semibold">{memory.location}</span>
                  </div>
                </div>

                {/* Notes */}
                {memory.notes && (
                  <div className="flex items-start gap-2.5 text-slate-400">
                    <FileText className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-medium">Notes</span>
                      <p className="text-xs leading-relaxed mt-0.5 line-clamp-3">{memory.notes}</p>
                    </div>
                  </div>
                )}

                {/* Reminder Date */}
                {memory.reminderDate && (
                  <div className="flex items-start gap-2.5 text-emerald-450/90">
                    <Calendar className="h-4 w-4 text-emerald-500/50 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-medium">Reminder Date</span>
                      <span className="text-xs font-semibold">
                        {new Date(memory.reminderDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-slate-900 mt-5 pt-3 pb-3 flex justify-end gap-2 bg-slate-900/10">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setMemoryToEdit(memory);
                    setDialogOpen(true);
                  }}
                  className="h-8 px-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(memory.id)}
                  className="h-8 px-2.5 rounded-lg border border-slate-800 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Reusable Memory Dialog */}
      <MemoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        memoryToEdit={memoryToEdit}
        categories={categories}
        onSuccess={fetchMemories}
      />
    </div>
  );
}

export default function MemoriesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Archive className="h-10 w-10 animate-bounce text-indigo-500" />
        <span className="text-sm font-medium mt-4">Loading memories...</span>
      </div>
    }>
      <MemoriesContent />
    </Suspense>
  );
}
