"use client";

import { useState, useEffect } from "react";
import { MessageSquare, CheckSquare, Square, MoreHorizontal } from "lucide-react";
import { LineMetadata } from "@/lib/supabase/client";

interface LineItemProps {
  content: string;
  index: number;
  metadata: LineMetadata | undefined;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onContentChange: (index: number, newContent: string) => void;
  onCreateLine: (afterIndex: number, content: string) => void;
  onDeleteLine: (index: number) => void;
  onMergeLines: (targetIndex: number, sourceIndex: number) => void;
  onAddComment: (index: number) => void;
  onToggleTask: (index: number, completed: boolean) => void;
  onConvertToTask: (index: number) => void;
}

export default function LineItem({
  content,
  index,
  metadata,
  isSelected,
  onSelect,
  onContentChange,
  onCreateLine,
  onDeleteLine,
  onMergeLines,
  onAddComment,
  onToggleTask,
  onConvertToTask,
}: LineItemProps) {
  const [localContent, setLocalContent] = useState(content);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const hasComments = metadata && metadata.commentCount > 0;
  const isTask = metadata?.isTask || false;
  const taskCompleted = metadata?.taskCompleted || false;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    onContentChange(index, e.target.value);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleTask(index, !taskCompleted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const value = textarea.value;
      const cursorPos = textarea.selectionStart;

      if (cursorPos === value.length) {
        onCreateLine(index, "");
      } else {
        const beforeCursor = value.slice(0, cursorPos);
        const afterCursor = value.slice(cursorPos);
        setLocalContent(beforeCursor);
        onContentChange(index, beforeCursor);
        onCreateLine(index, afterCursor);
      }
    }

    if (e.key === "Backspace") {
      const textarea = e.target as HTMLTextAreaElement;
      const value = textarea.value;
      const cursorPos = textarea.selectionStart;

      if (cursorPos === 0 && value.length === 0) {
        e.preventDefault();
        onDeleteLine(index);
      } else if (cursorPos === 0 && index > 0) {
        e.preventDefault();
        onMergeLines(index - 1, index);
      }
    }
  };

  return (
    <div
      className={`group relative flex items-start py-1 px-2 rounded cursor-pointer transition-colors ${
        isSelected ? "bg-white ring-1 ring-[#8b5cf6]" : "hover:bg-[#f5f5f5]"
      }`}
      onClick={() => onSelect(index)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center w-12 shrink-0">
        {isTask ? (
          <button
            onClick={handleCheckboxClick}
            className={`p-0.5 rounded hover:bg-[#e5e7eb] transition-colors ${
              taskCompleted ? "text-[#22c55e]" : "text-[#9ca3af]"
            }`}
          >
            {taskCompleted ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        ) : hasComments ? (
          <MessageSquare className="w-4 h-4 text-[#8b5cf6]" />
        ) : null}
      </div>

      <textarea
        value={localContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        rows={1}
        className={`flex-1 min-h-[24px] leading-6 outline-none cursor-text resize-none overflow-hidden bg-transparent border-none focus:ring-0 ${
          isSelected ? "bg-white" : ""
        } ${isTask && taskCompleted ? "line-through text-[#9ca3af]" : ""}`}
      />

      {showActions && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-[#e5e7eb] rounded-lg shadow-md p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddComment(index);
            }}
            className="p-1.5 rounded hover:bg-[#f5f5f5] transition-colors"
            title="Add comment"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#6b7280]" />
          </button>
          {!isTask ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConvertToTask(index);
              }}
              className="p-1.5 rounded hover:bg-[#f5f5f5] transition-colors"
              title="Convert to task"
            >
              <Square className="w-3.5 h-3.5 text-[#6b7280]" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleTask(index, !taskCompleted);
              }}
              className="p-1.5 rounded hover:bg-[#f5f5f5] transition-colors"
              title={taskCompleted ? "Mark incomplete" : "Mark complete"}
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#6b7280]" />
            </button>
          )}
          <button
            className="p-1.5 rounded hover:bg-[#f5f5f5] transition-colors"
            title="More options"
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-[#6b7280]" />
          </button>
        </div>
      )}
    </div>
  );
}