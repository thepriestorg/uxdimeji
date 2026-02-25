-- Create vibe_projects table for vibe coded projects
CREATE TABLE IF NOT EXISTS vibe_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'In Progress' CHECK (status IN ('Live', 'In Progress')),
    image TEXT,
    url TEXT,
    accent TEXT DEFAULT '#8B5CF6',
    span TEXT DEFAULT 'small' CHECK (span IN ('large', 'small')),
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE vibe_projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON vibe_projects
    FOR SELECT USING (true);

-- Allow authenticated users to manage
CREATE POLICY "Allow authenticated insert" ON vibe_projects
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON vibe_projects
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON vibe_projects
    FOR DELETE TO authenticated USING (true);

-- Seed with initial vibe projects
INSERT INTO vibe_projects (title, description, tags, status, image, url, accent, span, "order") VALUES
(
    'This Portfolio',
    'The site you''re on. Designed in Figma, vibe coded with AI in Next.js.',
    ARRAY['Next.js', 'Tailwind', 'Framer Motion', 'GSAP'],
    'Live',
    '/images/vibe/portfolio.png',
    '/',
    '#8B5CF6',
    'large',
    0
),
(
    'AI Meal Planner',
    'Personalized weekly meal plans powered by AI. Prompt to production in a weekend.',
    ARRAY['Next.js', 'OpenAI', 'Supabase'],
    'Live',
    '/images/vibe/meal-planner.png',
    NULL,
    '#06B6D4',
    'small',
    1
),
(
    'Invoice Generator',
    'Clean invoicing for freelancers. PDF export, client management, the works.',
    ARRAY['React', 'PDF Generation', 'Supabase'],
    'Live',
    '/images/vibe/invoice.png',
    NULL,
    '#F59E0B',
    'small',
    2
),
(
    'Design System Docs',
    'Interactive component docs. Token explorer, live previews, copy-paste code.',
    ARRAY['Next.js', 'MDX', 'Radix'],
    'In Progress',
    '/images/vibe/design-system.png',
    NULL,
    '#10B981',
    'large',
    3
);
