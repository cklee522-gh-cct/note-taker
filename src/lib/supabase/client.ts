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

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
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