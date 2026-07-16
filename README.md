# GateGuide 🏟️⚽

A multilingual navigation and accessibility assistant for FIFA World Cup 2026 stadiums.

Built for **Hack2Skill PromptWars — Challenge 4: Smart Stadiums & Tournament Operations**.

## The Problem

Massive stadiums are overwhelming even for fluent local speakers. Add a language barrier, a mobility need, or a genuine panic moment, and navigating becomes a real safety issue — not just an inconvenience.

## The Solution

GateGuide lets fans choose English or Hinglish upfront, then answers real questions about gates, accessible routes, restrooms, food, and medical points using Google's Gemini API grounded in structured stadium data. A dedicated SOS button gives instant, calm emergency guidance with one tap.

## Features

- 🌍 Language choice on entry (English / Hinglish)
- 🧭 Real-time navigation grounded in stadium data
- ♿ Accessibility-first routing
- 🚨 One-tap SOS emergency assistance
- 💬 Natural, multi-turn conversation (remembers context)
- 📱 Mobile-first design with a collapsible navigation drawer

## Alignment with Challenge Brief
GateGuide directly addresses the brief's call for **navigation**, **crowd management**, **accessibility**, and **multilingual assistance** at FIFA World Cup 2026 venues — using GenAI (Google Gemini) for real-time, context-aware assistance grounded in structured stadium data.

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Vercel Serverless Functions
- **AI:** Google Gemini API
- **Styling:** Inline CSS-in-JS, stadium-night theme

## Accessibility

- All icon-only controls (close, send, menu toggle) are labeled for screen readers
- The stadium map is announced via `aria-label` for non-visual users
- Accessible/step-free routes are prioritized by default in navigation logic
- High-contrast color palette, keyboard-navigable mobile menu

## Security

The Gemini API key is never exposed client-side — it's stored as an environment variable on Vercel and only ever used inside the serverless `/api/chat` function.

## Testing

Manually tested across desktop and mobile breakpoints (Chrome DevTools + physical device), covering language selection, multilingual chat responses, SOS trigger flow, and mobile navigation drawer behavior.

## Live Demo

🔗 [Try GateGuide live](https://promptwars-gateguide.vercel.app/)

## Author

**Lamiya Zainab** — [@lamiyacodes](https://github.com/lamiyacodes)
