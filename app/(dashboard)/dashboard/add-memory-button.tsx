"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MemoryDialog from "@/components/memory-dialog";

interface Category {
  id: string;
  name: string;
}

export default function AddMemoryDashboardButton({
  categories,
}: {
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/10 gap-2 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Add Memory
      </Button>

      <MemoryDialog
        open={open}
        onOpenChange={setOpen}
        memoryToEdit={null}
        categories={categories}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
