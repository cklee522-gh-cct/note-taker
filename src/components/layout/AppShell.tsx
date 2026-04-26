"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/supabase/client";
import {
  ChevronDown,
  Search,
  SquarePen,
  Plus,
  Settings,
  FileText,
  ChevronRight,
  Ellipsis,
} from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface AppShellProps {
  children: React.ReactNode;
  notes?: Note[];
  onCreateNote?: () => void;
  onSelectNote?: (id: string) => void;
  selectedNoteId?: string;
  user?: { email?: string; display_name?: string } | null;
}

export default function AppShell({
  children,
  notes = [],
  onCreateNote,
  onSelectNote,
  selectedNoteId,
  user,
}: AppShellProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleNewPage = () => {
    if (onCreateNote) {
      onCreateNote();
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <aside className="w-[240px] h-full flex flex-col bg-[#fafafa] border-r border-[#e5e7eb]">
        {/* Top Section */}
        <div className="flex flex-col gap-1 p-3">
          {/* Workspace Selector */}
          <button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#f0f0f0] transition-colors">
            <div className="w-5 h-5 bg-[#3b82f6] rounded flex items-center justify-center">
              <span className="text-white text-xs font-semibold">E</span>
            </div>
            <span className="flex-1 text-sm font-medium text-[#171717] text-left truncate">
              My Workspace
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6b7280]" />
          </button>

          {/* Search Row */}
          <button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#f0f0f0] transition-colors">
            <Search className="w-4 h-4 text-[#6b7280]" />
            <span className="flex-1 text-sm text-[#6b7280] text-left">Search</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-white border border-[#e5e7eb] rounded text-[#6b7280]">
              ⌘K
            </kbd>
          </button>

          {/* New Page Row */}
          <button
            onClick={handleNewPage}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#f0f0f0] transition-colors"
          >
            <SquarePen className="w-4 h-4 text-[#6b7280]" />
            <span className="flex-1 text-sm text-[#6b7280] text-left">New page</span>
          </button>
        </div>

        {/* Spacer */}
        <div className="h-4" />

        {/* Page Tree */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="mb-2">
            <span className="px-2 py-1 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">
              PRIVATE
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {notes.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-[#6b7280]">No notes yet</p>
            ) : (
              notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onSelectNote?.(note.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-sm text-left transition-colors ${
                    selectedNoteId === note.id
                      ? "bg-[#f0f0f0] text-[#171717]"
                      : "text-[#171717] hover:bg-[#f0f0f0]"
                  }`}
                >
                  <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                  <FileText className="w-[18px] h-[18px] text-[#6b7280]" />
                  <span className="flex-1 truncate">{note.title || "Untitled"}</span>
                </button>
              ))
            )}
          </div>

          {/* Add Page Row */}
          <button
            onClick={handleNewPage}
            className="flex items-center gap-2 px-2 py-1.5 mt-1 rounded hover:bg-[#f0f0f0] transition-colors"
          >
            <Plus className="w-4 h-4 text-[#6b7280]" />
            <span className="text-sm text-[#6b7280]">Add a page</span>
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 flex flex-col gap-1 border-t border-[#e5e7eb]">
          {/* Settings Row */}
          <button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#f0f0f0] transition-colors">
            <Settings className="w-4 h-4 text-[#6b7280]" />
            <span className="flex-1 text-sm text-[#6b7280] text-left">Settings</span>
          </button>

          {/* User Row */}
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {user?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#171717] truncate">
                {user?.display_name || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-[#6b7280] truncate">
                {user?.email || ""}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 rounded hover:bg-[#f0f0f0] transition-colors"
              title="Sign out"
            >
              <Ellipsis className="w-4 h-4 text-[#6b7280]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white">{children}</main>
    </div>
  );
}