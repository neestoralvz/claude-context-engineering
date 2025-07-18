import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth-service'

export async function POST(request: NextRequest) {
  try {
    // Check if request is from authenticated admin
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await AuthService.verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const adminUser = AuthService.getUserById(payload.userId)
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { username, email, password, role, department, shift } = await request.json()

    // Validate input
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Username, email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['operator', 'supervisor', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: operator, supervisor, viewer' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    try {
      // Register new user
      const newUser = await AuthService.register({
        username,
        email,
        password,
        role,
        department,
        shift
      })

      if (!newUser) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      // Log user creation
      console.log(`New user created by admin ${adminUser.username}: ${newUser.username} (${newUser.role})`)

      // Return user info (excluding sensitive data)
      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          shift: newUser.shift,
          permissions: newUser.permissions
        }
      })

    } catch (error: any) {
      if (error.message === 'User already exists') {
        return NextResponse.json(
          { error: 'User with this username or email already exists' },
          { status: 409 }
        )
      }
      throw error
    }

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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