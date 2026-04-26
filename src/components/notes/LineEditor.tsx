"use client";

import { useState, useEffect, useCallback } from "react";
import LineItem from "./LineItem";
import { LineMetadata } from "@/lib/supabase/client";

interface LineEditorProps {
  content: string;
  lineMetadata: LineMetadata[];
  selectedLineIndex: number | null;
  onContentChange: (content: string) => void;
  onSelectLine: (index: number | null) => void;
  onAddComment: (index: number) => void;
  onToggleTask: (index: number, completed: boolean) => void;
  onConvertToTask: (index: number) => void;
}

export default function LineEditor({
  content,
  lineMetadata,
  selectedLineIndex,
  onContentChange,
  onSelectLine,
  onAddComment,
  onToggleTask,
  onConvertToTask,
}: LineEditorProps) {
  const [lines, setLines] = useState<string[]>(content.split("\n"));

  useEffect(() => {
    setLines(content.split("\n"));
  }, [content]);

  useEffect(() => {
    if (lines.length > 0 && selectedLineIndex === null) {
      onSelectLine(0);
    }
  }, []);

  const getMetadataForLine = (index: number): LineMetadata | undefined => {
    return lineMetadata.find((m) => m.lineIndex === index);
  };

  const handleLineSelect = useCallback(
    (index: number) => {
      if (selectedLineIndex === index) {
        onSelectLine(null);
      } else {
        onSelectLine(index);
      }
    },
    [selectedLineIndex, onSelectLine]
  );

  const handleLineContentChange = useCallback(
    (index: number, newContent: string) => {
      const newLines = [...lines];
      newLines[index] = newContent;
      setLines(newLines);
      onContentChange(newLines.join("\n"));
    },
    [lines, onContentChange]
  );

  const handleCreateLine = useCallback(
    (afterIndex: number, newContent: string) => {
      const newLines = [...lines];
      newLines.splice(afterIndex + 1, 0, newContent);
      setLines(newLines);
      onContentChange(newLines.join("\n"));
      setTimeout(() => onSelectLine(afterIndex + 1), 0);
    },
    [lines, onContentChange, onSelectLine]
  );

  const handleDeleteLine = useCallback(
    (index: number) => {
      if (lines.length <= 1) return;
      const newLines = [...lines];
      newLines.splice(index, 1);
      setLines(newLines);
      onContentChange(newLines.join("\n"));
      const newSelectIndex = index > 0 ? index - 1 : 0;
      setTimeout(() => onSelectLine(newSelectIndex), 0);
    },
    [lines, onContentChange, onSelectLine]
  );

  const handleMergeLines = useCallback(
    (targetIndex: number, sourceIndex: number) => {
      const newLines = [...lines];
      newLines[targetIndex] = (newLines[targetIndex] || "") + (newLines[sourceIndex] || "");
      newLines.splice(sourceIndex, 1);
      setLines(newLines);
      onContentChange(newLines.join("\n"));
      setTimeout(() => onSelectLine(targetIndex), 0);
    },
    [lines, onContentChange, onSelectLine]
  );

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onSelectLine(null);
    }
  };

  return (
    <div
      className="flex flex-col h-full cursor-text"
      onClick={handleContainerClick}
    >
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl cursor-default">
          {lines.map((line, index) => (
            <LineItem
              key={index}
              content={line}
              index={index}
              metadata={getMetadataForLine(index)}
              isSelected={selectedLineIndex === index}
              onSelect={handleLineSelect}
              onContentChange={handleLineContentChange}
              onCreateLine={handleCreateLine}
              onDeleteLine={handleDeleteLine}
              onMergeLines={handleMergeLines}
              onAddComment={onAddComment}
              onToggleTask={onToggleTask}
              onConvertToTask={onConvertToTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
}