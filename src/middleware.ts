import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Redirect vercel.app preview URLs to the production domain
  const host = request.headers.get('host') || ''
  if (host.includes('vercel.app')) {
    const url = request.nextUrl.clone()
    url.protocol = 'https'
    url.host = 'whatupb.com'
    return NextResponse.redirect(url, 308)
  }

  // Block cross-origin requests to the messages API
  if (request.nextUrl.pathname === '/api/messages') {
    const origin = request.headers.get('origin')
    if (origin && origin !== 'https://whatupb.com' && !origin.includes('localhost')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /inbox and /settings routes
  if (!user && (request.nextUrl.pathname.startsWith('/inbox') || request.nextUrl.pathname.startsWith('/settings'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
