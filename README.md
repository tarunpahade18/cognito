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

