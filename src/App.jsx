import React, { useState, useRef, useEffect } from "react";

const STADIUM_DATA = {
  gates: [
    { id: "Gate 1", section: "Section A", note: "Wheelchair ramp available" },
    { id: "Gate 2", section: "Section B", note: "Near Medical Point 1" },
    { id: "Gate 3", section: "Section C", note: "Family & accessible seating, near food court" },
    { id: "Gate 4", section: "Section D", note: "VIP entry, closest to Metro station" },
  ],
  restrooms: [
    { id: "Restroom A1", accessible: true, near: "Gate 1" },
    { id: "Restroom B2", accessible: true, near: "Gate 2" },
    { id: "Restroom C1", accessible: false, near: "Gate 3" },
  ],
  medical: [
    { id: "Medical Point 1", near: "Gate 2" },
    { id: "Medical Point 2", near: "Gate 4" },
  ],
  food: [
    { id: "Food Court North", near: "Gate 3", note: "Vegetarian & halal options available" },
  ],
};

const SUGGESTIONS_EN = [
  { label: "Guide me to Gate 4", icon: "🥅" },
  { label: "Nearest accessible washroom?", icon: "♿" },
  { label: "I'm lost, need help!", icon: "🚨" },
];

const SUGGESTIONS_HI = [
  { label: "Gate 4 tak jaana hai", icon: "🥅" },
  { label: "Nearest accessible washroom?", icon: "♿" },
  { label: "Main lost ho gaya hoon", icon: "🚨" },
];

const SYSTEM_PROMPT = `You are "GateGuide", a warm multilingual stadium assistant for a FIFA World Cup 2026 venue.

Rules:
- Detect the language style of the fan's message and mirror it back:
  - If they write in plain English, reply in clear, professional English only.
  - If they write in Hinglish (Hindi words in English script, casual tone), reply in matching Hinglish.
  - Never switch to pure Hindi script (Devanagari) regardless of input.
  - If unsure, default to simple English.
- Keep replies short: 2-4 sentences max.
- Use this stadium data when relevant: ${JSON.stringify(STADIUM_DATA)}
- If the fan seems lost or needs emergency/medical help, reassure them first, then give the nearest help point.
- If accessibility is mentioned, always prioritize step-free routes.
- Never invent gates or facilities not listed in the data.`;

export default function App() {
  const [messages, setMessages] = useState([]);

function startChat(lang) {
  setLanguage(lang);
  const welcome = lang === "en"
    ? "Kickoff time! ⚽ I'm GateGuide, your matchday assistant. Ask me about gates, accessibility, food, or emergency help."
    : "Kickoff ho gaya! ⚽ Main GateGuide hoon, tumhara matchday assistant. Gate, accessibility, food ya emergency help ke baare mein poochho.";
  setMessages([{ role: "assistant", text: welcome }]);
}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: SYSTEM_PROMPT,
          messages: nextMessages,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Connection issue. Phir se try karo." }]);
    } finally {
      setLoading(false);
    }
  }

  if (!language) {
    return (
      <div style={{ maxWidth: 460, margin: "40px auto", background: "#0A1F1A", borderRadius: 20, padding: 40, textAlign: "center", color: "#F5F1E6", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🏟️⚽</div>
        <h2 style={{ marginBottom: 6 }}>Welcome to GateGuide</h2>
        <p style={{ color: "#8FBFA8", marginBottom: 24 }}>Choose your language to begin</p>
        <button onClick={() => startChat("en")} style={{ display: "block", width: "100%", marginBottom: 12, padding: 12, borderRadius: 10, background: "#F4B942", border: "none", fontWeight: 700, cursor: "pointer" }}>
          Continue in English
        </button>
        <button onClick={() => startChat("hi")} style={{ display: "block", width: "100%", padding: 12, borderRadius: 10, background: "#123328", color: "#F5F1E6", border: "1px solid #1E4A3A", fontWeight: 700, cursor: "pointer" }}>
          Hinglish mein baat karo
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 460, margin: "40px auto", background: "#0A1F1A", borderRadius: 20, overflow: "hidden", fontFamily: "sans-serif", height: 600, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 18, background: "#123328", color: "#F5F1E6", fontWeight: 700 }}>
        🏟️ GateGuide
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "#F4B942" : "#123328",
            color: m.role === "user" ? "#3A2A05" : "#F5F1E6",
            padding: "10px 14px",
            borderRadius: 14,
            maxWidth: "80%",
          }}>
            {m.text}
          </div>
        ))}
        {loading && <div style={{ color: "#8FBFA8" }}>GateGuide typing…</div>}
      </div>

      <div style={{ display: "flex", gap: 8, padding: "12px 12px 0" }}>
  <button
    onClick={() => sendMessage(language === "en" ? "EMERGENCY - I need urgent help right now!" : "EMERGENCY - mujhe abhi urgent help chahiye!")}
    style={{
      flex: "0 0 auto",
      background: "#D64545",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "10px 14px",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
    }}
  >
    🚨 SOS
  </button>
  {(language === "en" ? SUGGESTIONS_EN : SUGGESTIONS_HI)
    .filter((s) => !s.label.toLowerCase().includes("lost"))
    .map((s, i) => (
      <button key={i} onClick={() => sendMessage(s.label)} style={{ fontSize: 12 }}>
        {s.icon} {s.label}
      </button>
    ))}
</div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} style={{ display: "flex", gap: 8, padding: 14 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type karo…" style={{ flex: 1 }} />
        <button type="submit">➤</button>
      </form>
    </div>
  );
}