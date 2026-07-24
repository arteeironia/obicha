# Respira — rota /respira dentro do obicha.com.br

## O que já está pronto
- Banco de dados: 3 tabelas no Supabase (`quit_profiles`, `quit_triggers`, `quit_cravings`), com RLS —
  cada pessoa só acessa os próprios dados. Não mexe em nada que já existe no site.
- Login: usa o MESMO Google OAuth que já roda nos comentários do blog. Não precisa configurar nada novo no Supabase.

## O que você precisa fazer (assumindo App Router — pasta `app/`)

1. Copiar os arquivos deste zip pro repositório do site, mantendo a mesma estrutura de pastas:
   - `lib/supabase/client.js`
   - `app/respira/page.jsx`

   > Se o projeto já tem um client Supabase (ex: `lib/supabase.js`), me avisa e eu ajusto o import
   > em `page.jsx` pra reaproveitar esse arquivo em vez de criar um novo.

   > Se o projeto usa **Pages Router** (pasta `pages/`, não `app/`) em vez de App Router, me avisa
   > que eu reescrevo a página nesse formato — é rápido.

2. Instalar a dependência (se ainda não tiver):
   ```
   npm install @supabase/supabase-js
   ```

3. Conferir se estas variáveis de ambiente já existem no projeto Vercel (Settings → Environment Variables).
   Provavelmente já existem, porque os comentários do blog dependem delas. Se não existirem, adicione:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dbihqhzskcxzvkewhhtp.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiaWhxaHpza2N4enZrZXdoaHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODk1MjQsImV4cCI6MjA5NjU2NTUyNH0.aH8ZRJcUxTFa_WprjP8AQeQ-oIqMo8-azsHNuBeavAI
   ```

4. Fazer o deploy (git push, a Vercel já builda automático).

5. Testar em `obicha.com.br/respira` — deve pedir login com Google, depois pedir os dados
   iniciais (cigarros/dia, preço do maço), e cair no painel com contador, marcos de saúde e
   botão de SOS pra fissura.

## Novidades desta versão
- **Modo "vou parar" vs "já parei"**: se a pessoa ainda não parou, mostra contagem regressiva
  até a data escolhida + checklist de preparo, em vez de contagem crescente.
- **"Meu porquê"**: campo de texto com o motivo pessoal de parar, mostrado de novo bem na hora
  da fissura (é o argumento mais forte contra a vontade).
- **7 técnicas pra fissura** em vez de só respiração: respiração 4-7-8, surfar a onda (urge
  surfing), checagem HALT, mexer o corpo, chamar alguém, ocupar a boca, reler o porquê.
- **Header e menu lateral no estilo do site**: logo, menu hambúrguer com o mesmo drawer lateral,
  usando Bebas Neue + Playfair Display e a paleta creme/azul-marinho/vermelho.

⚠️ A paleta e as fontes foram aplicadas de memória (creme #F5EFE4, azul-marinho #101B2D,
vermelho #C63B32, Bebas Neue + Playfair Display). Se os valores reais no seu design system
forem diferentes, é só me passar os hex/fontes certos que eu ajusto — está tudo centralizado
no objeto `C` no topo do arquivo `page.jsx`.

## Integrar ao menu do site
Não tenho acesso ao componente de header do repositório, então não consigo editar o menu
principal diretamente. No `page.jsx` já criei um header próprio pra rota `/respira` (com o
mesmo estilo), mas pra aparecer também no **menu lateral do site inteiro** (o hambúrguer que
abre em `Manifesto / Produtos / Missão / Causa / Redes / Blog / Parcerias / Projeto Social`),
você precisa adicionar um link pra `/respira` no array de navegação desse componente — me manda
o arquivo (provavelmente algo como `components/Header.jsx` ou `components/Nav.jsx`) que eu edito
direto.

## Pendências pra próxima sessão
- Colar o link "Respira" no menu lateral principal do site (preciso do arquivo do header)
- Apple OAuth (precisa de conta paga de developer Apple — decide se vale a pena)
- Compartilhar progresso / ranking entre seguidores (hoje é 100% privado por design)
- Cartão de marco compartilhável pro Instagram (ex: "30 dias sem fumar")
- Notificações / lembretes
- Divulgação: post ou destaque na home do site linkando pra `/respira`
