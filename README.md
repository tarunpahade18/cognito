# Visionary Aide

Visionary Aide is an open-source AI assistant built with React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Supabase Edge Functions, and optional local Ollama models.

It supports chat, PDF context, voice features, local Ollama inference, direct OpenAI API usage, and an optional Supabase Edge Function gateway for hosted AI responses.

## Features

- Chat with Ollama, OpenAI, or the Supabase-hosted AI gateway.
- Upload PDFs and ask questions with document context.
- Store provider settings locally in the browser.
- Responsive PWA-ready frontend built with Vite.
- Supabase Edge Function for server-side AI gateway calls.

## Prerequisites

- Node.js 18 or newer
- npm
- Optional: Ollama for local models
- Optional: Supabase CLI for Edge Function development/deployment

## Getting Started

```sh
git clone https://github.com/tarun-p10/visionary-aide.git
cd visionary-aide
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite.

## Environment Variables

Create `.env` from `.env.example` and fill in values for the providers you want to use.

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

The Supabase values are required for the bundled Supabase client and the `lovable` provider path. Ollama and OpenAI can be configured in the app settings UI.

For the Supabase Edge Function, set this secret in your Supabase project:

```sh
LOVABLE_API_KEY=
```

## Available Scripts

```sh
npm run dev
npm run build
npm run preview
npm run lint
npm run test
```

## Supabase Edge Function

The chat function lives in `supabase/functions/chat/index.ts`.

To deploy it with the Supabase CLI:

```sh
supabase functions deploy chat
supabase secrets set LOVABLE_API_KEY=your_api_key
```

## Contributing

Contributions are welcome. Read `CONTRIBUTING.md` before opening an issue or pull request.

## Security

Do not commit `.env` files or provider API keys. Report vulnerabilities using the process in `SECURITY.md`.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
