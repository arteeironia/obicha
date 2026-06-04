import type { Metadata } from 'next'
import { Bebas_Neue, Playfair_Display, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ô bicha! — Camisetas LGBT, Gay e Queer com Orgulho',
  description: 'Camisetas LGBT, gay, queer e alternativas feitas no Brasil. Estampas únicas com orgulho, deboche e resistência. 100% algodão sustentável, impressão DTG premium. Camisetas para ursos, pop culture, fetiche e muito mais.',
  keywords: [
    'camiseta LGBT', 'camiseta gay', 'camiseta queer', 'camiseta orgulho gay',
    'camiseta urso gay', 'camiseta estampada diferente', 'camiseta pop culture',
    'camiseta geek gay', 'camiseta fetiche', 'moda LGBT Brasil', 'camiseta orgulho LGBTQ',
    'camiseta deboche', 'camiseta alternativa', 'camiseta resistência', 'moda queer Brasil',
    'camiseta estampada Brasil', 'camiseta algodão sustentável', 'Ô bicha'
  ],
  verification: {
    google: 'T2BZ-F27C4XoTO5HsJv-CdLrr659zXpiHKHezaJGTxA',
    other: {
      'p:domain_verify': 'aca85f278bad61f2805156433d3eb857',
    },
  },
  openGraph: {
    title: 'Ô bicha! — Camisetas com Orgulho',
    description: 'Deboche, amor e resistência. Feito no Brasil.',
    url: 'https://obicha.com.br',
    siteName: 'Ô bicha!',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ô bicha! — Deboche, amor e resistência',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ô bicha! — Camisetas com Orgulho',
    description: 'Deboche, amor e resistência. Feito no Brasil.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://obicha.com.br',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${bebasNeue.variable} ${playfairDisplay.variable} ${dmSans.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
