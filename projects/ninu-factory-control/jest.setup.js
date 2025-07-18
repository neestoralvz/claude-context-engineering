import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock Service Worker Registration
const mockServiceWorkerRegistration = {
  scope: 'https://example.com/',
  scriptURL: 'https://example.com/sw.js',
  installing: null,
  waiting: null,
  active: {
    scriptURL: 'https://example.com/sw.js',
    state: 'activated',
    postMessage: jest.fn()
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  unregister: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue(undefined)
};

// Mock Service Worker API with both getRegistration and getRegistrations
Object.defineProperty(window, 'navigator', {
  value: {
    serviceWorker: {
      register: jest.fn().mockResolvedValue(mockServiceWorkerRegistration),
      getRegistration: jest.fn().mockResolvedValue(mockServiceWorkerRegistration),
      getRegistrations: jest.fn().mockResolvedValue([]),
      ready: Promise.resolve(mockServiceWorkerRegistration),
      controller: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    },
    onLine: true,
    userAgent: 'Mozilla/5.0 (Node.js) Test'
  },
  writable: true
})

// Mock Performance Observer
global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn().mockReturnValue([])
}))

// Mock Performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn().mockReturnValue(123.456),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn().mockReturnValue([]),
    getEntriesByName: jest.fn().mockReturnValue([]),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn()
  },
  writable: true
})

// Mock fetch API
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
    url: 'http://localhost/test'
  })
)

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
  },
  writable: true
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
  },
  writable: true
})

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
global.URL.revokeObjectURL = jest.fn()

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}))

// Mock console methods for cleaner test output
const originalError = console.error
const originalWarn = console.warn

beforeEach(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterEach(() => {
  console.error = originalError
  console.warn = originalWarn
})

// Mock caches API
Object.defineProperty(global, 'caches', {
  value: {
    keys: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue(true),
    has: jest.fn().mockResolvedValue(false),
    match: jest.fn().mockResolvedValue(undefined),
    open: jest.fn().mockResolvedValue({
      keys: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(true),
      put: jest.fn().mockResolvedValue(undefined),
      match: jest.fn().mockResolvedValue(undefined)
    })
  },
  writable: true,
  configurable: true
});

// Mock window.confirm
Object.defineProperty(global, 'confirm', {
  value: jest.fn().mockReturnValue(true),
  writable: true,
  configurable: true
});

// Mock window.location.reload
Object.defineProperty(global.window, 'location', {
  value: {
    reload: jest.fn(),
    href: 'https://example.com/',
    origin: 'https://example.com'
  },
  writable: true,
  configurable: true
});

// Global test utilities
global.renderWithProviders = require('./tests/utils/test-utils').renderWithProviders