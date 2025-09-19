-- SQL script to check if quiz tables exist and have the correct structure
USE skillbarter;

-- Check if quizzes table exists
DESCRIBE quizzes;

-- Check if quiz_questions table exists
DESCRIBE quiz_questions;

-- Check if quiz_results table exists
DESCRIBE quiz_results;

-- Check if quiz_assignments table exists
DESCRIBE quiz_assignments;

-- Check if there are any quiz assignments
SELECT * FROM quiz_assignments LIMIT 5;

-- Check if there are any quizzes
SELECT * FROM quizzes LIMIT 5;