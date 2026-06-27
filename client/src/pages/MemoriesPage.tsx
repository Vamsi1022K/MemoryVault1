import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, MapPin, Edit2, Trash2, Calendar, FileText, Archive } from "lucide-react";
import MemoryDialog from "@/components/MemoryDialog";
import { useApi } from "@/lib/api";

interface Category { id: string; name: string; }
interface Memory {
  id: string; name: string; location: string;
  notes?: string | null; photoUrl?: string | null;
  categoryId: string; reminderDate?: string | null;
  category: Category; createdAt: string;
}

export default function MemoriesPage() {
  const apiFetch = useApi();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memoryToEdit, setMemoryToEdit] = useState<Memory | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    if (categoryParam) setSelectedCategoryId(categoryParam);
    if (searchParam) setSearch(searchParam);
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategoryId !== "all") params.set("categoryId", selectedCategoryId);
      const res = await apiFetch(`/api/memories?${params.toString()}`);
      if (res.ok) setMemories(await res.json());
      else toast.error("Failed to load memories");
    } catch { toast.error("Failed to load memories"); }
    finally { setLoading(false); }
  }, [search, selectedCategoryId, apiFetch]);

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchMemories(), 300);
    return () => clearTimeout(timer);
  }, [fetchMemories]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this memory?")) return;
    try {
      const res = await apiFetch(`/api/memories/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Memory deleted successfully"); fetchMemories(); }
      else toast.error("Failed to delete memory");
    } catch { toast.error("Failed to delete memory"); }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            placeholder="Search by name, location, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-[180px] px-3 py-2.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            onClick={() => { setMemoryToEdit(null); setDialogOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-500/10 transition-all whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Add Memory
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Archive className="h-10 w-10 animate-bounce text-indigo-500" />
          <span className="text-sm font-medium mt-4">Searching vault...</span>
        </div>
      ) : memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 text-center">
          <Archive className="h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-slate-400">No memories found</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1 px-4">
            We couldn't find any items matching your criteria. Try adjusting your search or add a new memory.
          </p>
          <button
            onClick={() => { setMemoryToEdit(null); setDialogOpen(true); }}
            className="mt-6 px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl text-sm transition-all"
          >
            Create New Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-slate-900/35 border border-slate-800 hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col overflow-hidden group shadow-md hover:shadow-xl hover:shadow-indigo-500/5"
            >
              {memory.photoUrl && (
                <div className="h-40 w-full overflow-hidden border-b border-slate-900">
                  <img
                    src={memory.photoUrl}
                    alt={memory.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <div className="p-4 pb-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-base font-bold text-white line-clamp-1">{memory.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                    {memory.category?.name}
                  </span>
                </div>
              </div>
              <div className="flex-1 px-4 space-y-3">
                <div className="flex items-start gap-2.5 text-slate-350">
                  <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-medium">Storage Location</span>
                    <span className="text-sm font-semibold text-slate-200">{memory.location}</span>
                  </div>
                </div>
                {memory.notes && (
                  <div className="flex items-start gap-2.5 text-slate-400">
                    <FileText className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-medium">Notes</span>
                      <p className="text-xs leading-relaxed mt-0.5 line-clamp-3">{memory.notes}</p>
                    </div>
                  </div>
                )}
                {memory.reminderDate && (
                  <div className="flex items-start gap-2.5 text-emerald-400/90">
                    <Calendar className="h-4 w-4 text-emerald-500/50 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-medium">Reminder Date</span>
                      <span className="text-xs font-semibold">{new Date(memory.reminderDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-900 mt-5 pt-3 pb-3 px-4 flex justify-end gap-2 bg-slate-900/10">
                <button
                  onClick={() => { setMemoryToEdit(memory); setDialogOpen(true); }}
                  className="h-8 px-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(memory.id)}
                  className="h-8 px-2.5 rounded-lg border border-slate-800 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
