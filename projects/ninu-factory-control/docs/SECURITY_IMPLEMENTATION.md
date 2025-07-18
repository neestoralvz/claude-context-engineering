# 🔐 Security Implementation Guide - Ninu Factory Control

## Overview

This document outlines the comprehensive security architecture implemented for the Ninu Factory Control System, including authentication, authorization, WebSocket security, and protection mechanisms.

## 🏗️ Security Architecture

### Authentication System
- **JWT-based authentication** with secure token storage
- **Role-based access control (RBAC)** with granular permissions
- **Secure password hashing** using bcryptjs with 12 rounds
- **Session management** with secure cookies
- **CSRF protection** with token validation

### Authorization Layers
1. **Route-level protection** via Next.js middleware
2. **API endpoint protection** with JWT verification
3. **WebSocket connection authentication**
4. **Permission-based access control**

## 🔑 Authentication Flow

### 1. Login Process
```typescript
// Client sends credentials
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

// Server responds with tokens
{
  "success": true,
  "user": { id, username, role, permissions },
  "csrfToken": "csrf_token_value"
}
```

### 2. Token Storage
- **HTTP-only cookies** for auth tokens (XSS protection)
- **Secure flag** in production (HTTPS only)
- **SameSite=strict** (CSRF protection)
- **8-hour expiration** (factory shift duration)

### 3. Request Authentication
```typescript
// Middleware automatically validates tokens
Authorization: Bearer <token>
// OR
Cookie: auth-token=<token>
```

## 🛡️ Security Middleware Stack

### Next.js Middleware (`middleware.ts`)
```typescript
// Applied to all routes
- Rate limiting (100 req/15min, 5 auth/15min)
- CSRF token validation
- JWT token verification
- Security headers
- Path-based access control
```

### Express.js Security (`server/index.js`)
```typescript
// API server protection
- Helmet.js security headers
- Rate limiting with express-rate-limit
- CORS configuration
- Input validation
- Permission checking
```

## 🔐 User Roles & Permissions

### Role Hierarchy
```typescript
Admin > Supervisor > Operator > Viewer
```

### Permission Matrix
| Permission | Admin | Supervisor | Operator | Viewer |
|------------|-------|------------|----------|--------|
| read:all | ✅ | ✅ | ❌ | ❌ |
| write:all | ✅ | ❌ | ❌ | ❌ |
| control:reactors | ✅ | ✅ | ❌ | ❌ |
| control:stations | ✅ | ✅ | ✅ | ❌ |
| view:analytics | ✅ | ✅ | ❌ | ❌ |
| manage:users | ✅ | ❌ | ❌ | ❌ |
| read:dashboard | ✅ | ✅ | ✅ | ✅ |

### Default Users
```typescript
// Admin User
Username: admin
Password: admin123
Role: admin
Permissions: full access

// Supervisor User
Username: supervisor1
Password: super123
Role: supervisor
Permissions: production control + analytics
```

## 🌐 WebSocket Security

### Authentication Flow
1. **Token extraction** from cookies/headers/query params
2. **JWT verification** before connection
3. **User role assignment** to socket
4. **Permission-based room joining**

### Rate Limiting
- **5 connections max** per IP address
- **100 messages per minute** per socket
- **Connection attempt limiting**

### Message Authorization
```typescript
// Example: Reactor control requires permission
socket.on('reactor:control', (data) => {
  if (!hasPermission(socket, 'control:reactors')) {
    socket.emit('error', 'Insufficient permissions')
    return
  }
  // Process command
})
```

## 🔒 CSRF Protection

### Implementation
1. **Token generation** on login
2. **Cookie storage** (accessible to client)
3. **Header validation** on API requests
4. **Automatic middleware check**

### Usage
```typescript
// Client includes CSRF token in headers
headers: {
  'X-CSRF-Token': localStorage.getItem('csrfToken')
}
```

## ⚡ Rate Limiting

