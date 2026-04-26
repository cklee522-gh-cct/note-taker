import { createClient } from "./browser-client";

export async function signUp(email: string, password: string, name: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  });

  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export interface LineMetadata {
  lineIndex: number;
  commentCount: number;
  comments: Comment[];
  isTask: boolean;
  taskCompleted: boolean;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  line_metadata: LineMetadata[] | null;
  created_at: string;
  updated_at: string;
}

export async function getNotes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });
  return { notes: data ?? [], error };
}

export async function createNote() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { note: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("notes")
    .insert({ title: "Untitled", content: "", user_id: user.id })
    .select()
    .single();
  return { note: data, error };
}

export async function updateNote(id: string, updates: { title?: string; content?: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { note: data, error };
}

export async function deleteNote(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  return { error };
}

export async function uploadImage(file: File) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { url: null, error: new Error("Not authenticated") };

  const ext = file.name.split(".").pop() || "png";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("note-images")
    .upload(fileName, file, { upsert: true });

  if (error) {
    console.error("Storage upload error:", error);
    return { url: null, error };
  }

  if (!data?.path) {
    return { url: null, error: new Error("No path returned from upload") };
  }

  const { data: urlData } = supabase.storage.from("note-images").getPublicUrl(data.path);
  return { url: urlData.publicUrl, error: null };
}

export async function updateLineMetadata(
  noteId: string,
  lineMetadata: LineMetadata[]
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("notes")
    .update({ line_metadata: lineMetadata, updated_at: new Date().toISOString() })
    .eq("id", noteId);
  return { error };
}

export async function addComment(
  noteId: string,
  lineIndex: number,
  text: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { data: note, error: fetchError } = await supabase
    .from("notes")
    .select("line_metadata")
    .eq("id", noteId)
    .single();

  if (fetchError || !note) {
    return { error: fetchError || new Error("Note not found") };
  }

  const currentMetadata = note.line_metadata || [];
  const newMetadata = [...currentMetadata];
  const lineEntry = newMetadata.find((m) => m.lineIndex === lineIndex);

  const newComment: Comment = {
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  };

  if (lineEntry) {
    lineEntry.comments.push(newComment);
    lineEntry.commentCount = lineEntry.comments.length;
  } else {
    newMetadata.push({
      lineIndex,
      commentCount: 1,
      comments: [newComment],
      isTask: false,
      taskCompleted: false,
    });
  }

  const { error } = await supabase
    .from("notes")
    .update({ line_metadata: newMetadata, updated_at: new Date().toISOString() })
    .eq("id", noteId);

  return { error };
}

export async function deleteComment(
  noteId: string,
  lineIndex: number,
  commentId: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { data: note, error: fetchError } = await supabase
    .from("notes")
    .select("line_metadata")
    .eq("id", noteId)
    .single();

  if (fetchError || !note) {
    return { error: fetchError || new Error("Note not found") };
  }

  const currentMetadata = note.line_metadata || [];
  const newMetadata = currentMetadata
    .map((m: LineMetadata) => {
      if (m.lineIndex === lineIndex) {
        return {
          ...m,
          comments: m.comments.filter((c: Comment) => c.id !== commentId),
          commentCount: m.comments.filter((c: Comment) => c.id !== commentId).length,
        };
      }
      return m;
    })
    .filter((m: LineMetadata) => m.commentCount > 0 || m.isTask);

  const { error } = await supabase
    .from("notes")
    .update({ line_metadata: newMetadata, updated_at: new Date().toISOString() })
    .eq("id", noteId);

  return { error };
}

export async function toggleTask(
  noteId: string,
  lineIndex: number,
  completed: boolean
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { data: note, error: fetchError } = await supabase
    .from("notes")
    .select("line_metadata")
    .eq("id", noteId)
    .single();

  if (fetchError || !note) {
    return { error: fetchError || new Error("Note not found") };
  }

  const currentMetadata = note.line_metadata || [];
  const newMetadata = [...currentMetadata];
  const lineEntry = newMetadata.find((m) => m.lineIndex === lineIndex);

  if (lineEntry) {
    lineEntry.isTask = true;
    lineEntry.taskCompleted = completed;
  } else {
    newMetadata.push({
      lineIndex,
      commentCount: 0,
      comments: [],
      isTask: true,
      taskCompleted: completed,
    });
  }

  const { error } = await supabase
    .from("notes")
    .update({ line_metadata: newMetadata, updated_at: new Date().toISOString() })
    .eq("id", noteId);

  return { error };
}

export async function convertToTask(
  noteId: string,
  lineIndex: number
): Promise<{ error: Error | null }> {
  return toggleTask(noteId, lineIndex, false);
}

export async function migrateNoteLineMetadata(noteId: string, content: string): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const lines = content.split("\n");
  const metadata: LineMetadata[] = lines.map((_, index) => ({
    lineIndex: index,
    commentCount: 0,
    comments: [],
    isTask: false,
    taskCompleted: false,
  }));

  const { error } = await supabase
    .from("notes")
    .update({ line_metadata: metadata, updated_at: new Date().toISOString() })
    .eq("id", noteId);

  return { error };
}