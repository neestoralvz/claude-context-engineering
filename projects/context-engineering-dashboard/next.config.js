/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Remove static export for Vercel compatibility
  // output: 'export', // Commented out for Vercel deployment
  trailingSlash: false,
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Image optimization for static export
  images: {
    unoptimized: true,
    domains: ['cdn.jsdelivr.net'], // KaTeX CDN
  },
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    // Add unique name to prevent conflicts with other Next.js projects
    config.name = 'context-engineering-dashboard';
    
    // Configure unique webpack runtime for this project
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: {
          name: 'ce-dashboard-runtime'
        },
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            ceVendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'ce-vendors',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }
    
    // Optimize for mathematical formula rendering (conditional)
    try {
      config.resolve.alias = {
        ...config.resolve.alias,
        'katex/dist/katex.css': require.resolve('katex/dist/katex.css'),
      };
    } catch (e) {
      // KaTeX not installed, skip alias configuration
    }
    
    // Support for markdown files
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });

    return config;
  },
  // Vercel deployment optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://context-engineering.vercel.app',
    NEXT_PUBLIC_APP_NAME: 'Context Engineering',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Advanced AI Interaction Methodology Platform',
  },
  
  // Bundle analysis (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: true,
          })
        )
      }
      return config
    },
  }),
};

module.exports = nextConfig;