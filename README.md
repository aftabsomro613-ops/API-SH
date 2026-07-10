# API-SH — Next.js Edition

**Advanced Programming Intelligence · Software Helper**

A production-grade Next.js 14 (App Router) rebuild of the original Streamlit
chat assistant, powered by Azure OpenAI. Same identity, same system prompt,
same boundaries — new stack.

---

## What changed from the Python version

| Area | Python (original) | Next.js (this project) |
|---|---|---|
| Framework | Streamlit | Next.js 14, App Router, TypeScript |
| UI | Streamlit widgets + custom CSS | Custom React components, Tailwind CSS |
| AI calls | `openai` Python SDK + Azure AD (`DefaultAzureCredential`) | `openai` Node SDK, pointed at Azure's `/openai/v1` endpoint (API-key auth) |
| Streaming | Not implemented (single blocking reply) | Token-by-token streaming via a `ReadableStream` |
| Session state | Streamlit `session_state` (single session, in-memory) | Multiple chat sessions, persisted to `localStorage` |
| System prompt | `prompts/system_prompt.py` | `lib/system-prompt.ts` (content preserved verbatim) |

### A note on the endpoint and authentication

This app talks to Azure's **v1 API** surface
(`https://your-resource.openai.azure.com/openai/v1`), which is fully
compatible with the standard OpenAI SDK — no Azure-specific client, no
`api-version` query string. `AZURE_OPENAI_ENDPOINT` should be the full
URL including `/openai/v1` (the code will also tolerate a bare resource
URL and append `/openai/v1` itself).

The original Python app used `DefaultAzureCredential` from
`azure-identity`, which expects the environment to be logged into Azure
(`az login`) or running on Azure infrastructure with a managed identity
attached. That doesn't map cleanly onto a serverless host like Vercel, so
this version authenticates with a standard **Azure OpenAI API key**
instead (`AZURE_OPENAI_API_KEY`).

If you deploy this on Azure infrastructure (App Service, Container Apps,
a VM with a managed identity) and want to keep Azure AD auth instead of a
static key, replace the `apiKey` in `lib/azure-openai.ts` with a bearer
token provider from `@azure/identity`'s `getBearerTokenProvider`, the
same way `services/azure_openai.py` did — the v1 endpoint accepts either.

---

## Project structure

```
api-sh-nextjs/
├── app/
│   ├── api/chat/route.ts     # Streaming chat API route (Azure OpenAI)
│   ├── globals.css           # Design tokens, markdown/code styling
│   ├── layout.tsx            # Root layout, fonts, metadata
│   └── page.tsx              # Renders <ChatApp />
├── components/
│   ├── ChatApp.tsx           # Orchestrates sessions, streaming, state
│   ├── Sidebar.tsx           # Chat history, new chat, branding
│   ├── ChatWindow.tsx        # Welcome screen + message list
│   ├── MessageBubble.tsx     # Single message renderer
│   ├── ChatInput.tsx         # Auto-resizing input + send/stop
│   └── MarkdownRenderer.tsx  # Markdown + syntax-highlighted code
├── lib/
│   ├── azure-openai.ts       # Azure OpenAI client + streaming helper
│   ├── system-prompt.ts      # System prompt (migrated verbatim)
│   ├── storage.ts            # localStorage persistence for sessions
│   └── types.ts              # Shared TypeScript types
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your Azure OpenAI resource details:

```
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/openai/v1
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini
```

You'll find your resource name and key in the Azure Portal under your
OpenAI resource → **Keys and Endpoint** (append `/openai/v1` to the
endpoint shown there). `AZURE_OPENAI_DEPLOYMENT` is the **deployment
name** you gave the model in Azure AI Foundry / Azure OpenAI Studio (not
necessarily the base model's name).

### 3. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm run start
```

### 5. Lint (optional)

```bash
npm run lint
```

---

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, click **New Project** and import the repository.
3. Under **Environment Variables**, add the same three variables from
   `.env.local`:
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_DEPLOYMENT`
4. Deploy. Vercel will run `npm install` and `npm run build` automatically.

You can also deploy from the CLI:

```bash
npm install -g vercel
vercel
vercel --prod
```

---

## Features

- **Streaming responses** — tokens render as they arrive, with a stop
  button to cancel generation mid-stream.
- **Multiple chat sessions** — new chat, switch between chats, delete a
  chat, auto-titled from the first message. Persisted in `localStorage`.
- **Markdown + syntax highlighting** — headings, lists, tables, links, and
  fenced code blocks all render properly in assistant replies.
- **Responsive, accessible UI** — collapsible sidebar on mobile, visible
  keyboard focus states, `prefers-reduced-motion`-friendly animation.
- **Same identity & guardrails** — the system prompt (identity, boundaries,
  safety rules) is carried over unchanged from the original Python app.

### Ideas for future enhancements

The original Streamlit sidebar listed a "Coming Soon" section. Here's how
each maps onto this codebase if you want to build them next:

- **Export chat** — serialize the active session's `messages` array to
  Markdown or JSON and trigger a file download.
- **Upload PDF / image analysis** — extend `app/api/chat/route.ts` to accept
  `multipart/form-data` and pass file content as part of the message using
  the Azure OpenAI vision-capable models.
- **Voice chat** — add the Web Speech API on the client for input, and a
  text-to-speech call for output.
- **Theme switch** — the design tokens already live in
  `tailwind.config.ts`; add a light palette and a toggle stored alongside
  sessions in `localStorage`.

---

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router, Route Handlers)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [openai](https://www.npmjs.com/package/openai) Node SDK (`AzureOpenAI` client)
- [react-markdown](https://github.com/remarkjs/react-markdown) + `remark-gfm` + `rehype-highlight`
- [lucide-react](https://lucide.dev) icons

---

Designed and developed by **Ishfaque Gul**.
