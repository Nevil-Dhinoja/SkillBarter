-- SQL script to add completed_at column to quiz_results table
USE skillbarter;

-- Add the completed_at column to quiz_results table
ALTER TABLE quiz_results ADD COLUMN completed_at TIMESTAMP NULL AFTER taken_at;

-- Verify the column was added
DESCRIBE quiz_results;