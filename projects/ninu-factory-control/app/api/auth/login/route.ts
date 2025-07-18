import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Rate limiting - additional check (middleware also handles this)
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1'
    console.log(`Login attempt from IP: ${ip}, Username: ${username}`)

    // Attempt authentication
    const result = await AuthService.login({ username, password })
    
    if (!result) {
      // Log failed attempt (in production, implement proper logging)
      console.warn(`Failed login attempt for username: ${username} from IP: ${ip}`)
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const { user, token } = result

    // Generate CSRF token
    const csrfToken = AuthService.generateCSRFToken()

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        department: user.department,
        shift: user.shift
      },
      csrfToken
    })

    // Set secure cookies
    const cookieStore = cookies()
    
    // Set auth token cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/'
    })

    // Set CSRF token cookie
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // Needed for client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/'
    })

    // Log successful login
    console.log(`Successful login: ${username} (${user.role}) from IP: ${ip}`)

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? 'https://factory.ninu.mx' 
        : 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    }
  })
}