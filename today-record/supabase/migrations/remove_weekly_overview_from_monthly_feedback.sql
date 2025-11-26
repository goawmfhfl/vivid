-- Remove weekly_overview column from monthly_feedback table
-- This column is not used and should be removed

ALTER TABLE monthly_feedback 
DROP COLUMN IF EXISTS weekly_overview;

