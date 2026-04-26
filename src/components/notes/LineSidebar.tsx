"use client";

import { useState } from "react";
import { MessageSquare, CheckSquare, Square, Send, Trash2 } from "lucide-react";
import { LineMetadata, Comment } from "@/lib/supabase/client";

interface LineSidebarProps {
  selectedLineIndex: number | null;
  selectedLineContent: string;
  metadata: LineMetadata | undefined;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onToggleTask: (completed: boolean) => void;
  onConvertToTask: () => void;
  onClose: () => void;
}

export default function LineSidebar({
  selectedLineIndex,
  selectedLineContent,
  metadata,
  onAddComment,
  onDeleteComment,
  onToggleTask,
  onConvertToTask,
  onClose,
}: LineSidebarProps) {
  const [commentText, setCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  if (selectedLineIndex === null) {
    return (
      <div className="p-4 border-t border-[#e5e7eb]">
        <p className="text-sm text-[#6b7280] text-center">
          Select a line to view comments and tasks
        </p>
      </div>
    );
  }

  const comments = metadata?.comments || [];
  const isTask = metadata?.isTask || false;
  const taskCompleted = metadata?.taskCompleted || false;

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText("");
      setIsAddingComment(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="border-t border-[#e5e7eb]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#171717]">
            Line {selectedLineIndex + 1}
          </h3>
          <button
            onClick={onClose}
            className="text-xs text-[#6b7280] hover:text-[#171717]"
          >
            Close
          </button>
        </div>
        <p className="text-xs text-[#6b7280] bg-[#f5f5f5] rounded px-2 py-1.5 truncate">
          {selectedLineContent || "Empty line"}
        </p>
      </div>

      <div className="border-t border-[#e5e7eb]">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-[#8b5cf6]" />
            <h3 className="text-sm font-semibold text-[#171717]">
              Comments {comments.length > 0 && `(${comments.length})`}
            </h3>
          </div>

          {comments.length > 0 ? (
            <div className="space-y-2 mb-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="group bg-[#f5f5f5] rounded-lg p-3 relative"
                >
                  <p className="text-sm text-[#171717] pr-6">{comment.text}</p>
                  <p className="text-xs text-[#9ca3af] mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#e5e7eb] transition-opacity"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#6b7280]" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9ca3af] mb-3">No comments yet</p>
          )}

          {isAddingComment ? (
            <div className="relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                className="w-full p-3 pr-10 text-sm bg-white border border-[#e5e7eb] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
                rows={2}
                autoFocus
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#8b5cf6] text-white text-sm rounded-lg hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
                <button
                  onClick={() => {
                    setIsAddingComment(false);
                    setCommentText("");
                  }}
                  className="px-3 py-1.5 text-sm text-[#6b7280] hover:text-[#171717] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingComment(true)}
              className="w-full p-3 text-sm text-[#6b7280] bg-[#f5f5f5] rounded-lg hover:bg-[#e5e7eb] transition-colors text-left"
            >
              Add a comment...
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[#e5e7eb]">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-4 h-4 text-[#22c55e]" />
            <h3 className="text-sm font-semibold text-[#171717]">Task</h3>
          </div>

          {!isTask ? (
            <button
              onClick={onConvertToTask}
              className="w-full flex items-center gap-2 p-3 text-sm text-[#6b7280] bg-[#f5f5f5] rounded-lg hover:bg-[#e5e7eb] transition-colors"
            >
              <Square className="w-4 h-4" />
              Convert to task
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => onToggleTask(!taskCompleted)}
                className={`w-full flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  taskCompleted
                    ? "bg-[#f0fdf4] text-[#22c55e]"
                    : "bg-[#f5f5f5] text-[#6b7280] hover:bg-[#e5e7eb]"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                {taskCompleted ? "Completed" : "Mark as complete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}