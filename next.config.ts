import type { NextConfig } from 'next'

const CSP = [
  "default-src 'self'",
  // 'unsafe-inline' é necessário pro Meta Pixel (script inline) e pelos estilos inline usados em todo o site (React style={{}})
  // 'unsafe-eval' é necessário por causa do Next.js em alguns cenários de build
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://va.vercel-scripts.com https://*.vercel-insights.com",
  "style-src 'self' 'unsafe-inline'",
  // imagens de produto vêm de vários fornecedores externos diferentes (Cloudinary, Reserva INK, Uma Penca) — por isso https: amplo aqui
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com https://www.facebook.com https://connect.facebook.net",
  "frame-src 'self' https:",
  "frame-ancestors 'self'",
  "form-action 'self' https:",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // 'same-origin-allow-popups' em vez de 'same-origin' — mais seguro que nada, mas não quebra o login com Google
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  // protege os SEUS recursos de serem carregados por outros sites (não afeta o funcionamento do próprio site)
  { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
]

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false, // remove o header X-Powered-By: Next.js
  headers: async () => [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
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
      // Admin e API — sem cache, com header extra de proteção
      source: '/(admin|api)/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
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
