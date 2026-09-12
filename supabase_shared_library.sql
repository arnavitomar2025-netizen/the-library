-- =========================================================
-- THE LIBRARY: SHARED READ-ONLY ACCESS RPC
-- Run this in your Supabase Project -> SQL Editor -> Run
-- =========================================================

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Function: read_shared_library
-- Allows Person X (guest reader) to enter Person Y's Library password,
-- securely verifies the password against the stored bcrypt hash on the server,
-- and returns the letters in read-only format WITHOUT granting write permissions.
CREATE OR REPLACE FUNCTION read_shared_library(
    library_owner_id uuid,
    library_password_attempt text
)
RETURNS TABLE (
    book_key text,
    title text,
    content text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    stored_hash text;
BEGIN
    -- 1. Find the Library password hash for the owner
    SELECT password_hash INTO stored_hash
    FROM public.library_passwords
    WHERE user_id = library_owner_id;

    -- 2. If no password exists or verification fails, reject
    IF stored_hash IS NULL OR (
        stored_hash != crypt(library_password_attempt, stored_hash)
        AND stored_hash != extensions.crypt(library_password_attempt, stored_hash)
    ) THEN
        RAISE EXCEPTION 'Incorrect Library password.';
    END IF;

    -- 3. Return letters for this library owner (read-only)
    RETURN QUERY
    SELECT l.book_key, l.title, l.content
    FROM public.letters l
    WHERE l.user_id = library_owner_id;
END;
$$;

-- Grant execution permissions to anon (guest reader) and authenticated users
GRANT EXECUTE ON FUNCTION read_shared_library(uuid, text) TO anon, authenticated;
