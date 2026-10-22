-- Drop waitlist table and policies from Supabase
DROP POLICY IF EXISTS "Anyone can join the waitlist" ON waitlist;
DROP TABLE IF EXISTS waitlist CASCADE;
