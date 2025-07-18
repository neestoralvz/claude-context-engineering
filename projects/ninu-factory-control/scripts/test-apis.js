#!/usr/bin/env node

/**
 * Simple script to test the factory control API endpoints
 * Run with: node scripts/test-apis.js
 */

const API_BASE = 'http://localhost:3000/api'

const endpoints = [
  { method: 'GET', path: '/health', description: 'Health check endpoint' },
  { method: 'GET', path: '/reactors', description: 'Get reactors data' },
  { method: 'GET', path: '/stations', description: 'Get stations data' },
  { method: 'GET', path: '/metrics', description: 'Get production metrics' },
  { method: 'GET', path: '/orders', description: 'Get production orders' }
]

async function testEndpoint(endpoint) {
  const { method, path, description } = endpoint
  const url = `${API_BASE}${path}`
  
  try {
    console.log(`\n🔍 Testing ${method} ${path}`)
    console.log(`   Description: ${description}`)
    
    const startTime = Date.now()
    const response = await fetch(url, { method })
    const endTime = Date.now()
    
    console.log(`   ⏱️  Response time: ${endTime - startTime}ms`)
    console.log(`   📊 Status: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Success - Data received`)
      
      // Show basic data structure
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          console.log(`   📦 Array with ${data.data.length} items`)
        } else if (typeof data.data === 'object') {
          const keys = Object.keys(data.data)
          console.log(`   📦 Object with keys: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`)
        }
      }
      
      console.log(`   🕐 Timestamp: ${data.timestamp}`)
    } else {
      console.log(`   ❌ Failed with status ${response.status}`)
      try {
        const errorData = await response.json()
        console.log(`   💬 Error: ${errorData.error?.message || 'Unknown error'}`)
      } catch (e) {
        console.log(`   💬 Could not parse error response`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`)
  }
}

async function testCreateOrder() {
  console.log(`\n🔍 Testing POST /orders`)
  console.log(`   Description: Create new production order`)
  
  const orderData = {
    productId: 'multiusos-1l',
    quantity: 100,
    priority: 'medium',
    customer: 'Test Customer',
    notes: 'API test order'
  }
  
  try {
    const startTime = Date.now()
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })
    const endTime = Date.now()
    
    console.log(`   ⏱️  Response time: ${endTime - startTime}ms`)
    console.log(`   📊 Status: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Order created successfully`)
      console.log(`   📦 Order ID: ${data.data?.id}`)
      console.log(`   📦 Status: ${data.data?.status}`)
    } else {
      console.log(`   ❌ Failed to create order`)
      const errorData = await response.json()
      console.log(`   💬 Error: ${errorData.error?.message}`)
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`)
  }
}

async function testReactorControl() {
  console.log(`\n🔍 Testing POST /reactors`)
  console.log(`   Description: Send reactor control command`)
  
  const controlData = {
    reactorId: 'reactor-001',
    action: 'update_parameters',
    parameters: {
      temperature: 25.0,
      mixingSpeed: 150
    }
  }
  
  try {
    const startTime = Date.now()
    const response = await fetch(`${API_BASE}/reactors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(controlData)
    })
    const endTime = Date.now()
    
    console.log(`   ⏱️  Response time: ${endTime - startTime}ms`)
    console.log(`   📊 Status: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Reactor command executed`)
      console.log(`   📦 Action: ${data.data?.action}`)
      console.log(`   📦 Status: ${data.data?.status}`)
    } else {
      console.log(`   ❌ Failed to execute reactor command`)
      const errorData = await response.json()
      console.log(`   💬 Error: ${errorData.error?.message}`)
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`)
  }
}

async function runTests() {
  console.log('🚀 Ninu Factory Control API Test Suite')
  console.log('=====================================')
  console.log(`Base URL: ${API_BASE}`)
  
  // Test all GET endpoints
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint)
  }
  
  // Test POST endpoints
  await testCreateOrder()
  await testReactorControl()
  
  console.log('\n✨ API test suite completed!')
  console.log('\n📋 Summary:')
  console.log('   • All endpoints should return JSON responses')
  console.log('   • Health check confirms system status')
  console.log('   • Factory data endpoints provide mock data')
  console.log('   • Control endpoints accept commands')
  console.log('\n💡 Next steps:')
  console.log('   • Start WebSocket server: npm run websocket')
  console.log('   • Start development server: npm run dev')
  console.log('   • Visit dashboard: http://localhost:3000/dashboard')
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error.message)
  process.exit(1)
})

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error.message)
  process.exit(1)
})