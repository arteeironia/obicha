import type { Metadata } from 'next'
import { Bebas_Neue, Playfair_Display, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'
import PageViewTracker from '@/components/PageViewTracker'
import './globals.css'

const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas', display: 'swap' })
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm', display: 'swap' })

export const metadata: Metadata = {
  title: 'Ô bicha! — Camisetas LGBT, Gay e Queer com Orgulho',
  description: 'Camisetas LGBT, gay, queer e alternativas feitas no Brasil. Estampas únicas com orgulho, deboche e resistência. 100% algodão sustentável, impressão DTG premium.',
  keywords: [
    'camiseta LGBT', 'camiseta gay', 'camiseta queer', 'camiseta orgulho gay',
    'camiseta urso gay', 'camiseta estampada diferente', 'camiseta pop culture',
    'camiseta geek gay', 'camiseta fetiche', 'moda LGBT Brasil', 'camiseta orgulho LGBTQ',
    'camiseta deboche', 'camiseta alternativa', 'camiseta resistência', 'moda queer Brasil',
    'camiseta estampada Brasil', 'camiseta algodão sustentável', 'Ô bicha'
  ],
  verification: {
    google: 'T2BZ-F27C4XoTO5HsJv-CdLrr659zXpiHKHezaJGTxA',
    other: { 'p:domain_verify': 'aca85f278bad61f2805156433d3eb857' },
  },
  openGraph: {
    title: 'Ô bicha! — Camisetas com Orgulho',
    description: 'Deboche, amor e resistência. Feito no Brasil.',
    url: 'https://obicha.com.br',
    siteName: 'Ô bicha!',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Ô bicha! — Deboche, amor e resistência' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ô bicha! — Camisetas com Orgulho',
    description: 'Deboche, amor e resistência. Feito no Brasil.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://obicha.com.br' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1768645034492668');
          fbq('track', 'PageView');
        `}</Script>
        <noscript>
          <img height="1" width="1" style={{display:'none'}}
            src="https://www.facebook.com/tr?id=1768645034492668&ev=PageView&noscript=1" />
        </noscript>
      </head>
      <body className={`${bebasNeue.variable} ${playfairDisplay.variable} ${dmSans.variable}`}>
        {children}
        <PageViewTracker />
        <Analytics />
      </body>
    </html>
  )
}
