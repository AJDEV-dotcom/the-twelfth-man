import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  
  // Debugging: Log exactly what parameters we received
  console.log("🔹 Auth Callback hit with params:", Object.fromEntries(searchParams.entries()));

  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle errors returned from Supabase/Google (e.g., access_denied)
  if (error) {
    console.error("🔴 Auth Error:", error, errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || error)}`);
  }

  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.delete({ name, ...options });
          },
        },
      }
    );

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!sessionError) {
      console.log("✅ Session exchanged successfully. Redirecting to:", next);
      return response;
    }
    
    console.error("🔴 Session Exchange Error:", sessionError);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(sessionError.message)}`);
  }

  console.warn("⚠️ No code or error found in URL params");
  return NextResponse.redirect(`${origin}/login?error=Authentication code missing`);
}