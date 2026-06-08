# 🚀 Guia de Deploy — Alma Church no Railway

Este guia coloca **tudo no ar**: site (frontend) + API (backend) + banco PostgreSQL.
Você vai criar **3 serviços** dentro de **1 projeto** no Railway.

> **Importante:** o repositório no GitHub deve ser **PRIVADO** — o projeto lida com
> dados pessoais de alunos (LGPD).

---

## ✅ Pré-requisitos
- [ ] Conta no **GitHub** (grátis) — https://github.com
- [ ] Conta no **Railway** (você já tem) — https://railway.app
- [ ] **Git** instalado no computador — https://git-scm.com

---

## PASSO 1 — Subir o código para o GitHub (repo privado)

No terminal, dentro da pasta `BTCP`:

```bash
git init
git add .
git commit -m "Alma Church - versão inicial para deploy"
```

1. No GitHub, clique em **New repository**
2. Nome: `alma-church` · Marque **Private** · **Create repository**
3. Copie os comandos que o GitHub mostra (algo como):

```bash
git remote add origin https://github.com/SEU-USUARIO/alma-church.git
git branch -M main
git push -u origin main
```

> O `.gitignore` já protege seus segredos (.env) e os dados dos alunos (seed-data.json).

---

## PASSO 2 — Criar o projeto e o banco no Railway

1. No Railway: **New Project** → **Deploy from GitHub repo** → escolha `alma-church`
2. (Ele vai tentar criar um serviço — pode deixar, vamos configurar já já)
3. Clique em **+ New** → **Database** → **Add PostgreSQL**

Pronto: agora você tem o banco. O Railway gera a `DATABASE_URL` automaticamente.

---

## PASSO 3 — Configurar o serviço BACKEND (a API)

1. Clique no serviço criado a partir do GitHub → aba **Settings**
2. Em **Root Directory**, coloque: `backend`
3. Em **Variables**, adicione:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `${{ Postgres.DATABASE_URL }}` *(referência ao banco)* |
| `JWT_SECRET` | `0c81d7b13327f127157f864a3cc5e0bac8c528eb84b9aba3611b2db78880ec34` |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | *(preenche no Passo 5, depois que o frontend tiver URL)* |

4. Em **Settings → Networking**, clique em **Generate Domain** → anote a URL
   (ex: `https://alma-api.up.railway.app`). **Essa é a URL da API.**

---

## PASSO 4 — Importar os 73 alunos no banco

Os dados ficam **fora do GitHub** por segurança, então importamos direto no banco:

1. No serviço **Postgres** do Railway → aba **Variables** → copie a
   **`DATABASE_PUBLIC_URL`** (a URL pública, que dá pra acessar de fora)
2. No seu computador, na pasta `BTCP/backend`, crie/edite o arquivo `.env`:

```
DATABASE_URL="cole-aqui-a-DATABASE_PUBLIC_URL-do-railway"
```

3. Rode no terminal (dentro de `BTCP/backend`):

```bash
npm install
npx prisma db push      # cria as tabelas no Postgres
npm run db:seed         # importa admin + professores + 10 manuais + 73 alunos
```

> Deve aparecer: "✅ Importação concluída!" com 73 alunos.

---

## PASSO 5 — Configurar o serviço FRONTEND (o site)

1. No projeto Railway: **+ New** → **GitHub Repo** → mesmo repo `alma-church`
2. No novo serviço → **Settings** → **Root Directory**: deixe **vazio** (raiz)
3. Em **Variables**, adicione:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | a URL da API do Passo 3 (ex: `https://alma-api.up.railway.app`) |

4. **Settings → Networking** → **Generate Domain** → anote a URL do site
   (ex: `https://alma-church.up.railway.app`)

---

## PASSO 6 — Conectar os dois (CORS)

1. Volte no serviço **BACKEND** → **Variables**
2. Preencha `FRONTEND_URL` com a URL do site (Passo 5)
3. O Railway re-deploya automaticamente.

---

## PASSO 7 — Testar 🎉

Acesse a URL do site e faça login:

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | `admin@btcp.edu.br` | `btcp2026` |
| Aluno | `matheusvmmarques@gmail.com` | `btcp2026` |

---

## 🌐 Domínio próprio (opcional)

Quando quiser usar `almachurch.com.br`:
- No serviço **Frontend** → Settings → Networking → **Custom Domain** → digite seu domínio
- O Railway mostra um registro **CNAME** para você cadastrar no painel onde
  comprou o domínio (Registro.br, GoDaddy, etc.)

---

## 🔄 Atualizações futuras

Toda vez que você quiser atualizar o site, é só:

```bash
git add .
git commit -m "descrição da mudança"
git push
```

O Railway detecta o push e re-deploya **automaticamente**. ✨
