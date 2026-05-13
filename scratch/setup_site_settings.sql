-- Table to store site-wide configurations
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts when re-running
DROP POLICY IF EXISTS "Allow public read access" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admins to modify settings" ON public.site_settings;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.site_settings
    FOR SELECT USING (true);

-- Allow admins to update settings (using the email check logic)
CREATE POLICY "Allow admins to modify settings" ON public.site_settings
    FOR ALL USING (
        auth.jwt() ->> 'email' LIKE '%admin%'
        OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    );

-- Initial data (optional, but helps avoid empty states)
INSERT INTO public.site_settings (key, value) VALUES
('logo_url', ''),
('hero_title', 'Crafting Sweet Memories'),
('hero_description', 'Experience the perfect blend of premium ingredients and masterful baking.'),
('hero_product_id', ''),
('featured_products', ''),
('carousel_product_1', ''),
('carousel_product_2', ''),
('carousel_product_3', ''),
('carousel_speed', '3000')
ON CONFLICT (key) DO NOTHING;
