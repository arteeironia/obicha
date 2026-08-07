import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Respira — por Ô bicha!',
  description: 'Um companheiro de bolso pra quem tá tentando (ou já decidiu) parar de fumar. Botão de SOS, missões diárias, diário e comunidade — sem julgamento.',
  openGraph: {
    title: 'Respira — por Ô bicha!',
    description: 'Um companheiro de bolso pra quem tá tentando (ou já decidiu) parar de fumar.',
    url: 'https://obicha.com.br/respira',
    siteName: 'Respira — Ô bicha!',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/banner.png', width: 1774, height: 887, alt: 'Respira — por Ô bicha!' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Respira — por Ô bicha!',
    description: 'Um companheiro de bolso pra quem tá tentando (ou já decidiu) parar de fumar.',
    images: ['/banner.png'],
  },
}

export default function RespiraLayout({ children }: { children: React.ReactNode }) {
  return children
}
