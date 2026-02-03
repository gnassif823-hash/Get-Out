-- RESET (Careful! This deletes all data for a clean slate)
DROP TABLE IF EXISTS public.reels CASCADE;
DROP TABLE IF EXISTS public.gallery_posts CASCADE;
DROP TABLE IF EXISTS public.calls CASCADE;
DROP TABLE IF EXISTS public.event_participants CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES: Users (Name-based auth source)
CREATE TABLE public.profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'mobile' CHECK (status IN ('available', 'busy', 'offline')),
    location TEXT,
    time_note TEXT, -- 'Looking to hang out at...'
    avatar_color TEXT,
    avatar_url TEXT, -- NEW: For profile pictures
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES: Global Chat (The Lounge)
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS: Calendar/Meetups
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT PARTICIPANTS: Who is going
CREATE TABLE public.event_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('going', 'maybe', 'not_going')),
    UNIQUE(event_id, user_id)
);

-- CALLS: For active Jitsi rooms
CREATE TABLE public.calls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_name TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- GALLERY: Shared Photos
CREATE TABLE public.gallery_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REELS: Short Videos
CREATE TABLE public.reels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    video_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime
-- Re-add tables to publication (idempotent usually, but dropping tables removes them)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE reels;

-- RLS Policies (Open for "Close-knit group")
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public messages access" ON public.messages FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public events access" ON public.events FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public participants access" ON public.event_participants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.gallery_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public gallery access" ON public.gallery_posts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reels access" ON public.reels FOR ALL USING (true) WITH CHECK (true);

-- STORAGE BUCKETS
-- Creating 4 buckets: gallery, reels, avatars, chat_attachments
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('gallery', 'gallery', true),
  ('reels', 'reels', true),
  ('avatars', 'avatars', true),
  ('chat_attachments', 'chat_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
-- Drop existing policies first to avoid "policy already exists"
DROP POLICY IF EXISTS "Public Access Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Reels" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Reels" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Chat" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Chat" ON storage.objects;

-- Gallery
CREATE POLICY "Public Access Gallery" ON storage.objects FOR SELECT USING ( bucket_id = 'gallery' );
CREATE POLICY "Public Upload Gallery" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'gallery' );

-- Reels
CREATE POLICY "Public Access Reels" ON storage.objects FOR SELECT USING ( bucket_id = 'reels' );
CREATE POLICY "Public Upload Reels" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'reels' );

-- Avatars
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
CREATE POLICY "Public Upload Avatars" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' );

-- Chat Attachments
CREATE POLICY "Public Access Chat" ON storage.objects FOR SELECT USING ( bucket_id = 'chat_attachments' );
CREATE POLICY "Public Upload Chat" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'chat_attachments' );
