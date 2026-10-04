# BriefForge AI

A polished browser app for generating marketing copy, social posts, launch messaging, and ad concepts from a simple business brief.

## Features

- AI-powered prompt workflow for brand, audience, offer, and objective
- Multi-format outputs for:
  - Social posts
  - Email copy
  - Ad copy
  - Launch messaging
  - Headlines
- Save favorite ideas to a local creative library
- Copy-to-clipboard actions
- Premium-style SaaS dashboard UI
- Works in demo mode without an API key and supports OpenAI when configured

## Local development

1. Install dependencies:
   npm install
2. Start app:
   npm run dev
3. Open the frontend in your browser at:
   http://localhost:5173

## Production build

npm run build
npm run start

## Optional AI integration

Copy `.env.example` to `.env` and add your OpenAI API key:

OPENAI_API_KEY=your_key_here
PORT=3001

If no API key is configured, the app uses a built-in demo generation mode so it still works out of the box.