### Global Limits
- **100 requests per 15 minutes** per IP
- **5 authentication attempts** per 15 minutes per IP
- **Special limits for sensitive endpoints**

### WebSocket Limits
- **5 concurrent connections** per IP
- **100 messages per minute** per socket
- **Connection rate limiting**

## 🛡️ Security Headers

### Content Security Policy (CSP)
```typescript
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' ws: wss:;
frame-ancestors 'none';
```

### Additional Headers
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **X-XSS-Protection**: 1; mode=block
- **Permissions-Policy**: restrictive

## 🔧 Configuration

### Environment Variables
```bash
# Security
JWT_SECRET=256-bit-random-key
BCRYPT_ROUNDS=12
SESSION_SECRET=secure-session-key

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# WebSocket
WS_MAX_CONNECTIONS_PER_IP=5
WS_AUTH_REQUIRED=true
```

## 🚀 Usage Examples

### Protected React Component
```typescript
import { withAuth } from '@/lib/hooks/useAuth'

const AdminPanel = withAuth(
  ({ user }) => <div>Admin content</div>,
  'manage:users' // Required permission
)
```

### Authenticated API Call
```typescript
import { useApiCall } from '@/lib/hooks/useAuth'

const { apiCall } = useApiCall()
const response = await apiCall('/api/reactors/001/control', {
  method: 'POST',
  body: JSON.stringify({ action: 'start' })
})
```

### WebSocket with Auth
```typescript
import io from 'socket.io-client'

const socket = io('ws://localhost:3001', {
  auth: {
    token: authToken
  },
  withCredentials: true
})
```

## 🔍 Monitoring & Logging

### Security Events Logged
- **Authentication attempts** (success/failure)
- **Authorization failures**
- **Rate limit violations**
- **CSRF token mismatches**
- **WebSocket security events**

### Log Format
```typescript
{
  timestamp: "2024-07-18T12:00:00Z",
  event: "authentication_failure",
  ip: "192.168.1.100",
  username: "admin",
  reason: "invalid_password"
}
```

## ⚠️ Security Considerations

### Production Checklist
- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (256-bit minimum)
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up database connection encryption
- [ ] Implement proper logging and monitoring
- [ ] Regular security audits
- [ ] Update dependencies regularly

### Common Vulnerabilities Mitigated
- **XSS**: CSP headers + input sanitization
- **CSRF**: Token-based protection
- **Session hijacking**: Secure cookies + HTTPS
- **Brute force**: Rate limiting + account lockout
- **SQL injection**: Parameterized queries
- **Unauthorized access**: JWT + RBAC
- **Man-in-the-middle**: HTTPS + HSTS

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
npm install
cd server && npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Update security variables
```

### 3. Start Services
```bash
# Start main application
npm run dev

# Start API server
npm run dev:api

# Start WebSocket server
npm run websocket
```

### 4. Test Authentication
- Navigate to `/login`
- Use demo credentials: `admin` / `admin123`
- Verify JWT tokens in browser dev tools
- Test protected routes

## 📋 API Reference

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info
- `POST /api/auth/register` - Register user (admin only)

### Protected Endpoints
- `GET /api/status` - Factory status (requires: read:dashboard)
- `POST /api/reactors/:id/control` - Reactor control (requires: control:reactors)
- `POST /api/stations/:id/control` - Station control (requires: control:stations)
- `GET /api/metrics` - System metrics (requires: view:analytics)
- `GET /api/users` - User management (requires: manage:users)

## 🔄 Security Updates

### Version History
- **v1.0.0**: Initial security implementation
- **Future**: OAuth2, SAML integration, advanced audit logging

### Maintenance
- Regular dependency updates
- Security patch monitoring
- Penetration testing schedule
- Compliance audits

---

## 📞 Support

For security-related questions or issues:
- Review this documentation
- Check server logs for authentication errors
- Verify environment configuration
- Test with different user roles

**Remember**: Security is an ongoing process, not a one-time setup.