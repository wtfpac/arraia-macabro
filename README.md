# Arraiá Macabro

Site de convite digital personalizado para o Arraiá Macabro — 2ª edição do PacJunino. Cada convidado acessa com um código único e visualiza um convite com seu nome, informações da festa e confirmação de presença.

## Funcionalidades

- Acesso por código único por convidado
- Boas-vindas personalizadas com nome do convidado
- Confirmação de presença via WhatsApp
- Opção de indicar um acompanhante
- Localização da festa via Google Maps
- Tela de loading animada com efeito de cortina
- Partículas animadas no fundo
- Layout responsivo para mobile e desktop

## Stack

| Categoria | Tecnologia |
|---|---|
| Framework | Next.js 16 + React 19 |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS 4 |
| Banco de dados | PostgreSQL + Prisma ORM |
| Autenticação | NextAuth v5 + bcryptjs |
| Animações | Lottie, tsParticles, Swiper.js |
| Deploy | Vercel + Neon |
| Maps | Google Maps Embed API |

## Instalação

```bash
git clone https://github.com/wtfpac/arraia-macabro.git
cd arraia-macabro
npm install
```

Configure o `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/arraia_macabro"
AUTH_SECRET="seu_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="sua_chave"
```

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Estrutura

arraia-macabro/

├── app/

│   ├── api/

│   │   ├── admin/     # Rotas administrativas

│   │   ├── auth/      # Autenticação

│   │   └── invite/    # Validação e resposta de convites

│   ├── page.tsx

│   └── layout.tsx

├── public/

│   ├── images/

│   ├── fonts/

│   └── animations/

├── lib/

│   └── prisma.ts

└── prisma/

└── schema.prisma

## Equipe

| Dev | Responsabilidade |
|---|---|
| @wtfpac | Frontend, UI/UX, Deploy |
| @kauawerle | Backend, API, Banco de dados |
