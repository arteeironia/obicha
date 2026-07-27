import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — Ô bicha!',
  robots: { index: true, follow: true },
}

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <style>{`
        :root { --creme:#F2EBD9; --navy:#1A2744; --red:#C0281C; --gold:#D4A843; --sidebar:220px; }
        *, *::before, *::after { box-sizing:border-box; }
        body { margin:0; background:var(--navy); color:var(--creme); font-family:var(--font-dm),sans-serif; }
        .main { margin-left:0; min-height:100vh; padding:5rem 1.5rem 6rem; }
        .content { max-width:760px; margin:0 auto; }
        .content h1 { font-family:var(--font-playfair); font-size:clamp(2rem,5vw,2.8rem); font-weight:900; margin-bottom:.5rem; }
        .content h2 { font-family:var(--font-bebas); letter-spacing:1px; color:var(--gold); font-size:1.3rem; margin:2.2rem 0 .8rem; }
        .content p, .content li { font-size:.95rem; line-height:1.8; opacity:.85; margin-bottom:.8rem; }
        .content ul { padding-left:1.3rem; }
        .content a { color:var(--gold); }
        .back-link { display:inline-block; margin-bottom:2rem; font-family:var(--font-bebas); letter-spacing:1px; color:var(--gold); text-decoration:none; opacity:.8; font-size:.85rem; }
      `}</style>

      <main className="main">
        <div className="content">
          <Link href="/" className="back-link">← voltar pro site</Link>
          <h1>Política de Privacidade</h1>
          <p style={{ opacity: .5, fontSize: '.85rem' }}>Última atualização: julho de 2026</p>

          <p>
            A Ô bicha! (obicha.com.br) respeita sua privacidade e se compromete a proteger os dados pessoais que você compartilha ao usar nosso site, blog, quiz e o aplicativo Respira. Esta política explica quais dados coletamos, por quê, e quais direitos você tem sobre eles, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </p>

          <h2>QUAIS DADOS COLETAMOS</h2>
          <ul>
            <li><b>Comentários do blog e app Respira:</b> nome e foto do seu perfil Google, quando você faz login para comentar ou usar o Respira.</li>
            <li><b>Dados de uso do Respira:</b> informações que você mesmo cadastra (data que parou de fumar, cigarros por dia, gatilhos, textos que você escreve) — usadas só pra fazer o app funcionar pra você.</li>
            <li><b>Navegação no site:</b> quais páginas você visita e em quais produtos clica (analytics próprio), só se você aceitar cookies não-essenciais.</li>
            <li><b>Dados de contato:</b> nome, e-mail e mensagem, quando você usa o formulário de parcerias ou fale conosco.</li>
          </ul>

          <h2>COOKIES E TECNOLOGIAS SIMILARES</h2>
          <p>Usamos três tipos de cookies:</p>
          <ul>
            <li><b>Essenciais:</b> necessários pro site funcionar (login do admin, sessão do Google). Não podem ser desativados.</li>
            <li><b>Analytics:</b> nosso próprio sistema, que mostra quais páginas e produtos são mais visitados — só ativa se você aceitar.</li>
            <li><b>Marketing:</b> o Meta Pixel (Facebook/Instagram), usado pra medir a eficiência de anúncios — só ativa se você aceitar.</li>
          </ul>
          <p>Você pode escolher aceitar ou recusar os cookies não-essenciais no banner que aparece na primeira visita ao site.</p>

          <h2>COM QUEM COMPARTILHAMOS DADOS</h2>
          <ul>
            <li><b>Google:</b> autenticação (login) do blog e do Respira.</li>
            <li><b>Meta (Facebook/Instagram):</b> Pixel de anúncios, só com consentimento.</li>
            <li><b>Vercel:</b> hospedagem do site e analytics técnico agregado.</li>
            <li><b>Supabase:</b> banco de dados onde ficam armazenados os dados de login e do Respira.</li>
            <li><b>Cloudinary:</b> hospedagem das imagens do site.</li>
          </ul>
          <p>Não vendemos nem alugamos seus dados pessoais para terceiros.</p>

          <h2>SEUS DIREITOS</h2>
          <p>Você pode, a qualquer momento:</p>
          <ul>
            <li>Pedir uma cópia dos dados que temos sobre você;</li>
            <li>Corrigir informações incorretas;</li>
            <li>Excluir sua conta e todos os dados do Respira — dentro do próprio app, na aba Config, tem o botão "quero sair do app e excluir meu registro", que apaga tudo de forma definitiva e imediata;</li>
            <li>Revogar o consentimento de cookies não-essenciais, limpando os dados do navegador ou recusando no banner.</li>
          </ul>

          <h2>SEGURANÇA</h2>
          <p>
            O site usa conexão criptografada (HTTPS), políticas de segurança de navegador (Content-Security-Policy e outras) e cookies de login protegidos contra acesso indevido. Nenhum sistema é 100% infalível, mas trabalhamos continuamente pra manter o ambiente seguro.
          </p>

          <h2>CRIANÇAS E ADOLESCENTES</h2>
          <p>Nosso site e o Respira não são direcionados a menores de 18 anos.</p>

          <h2>ALTERAÇÕES NESTA POLÍTICA</h2>
          <p>Podemos atualizar esta política de tempos em tempos. Mudanças relevantes serão comunicadas nesta mesma página.</p>

          <h2>CONTATO</h2>
          <p>
            Dúvidas sobre seus dados ou esta política? Fala com a gente em{' '}
            <a href="mailto:faleconosco@obicha.com.br">faleconosco@obicha.com.br</a>.
          </p>
        </div>
      </main>
    </>
  )
}
