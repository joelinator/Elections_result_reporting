/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: false,
    // Use the custom ESLint configuration
    dirs: ['src']
  },
  typescript: {
    // Skip type checking during builds if needed
    ignoreBuildErrors: false
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  }
}

module.exports = nextConfig