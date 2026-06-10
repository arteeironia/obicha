import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compress: true,
  headers: async () => [
    {
      // Cache de assets estáticos — 1 ano
      source: '/_next/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      // Cache de imagens públicas — 7 dias
      source: '/(.*)\\.(png|jpg|jpeg|gif|webp|svg|ico)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
      ],
    },
    {
      // Páginas principais — cache de 60 segundos no browser
      source: '/((?!admin|api).*)',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
      ],
    },
    {
      // Admin e API — sem cache
      source: '/(admin|api)/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' },
      ],
    },
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i0.wp.com' },
    ],
  },
}

export default nextConfig
