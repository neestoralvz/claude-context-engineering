/** @type {import('next').NextConfig} */

const nextConfig = {
  // Production optimizations for Mexican infrastructure
  output: 'standalone',
  
  // Compression for slower connections
  compress: true,
  
  // Image optimization for bandwidth conservation
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours cache
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Allow external domains for factory images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Build optimization
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Advanced experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'],
    optimizeCss: true,
  },
  
  // Webpack optimizations for smaller bundles
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Tree shaking optimization
      config.optimization.sideEffects = false
      
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Core framework bundle
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // UI libraries bundle
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](lucide-react|class-variance-authority|clsx|tailwind-merge)[\\/]/,
            priority: 30,
          },
          // Chart libraries (potentially large)
          charts: {
            name: 'charts',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](recharts|d3-*)[\\/]/,
            priority: 25,
          },
          // Common vendor libraries
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 20,
            chunks: 'all',
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      }
    }
    
    return config
  },
  
  // Performance headers optimized for Mexican CDNs
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Performance headers for Mexican infrastructure
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ]
      },
      {
        // Cache static assets aggressively for slow connections
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // Cache service worker
        source: '/ninu-sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      }
    ]
  },
  
  // Redirect optimizations
  async rewrites() {
    return [
      // Optimize for Mexican routing
      {
        source: '/dashboard',
        destination: '/dashboard'
      }
    ]
  }
}

module.exports = nextConfig