# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



# 🖥️ Sistema de Estoque — Frontend

> Interface web do sistema de estoque, desenvolvida com **React + Vite**.

---

## 🛠️ Stack

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)

---

## 🚀 Criando o projeto

Na pasta principal do projeto:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

---

## 📦 Dependências

### 🌐 Comunicação com a API

```bash
npm install axios
```

Usado para realizar requisições HTTP para o backend.

### 🧭 Rotas

```bash
npm install react-router-dom
```

Usado para navegação entre páginas da aplicação.

### 🎨 Ícones

```bash
npm install lucide-react
```

Biblioteca de ícones para a interface.

---

## 📁 Estrutura inicial

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔐 Variáveis de ambiente

Se o frontend precisar acessar a API através de uma URL configurável, crie:

```text
.env
```

Exemplo:

```env
VITE_API_URL=http://localhost:3000
```

No React:

```js
const API_URL = import.meta.env.VITE_API_URL;
```

> Variáveis expostas ao frontend devem começar com `VITE_`. Não coloque senhas ou outras informações secretas no `.env` do frontend.

---

## ▶️ Executando o projeto

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Visualizar o build

```bash
npm run preview
```

---

## 📌 Comandos rápidos

| Comando | Função |
|---|---|
| `npm install` | Instala as dependências |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm run preview` | Visualiza o build |
| `npm install axios` | Instala o Axios |
| `npm install react-router-dom` | Instala o React Router |
| `npm install lucide-react` | Instala os ícones |

---

## 🧩 Dependências principais

```text
React
React DOM
Axios
React Router DOM
Lucide React
```

O React e o React DOM são instalados automaticamente pelo template React do Vite.

---

## 📂 Organização sugerida

```text
src/
├── assets/       # Imagens e arquivos estáticos
├── components/   # Componentes reutilizáveis
├── pages/        # Páginas da aplicação
├── services/     # Comunicação com a API
├── App.jsx       # Rotas e estrutura principal
└── main.jsx      # Entrada da aplicação
```

---

## 🔗 Comunicação com o Backend

O frontend será responsável pela interface e consumirá a API criada no backend.

```text
┌──────────────┐
│    React     │
│    + Vite    │
└──────┬───────┘
       │ Axios / HTTP
       ▼
┌──────────────┐
│   Express    │
│     API      │
└──────┬───────┘
       │ Prisma
       ▼
┌──────────────┐
│ PostgreSQL   │
└──────────────┘
```

---

### 📚 Tecnologias

**React • Vite • JavaScript • Axios • React Router • Lucide React**
