"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { getNotes, createNote, getUser, updateNote, deleteNote, Note } from "@/lib/supabase/client";

interface NoteEditorProps {
  params: Promise<{ noteId: string }>;
}

export default function NoteEditorPage({ params }: NoteEditorProps) {
  const { noteId } = use(params);
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<{ email?: string; display_name?: string } | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>(noteId);

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
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [noteId]);

  useEffect(() => {
    const init = async () => {
      await loadUser();
      await loadNotes();
    };
    init();
  }, [loadUser, loadNotes]);

  const handleSave = useCallback(
    async (newTitle: string, newContent: string) => {
      if (!noteId) return;
      setSaving(true);
      const { error } = await updateNote(noteId, { title: newTitle, content: newContent });
      setSaving(false);
      if (error) {
        console.error("Failed to save note:", error);
      }
    },
    [noteId]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    handleSave(newTitle, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    handleSave(title, newContent);
  };

  const handleDelete = async () => {
    if (!noteId) return;
    if (!confirm("Are you sure you want to delete this note?")) return;

    const { error } = await deleteNote(noteId);
    if (error) {
      console.error("Failed to delete note:", error);
      return;
    }
    router.push("/app");
  };

  const handleBack = () => {
    router.push("/app");
  };

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
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded hover:bg-[#f5f5f5] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6b7280]" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium text-[#171717]">
                {title || "Untitled"}
              </h1>
              {saving && (
                <span className="text-xs text-[#6b7280]">Saving...</span>
              )}
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 rounded hover:bg-[#fef2f2] transition-colors text-[#6b7280] hover:text-[#dc2626]"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </header>

        {/* Editor */}
        <div className="flex-1 flex flex-col px-8 py-6 overflow-y-auto">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="w-full text-2xl font-semibold text-[#171717] placeholder-[#d1d5db] bg-transparent border-none outline-none mb-4"
          />
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing..."
            className="w-full flex-1 text-base text-[#171717] placeholder-[#d1d5db] bg-transparent border-none outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </AppShell>
  );
}