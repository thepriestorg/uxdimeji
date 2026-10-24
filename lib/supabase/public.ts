import { createClient } from '@supabase/supabase-js';

// Anonymous client for public, cacheable reads. Unlike the server client it never
// touches cookies(), so pages that use it can be statically cached and revalidated.
export function createPublicClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );
}
