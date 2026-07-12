# GateGuide 🏟️⚽

A multilingual navigation and accessibility assistant for FIFA World Cup 2026 stadiums, built for Hack2Skill PromptWars Challenge 4: Smart Stadiums & Tournament Operations.

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

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- AI: Google Gemini API
- Styling: Inline CSS-in-JS, stadium-night theme

## Running Locally
1. `npm install`
2. Add a `.env` file with `GEMINI_API_KEY=your_key_here`
3. Run the backend: `node server.js`
4. In a separate terminal, run the frontend: `npm run dev`

## Author
Lamiya Zainab — [@lamiyacodes](https://github.com/lamiyacodes)