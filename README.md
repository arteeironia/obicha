# Ô bicha! — Landing Page

Stack: **Next.js 15** + **Neon PostgreSQL** + **Vercel**

---

## 🚀 Deploy passo a passo

### 1. Subir no GitHub
```bash
git init
git add .
git commit -m "feat: projeto inicial Ô bicha!"
git remote add origin https://github.com/SEU_USUARIO/obicha.git
git push -u origin main
```

### 2. Criar projeto no Vercel
1. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**
2. Importe o repositório `obicha` do GitHub
3. Clique em **Deploy** (deixe as configurações padrão)

### 3. Adicionar o banco Neon
1. No painel do seu projeto no Vercel, vá em **Storage**
2. Clique em **Create Database** → escolha **Neon**
3. O Vercel vai criar o banco e já configurar a variável `DATABASE_URL` automaticamente

### 4. Configurar variáveis de ambiente no Vercel
No painel do projeto → **Settings → Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `JWT_SECRET` | Um valor aleatório longo (ex: `openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | `https://obicha.com.br` |

> A `DATABASE_URL` já é criada automaticamente pelo Neon no passo 3.

### 5. Rodar a migration do banco
Após o deploy inicial, no seu computador local:
```bash
npm install
cp .env.example .env.local
# Cole a DATABASE_URL do Neon no .env.local
npm run db:migrate
```

### 6. Adicionar o domínio obicha.com.br
1. No Vercel → **Settings → Domains** → adicione `obicha.com.br`
2. O Vercel vai mostrar os registros DNS
3. No Registro.br, adicione:
   - Tipo **A** apontando para o IP do Vercel
   - Tipo **CNAME** `www` apontando para `cname.vercel-dns.com`

---

## 🔐 Primeiro acesso ao admin
1. Acesse `obicha.com.br/admin`
2. Use a senha temporária: `OBicha@2025`
3. **Troque imediatamente** em Configurações → Alterar Senha

---

## 📁 Estrutura do projeto
```
obicha/
├── app/
│   ├── page.tsx              → Landing page
│   ├── admin/
│   │   ├── page.tsx          → Dashboard admin
│   │   ├── login/            → Login
│   │   ├── produtos/         → Gerenciar produtos
│   │   ├── social/           → Gerenciar posts sociais
│   │   ├── pinterest/        → Gerenciar pins
│   │   └── configuracoes/    → Trocar senha
│   └── api/                  → Endpoints da API
├── components/landing/       → Componentes da landing
├── lib/
│   ├── db.ts                 → Conexão e queries do banco
│   ├── auth.ts               → JWT
│   └── migrate.js            → Criação das tabelas
└── middleware.ts              → Proteção das rotas /admin
```

---

## 🛠 Desenvolvimento local
```bash
npm install
cp .env.example .env.local
# Preencha DATABASE_URL e JWT_SECRET no .env.local
npm run db:migrate
npm run dev
```

Acesse: `http://localhost:3000`
Admin: `http://localhost:3000/admin`
