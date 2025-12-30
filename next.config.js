const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable image optimization for Vercel
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimize production builds
  swcMinify: true,
  // Compress output
  compress: true,
  // Power optimization
  poweredByHeader: false,
  // Disable automatic scroll restoration to allow custom scroll behavior
  experimental: {
    scrollRestoration: false,
  },
  // Webpack configuration for path aliases
  webpack: (config, { isServer }) => {
    const projectRoot = path.resolve(__dirname)
    
    // Resolve @ alias to project root - handle both @ and @/*
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': projectRoot,
    }
    
    // Ensure proper module resolution
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      ...(config.resolve.modules || []),
    ]
    
    return config
  },
}

module.exports = nextConfig
