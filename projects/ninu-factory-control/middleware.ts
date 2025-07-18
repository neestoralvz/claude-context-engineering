import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Security configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
)

const PROTECTED_PATHS = [
  '/dashboard',
  '/produccion',
  '/inventarios',
  '/admin',
  '/api/reactors',
  '/api/stations',
  '/api/orders',
  '/api/metrics'
]

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/_next',
  '/favicon.ico',
  '/images'
]

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map()

// Helper function to check if path requires authentication
function requiresAuth(pathname: string): boolean {
  return PROTECTED_PATHS.some(path => pathname.startsWith(path))
}

// Helper function to check if path is public
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path))
}

// Rate limiting implementation
function checkRateLimit(ip: string, endpoint: string): boolean {
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = endpoint.startsWith('/api/auth') ? 5 : 100 // Stricter for auth endpoints

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  const rateData = rateLimitStore.get(key)
  
  if (now > rateData.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (rateData.count >= maxRequests) {
    return false
  }

  rateData.count++
  return true
}

// CSRF token validation
function validateCSRFToken(request: NextRequest): boolean {
  if (request.method === 'GET') return true
  
  const csrfToken = request.headers.get('x-csrf-token')
  const sessionToken = request.cookies.get('csrf-token')?.value
  
  return csrfToken === sessionToken
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Security headers for all requests
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' ws: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  // Get client IP for rate limiting
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1'

  // Rate limiting check
  if (!checkRateLimit(ip, pathname)) {
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '900' // 15 minutes
      }
    })
  }

  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    return response
  }

  // CSRF protection for API routes
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    if (!validateCSRFToken(request)) {
      return new NextResponse('CSRF token mismatch', { status: 403 })
    }
  }

  // Authentication check for protected routes
  if (requiresAuth(pathname)) {
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      // Check token expiration
      if (payload.exp && payload.exp < Date.now() / 1000) {
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('auth-token')
        return response
      }

      // Add user info to headers for use in API routes
      response.headers.set('x-user-id', payload.userId as string)
      response.headers.set('x-user-role', payload.role as string)
      response.headers.set('x-user-permissions', JSON.stringify(payload.permissions || []))

    } catch (error) {
      console.error('JWT verification failed:', error)
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}