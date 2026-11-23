import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://demoapi.artniverse.com/api/:path*',
      },
      {
        source: '/v1/:path*',
        destination: 'https://demoapi.artniverse.com/v1/:path*',
      },
    ]
  },
}

export default nextConfig
