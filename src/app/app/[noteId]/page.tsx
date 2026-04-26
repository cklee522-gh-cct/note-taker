"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Sparkles, RefreshCw } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import {
  getNotes,
  createNote,
  getUser,
  updateNote,
  deleteNote,
  uploadImage,
  Note,
  LineMetadata,
  addComment as addCommentApi,
  deleteComment as deleteCommentApi,
  toggleTask as toggleTaskApi,
  convertToTask as convertToTaskApi,
  migrateNoteLineMetadata,
} from "@/lib/supabase/client";
import LineEditor from "@/components/notes/LineEditor";
import LineSidebar from "@/components/notes/LineSidebar";

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryModel, setSummaryModel] = useState<string>("");
  const [lineMetadata, setLineMetadata] = useState<LineMetadata[]>([]);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const migratedRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const summaryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setLineMetadata(note.line_metadata || []);
      if (!note.line_metadata && !migratedRef.current) {
        migratedRef.current = true;
        await migrateNoteLineMetadata(noteId, note.content);
        setLineMetadata(
          note.content.split("\n").map((_line: string, i: number) => ({
            lineIndex: i,
            commentCount: 0,
            comments: [],
            isTask: false,
            taskCompleted: false,
          }))
        );
      }
    }
  }, [noteId]);

  const generateSummary = useCallback(async (noteContent: string, metadata: LineMetadata[]) => {
    if (!noteContent.trim() && metadata.every(m => m.comments.length === 0)) {
      setSummary("");
      return;
    }

    let contentToSummarize = noteContent;
    const commentsWithLine = metadata
      .filter(m => m.comments.length > 0)
      .map(m => {
        const lineText = noteContent.split("\n")[m.lineIndex] || "";
        return `Line ${m.lineIndex + 1} "${lineText}": ${m.comments.map(c => c.text).join("; ")}`;
      });

    if (commentsWithLine.length > 0) {
      contentToSummarize = `${noteContent}\n\nComments:\n${commentsWithLine.join("\n")}`;
    }

    setSummaryLoading(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToSummarize }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data.summary || "");
      setSummaryModel(data.model || "");
    } catch (error) {
      console.error("Summary generation failed:", error);
      setSummary("");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadUser();
      await loadNotes();
    };
    init();
  }, [loadUser, loadNotes]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          setUploadingImage(true);
          setImageError(null);
          const { url, error } = await uploadImage(file);
          setUploadingImage(false);

          if (error || !url) {
            setImageError(error?.message || "Upload failed");
            console.error("Failed to upload image:", error);
            return;
          }

          const textarea = textareaRef.current;
          const imgMarkdown = `![image](${url})`;

          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = content.slice(0, start) + imgMarkdown + content.slice(end);
            setContent(newContent);
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + imgMarkdown.length;
              textarea.focus();
            }, 0);
            if (noteId) {
              setSaving(true);
              await updateNote(noteId, { title, content: newContent });
              setSaving(false);
            }
          }
          return;
        }
      }
    };

    editor.addEventListener("paste", handlePaste);
    return () => editor.removeEventListener("paste", handlePaste);
  }, [content, title, noteId]);

  useEffect(() => {
    if (summaryTimeoutRef.current) {
      clearTimeout(summaryTimeoutRef.current);
    }
    summaryTimeoutRef.current = setTimeout(() => {
      generateSummary(content, lineMetadata);
    }, 2000);
    return () => {
      if (summaryTimeoutRef.current) {
        clearTimeout(summaryTimeoutRef.current);
      }
    };
  }, [content, generateSummary]);

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

  const handleAddComment = useCallback(
    async (lineIndex: number, text: string) => {
      const { error } = await addCommentApi(noteId, lineIndex, text);
      if (error) {
        console.error("Failed to add comment:", error);
        return;
      }
      setLineMetadata((prev) => {
        const newMetadata = [...prev];
        const existing = newMetadata.find((m) => m.lineIndex === lineIndex);
        if (existing) {
          existing.comments.push({
            id: crypto.randomUUID(),
            text,
            createdAt: new Date().toISOString(),
          });
          existing.commentCount = existing.comments.length;
        } else {
          newMetadata.push({
            lineIndex,
            commentCount: 1,
            comments: [{ id: crypto.randomUUID(), text, createdAt: new Date().toISOString() }],
            isTask: false,
            taskCompleted: false,
          });
        }
        return newMetadata;
      });
    },
    [noteId]
  );

  const handleDeleteComment = useCallback(
    async (lineIndex: number, commentId: string) => {
      const { error } = await deleteCommentApi(noteId, lineIndex, commentId);
      if (error) {
        console.error("Failed to delete comment:", error);
        return;
      }
      setLineMetadata((prev) =>
        prev
          .map((m) => {
            if (m.lineIndex === lineIndex) {
              return {
                ...m,
                comments: m.comments.filter((c) => c.id !== commentId),
                commentCount: m.comments.filter((c) => c.id !== commentId).length,
              };
            }
            return m;
          })
          .filter((m) => m.commentCount > 0 || m.isTask)
      );
    },
    [noteId]
  );

  const handleToggleTask = useCallback(
    async (lineIndex: number, completed: boolean) => {
      const { error } = await toggleTaskApi(noteId, lineIndex, completed);
      if (error) {
        console.error("Failed to toggle task:", error);
        return;
      }
      setLineMetadata((prev) => {
        const newMetadata = [...prev];
        const existing = newMetadata.find((m) => m.lineIndex === lineIndex);
        if (existing) {
          existing.isTask = true;
          existing.taskCompleted = completed;
        } else {
          newMetadata.push({
            lineIndex,
            commentCount: 0,
            comments: [],
            isTask: true,
            taskCompleted: completed,
          });
        }
        return newMetadata;
      });
    },
    [noteId]
  );

  const handleConvertToTask = useCallback(
    async (lineIndex: number) => {
      const { error } = await convertToTaskApi(noteId, lineIndex);
      if (error) {
        console.error("Failed to convert to task:", error);
        return;
      }
      setLineMetadata((prev) => {
        const newMetadata = [...prev];
        const existing = newMetadata.find((m) => m.lineIndex === lineIndex);
        if (existing) {
          existing.isTask = true;
        } else {
          newMetadata.push({
            lineIndex,
            commentCount: 0,
            comments: [],
            isTask: true,
            taskCompleted: false,
          });
        }
        return newMetadata;
      });
    },
    [noteId]
  );

  const handleCloseSidebar = () => {
    setSelectedLineIndex(null);
  };

  const selectedLineContent =
    selectedLineIndex !== null ? content.split("\n")[selectedLineIndex] || "" : "";

  const selectedLineMetadata = lineMetadata.find((m) => m.lineIndex === selectedLineIndex);

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
              {uploadingImage && (
                <span className="text-xs text-[#6b7280]">Uploading image...</span>
              )}
              {imageError && (
                <span className="text-xs text-[#dc2626]">{imageError}</span>
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
        <div className="relative flex-1 flex overflow-hidden" ref={editorRef}>
          <div className="flex-1 flex flex-col px-8 py-6 overflow-y-auto">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled"
              className="w-full text-2xl font-semibold text-[#171717] placeholder-[#d1d5db] bg-transparent border-none outline-none mb-4"
            />
            <LineEditor
              content={content}
              lineMetadata={lineMetadata}
              selectedLineIndex={selectedLineIndex}
              onContentChange={(newContent) => {
                setContent(newContent);
                handleSave(title, newContent);
              }}
              onSelectLine={(index) => setSelectedLineIndex(index)}
              onAddComment={(index) => {
                setSelectedLineIndex(index);
              }}
              onToggleTask={handleToggleTask}
              onConvertToTask={handleConvertToTask}
            />
          </div>

          {/* Sidebar: Summary + Comments/Tasks */}
          <aside className="absolute right-6 top-20 w-[360px] max-h-[calc(100vh-160px)] bg-white border border-[#e5e7eb] rounded-2xl shadow-lg shadow-black/5 flex flex-col overflow-hidden">
            {/* Summary Panel */}
            <div className="p-4 border-b border-[#e5e7eb]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                  <h2 className="text-sm font-semibold text-[#171717]">Summary</h2>
                </div>
                <button
                  onClick={() => generateSummary(content, lineMetadata)}
                  disabled={summaryLoading}
                  className="p-1.5 rounded hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
                  title="Regenerate summary"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#6b7280] ${summaryLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
              {summaryModel && (
                <p className="text-xs text-[#8b5cf6] mt-1">Model: {summaryModel}</p>
              )}
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {summaryLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                  <div className="w-4 h-4 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
                  <span>Generating summary...</span>
                </div>
              ) : summary ? (
                <p className="text-sm text-[#171717] leading-relaxed whitespace-pre-wrap">{summary}</p>
              ) : (
                <p className="text-sm text-[#6b7280]">Summary will appear here as you write...</p>
              )}
            </div>

            {/* Comments/Tasks Panel */}
            <LineSidebar
              selectedLineIndex={selectedLineIndex}
              selectedLineContent={selectedLineContent}
              metadata={selectedLineMetadata}
              onAddComment={(text) => {
                if (selectedLineIndex !== null) {
                  handleAddComment(selectedLineIndex, text);
                }
              }}
              onDeleteComment={(commentId) => {
                if (selectedLineIndex !== null) {
                  handleDeleteComment(selectedLineIndex, commentId);
                }
              }}
              onToggleTask={(completed) => {
                if (selectedLineIndex !== null) {
                  handleToggleTask(selectedLineIndex, completed);
                }
              }}
              onConvertToTask={() => {
                if (selectedLineIndex !== null) {
                  handleConvertToTask(selectedLineIndex);
                }
              }}
              onClose={handleCloseSidebar}
            />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}