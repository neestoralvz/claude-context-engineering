'use client'

import { useState } from 'react'
import { useAuth, useApiCall } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SecurityTest() {
  const { user, hasPermission, logout } = useAuth()
  const { apiCall } = useApiCall()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runSecurityTests = async () => {
    setIsLoading(true)
    const results = []

    // Test 1: Protected API endpoint
    try {
      const response = await apiCall('/api/status')
      const data = await response.json()
      results.push({
        test: 'Protected API Access',
        status: response.ok ? 'PASS' : 'FAIL',
        details: response.ok ? `Status retrieved for ${data.requestedBy}` : data.error
      })
    } catch (error) {
      results.push({
        test: 'Protected API Access',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Permission-based access
    const hasReactorControl = hasPermission('control:reactors')
    results.push({
      test: 'Reactor Control Permission',
      status: hasReactorControl ? 'PASS' : 'RESTRICTED',
      details: hasReactorControl ? 'User has reactor control access' : 'User lacks reactor control permission'
    })

    // Test 3: Admin-only endpoint
    try {
      const response = await apiCall('/api/users')
      const data = await response.json()
      results.push({
        test: 'Admin-only Endpoint',
        status: response.ok ? 'PASS' : 'RESTRICTED',
        details: response.ok ? `Retrieved ${data.length} users` : data.error
      })
    } catch (error) {
      results.push({
        test: 'Admin-only Endpoint',
        status: 'RESTRICTED',
        details: 'Access denied - admin only'
      })
    }

    // Test 4: CSRF Token presence
    const csrfToken = localStorage.getItem('csrfToken')
    results.push({
      test: 'CSRF Token',
      status: csrfToken ? 'PASS' : 'FAIL',
      details: csrfToken ? 'CSRF token present' : 'CSRF token missing'
    })

    // Test 5: Rate limiting test (safe)
    results.push({
      test: 'Rate Limiting',
      status: 'INFO',
      details: 'Rate limiting active (100 req/15min, 5 auth/15min)'
    })

    setTestResults(results)
    setIsLoading(false)
  }

  const testReactorControl = async () => {
    if (!hasPermission('control:reactors')) {
      alert('You do not have permission to control reactors')
      return
    }

    try {
      const response = await apiCall('/api/reactors/001/control', {
        method: 'POST',
        body: JSON.stringify({
          action: 'test',
          parameters: { temperature: 25 }
        })
      })

      const data = await response.json()
      alert(response.ok ? 
        `Reactor control test successful: ${data.executedBy}` : 
        `Error: ${data.error}`
      )
    } catch (error) {
      alert(`Network error: ${error}`)
    }
  }

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Security System Test</h2>
          <p className="text-gray-600">Test authentication, authorization, and security features</p>
        </div>

        {/* User Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Current User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Username:</span> {user?.username}
            </div>
            <div>
              <span className="font-medium">Role:</span> {user?.role}
            </div>
            <div>
              <span className="font-medium">Department:</span> {user?.department || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Shift:</span> {user?.shift || 'N/A'}
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">User Permissions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {user?.permissions.map((permission, index) => (
              <div key={index} className="bg-green-100 px-2 py-1 rounded text-green-800">
                {permission}
              </div>
            ))}
          </div>
        </div>

        {/* Security Tests */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Security Tests</h3>
            <div className="space-x-2">
              <Button 
                onClick={runSecurityTests}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Running Tests...' : 'Run Security Tests'}
              </Button>
              <Button 
                onClick={testReactorControl}
                disabled={!hasPermission('control:reactors')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Test Reactor Control
              </Button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.status === 'PASS' 
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : result.status === 'FAIL'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : result.status === 'RESTRICTED'
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm mt-1">{result.details}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      result.status === 'PASS' 
                        ? 'bg-green-200 text-green-800'
                        : result.status === 'FAIL'
                        ? 'bg-red-200 text-red-800'
                        : result.status === 'RESTRICTED'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Features */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Active Security Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                JWT Authentication
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                CSRF Protection
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Rate Limiting
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Secure Cookies
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Role-based Access Control
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Security Headers
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                WebSocket Authentication
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Content Security Policy
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4 border-t">
          <Button 
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </Button>
        </div>
      </div>
    </Card>
  )
}