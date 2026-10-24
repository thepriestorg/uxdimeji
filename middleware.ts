import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    // Only signed-in areas need the Supabase session refresh. Running it on public
    // pages added an auth round trip to Supabase before every page render.
    matcher: ['/admin/:path*', '/api/upload/:path*', '/api/analytics/export'],
};
