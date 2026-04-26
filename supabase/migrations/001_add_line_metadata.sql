-- Migration: Add line_metadata column to notes table
-- Run this in Supabase SQL Editor

ALTER TABLE notes ADD COLUMN line_metadata JSONB DEFAULT '[]'::jsonb;

-- Enable RLS on notes table if not already
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own notes' line_metadata
DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;
CREATE POLICY "Users can manage their own notes" ON notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);