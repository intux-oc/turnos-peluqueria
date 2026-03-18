import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const pathname = request.nextUrl.pathname

  // 1. Validar rutas de administración CON ROL
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Extraer el rol de los metadatos (definidos en tu trigger handle_new_user)
    const userRole = user.user_metadata?.role || 'cliente'
    
    if (pathname.startsWith('/admin') && !['admin', 'superadmin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/mis-turnos', request.url)) // Redirigir clientes
    }
    if (pathname.startsWith('/super-admin') && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // 2. Redirección lógica si ya está logueado
  if (pathname === '/login' && user) {
    const role = user.user_metadata?.role
    if (role === 'superadmin') return NextResponse.redirect(new URL('/super-admin', request.url))
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    return NextResponse.redirect(new URL('/mis-turnos', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
