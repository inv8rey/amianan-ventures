import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// The admin area's address. If you change it, rename the folder under app/ to match.
const ADMIN_PATH = '/rkgd6dg3k0w935'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
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

  const path = request.nextUrl.pathname
  const inAdmin = path === ADMIN_PATH || path.startsWith(ADMIN_PATH + '/')
  const goTo = (pathname: string) => {
    const url = request.nextUrl.clone()
    url.pathname = pathname
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (!user) {
    if (inAdmin) return goTo('/login')
    return supabaseResponse
  }

  // Signed in is not enough: the account must be on the admin list.
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (inAdmin && isAdmin !== true) return goTo('/no-access')
  if (path === '/login') return goTo(isAdmin === true ? ADMIN_PATH : '/no-access')

  return supabaseResponse
}

export const config = {
  matcher: ['/rkgd6dg3k0w935/:path*', '/login'],
}
