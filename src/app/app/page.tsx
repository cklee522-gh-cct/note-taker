"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getNotes, createNote, getUser, Note } from "@/lib/supabase/client";
import { FileText } from "lucide-react";

export default function AppPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>();
  const [user, setUser] = useState<{ email?: string; display_name?: string } | null>(null);

  const loadUser = useCallback(async () => {
    const { user: authUser } = await getUser();
    if (authUser) {
      setUser({
        email: authUser.email,
        display_name: authUser.user_metadata?.display_name,
      });
    }
  }, []);

  const loadNotes = useCallback(async () => {
    const { notes, error } = await getNotes();
    if (error) {
      console.error("Failed to load notes:", error);
      return;
    }
    setNotes(notes);
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadUser();
      await loadNotes();
    };
    init();
  }, [loadUser, loadNotes]);

  const handleCreateNote = async () => {
    const { note, error } = await createNote();
    if (error) {
      console.error("Failed to create note:", error);
      return;
    }
    if (note) {
      setNotes((prev) => [note, ...prev]);
      setSelectedNoteId(note.id);
      router.push(`/app/${note.id}`);
    }
  };

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    router.push(`/app/${id}`);
  };

  return (
    <AppShell
      notes={notes}
      onCreateNote={handleCreateNote}
      onSelectNote={handleSelectNote}
      selectedNoteId={selectedNoteId}
      user={user}
    >
      {notes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-[#d1d5db] mx-auto mb-4" />
            <p className="text-sm text-[#6b7280] mb-2">No notes yet</p>
            <button
              onClick={handleCreateNote}
              className="px-4 py-2 bg-[#171717] text-white text-sm font-medium rounded hover:bg-[#374151] transition-colors"
            >
              Create your first note
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-[#6b7280]">Select a note or create a new one</p>
        </div>
      )}
    </AppShell>
  );
}