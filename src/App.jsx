import React, { useState, useRef, useEffect } from "react";

const STADIUM_DATA = {
  gates: [
    { id: "Gate 1", section: "Section A", note: "Wheelchair ramp available", crowd: "Low" },
    { id: "Gate 2", section: "Section B", note: "Near Medical Point 1", crowd: "Medium" },
    { id: "Gate 3", section: "Section C", note: "Family & accessible seating, near food court", crowd: "High" },
    { id: "Gate 4", section: "Section D", note: "VIP entry, closest to Metro station", crowd: "Low" },
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
  { label: "How do I get to my seat?", icon: "🥅" },
  { label: "Is there a wheelchair-friendly route?", icon: "♿" },
  { label: "Where can I grab food nearby?", icon: "🍔" },
];

const SUGGESTIONS_HI = [
  { label: "Mera seat kahan hai?", icon: "🥅" },
  { label: "Wheelchair wala route hai kya?", icon: "♿" },
  { label: "Khana kahan milega paas mein?", icon: "🍔" },
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

const THEMES = {
  dark: {
    bg: "#0A1420", sidebar: "#101B33", card: "#14213D", border: "#1F3A5F",
    text: "#F5F1E6", subtext: "#9FB3C8", accent: "#F4B942", accentText: "#3A2A05",
    green: "#4ADE80", red: "#D64545", pitch: "#1A2E22",
  },
  light: {
    bg: "#F4F1E8", sidebar: "#FFFFFF", card: "#ECE7D9", border: "#D8D2BF",
    text: "#1F2937", subtext: "#6B6555", accent: "#C9922A", accentText: "#2A1A00",
    green: "#1E8449", red: "#C0392B", pitch: "#DCEFE0",
  },
};

function StadiumMap({ c, gateData }) {
  const positions = [
    { id: "Gate 1", short: "G1", x: 40, y: 20 },
    { id: "Gate 2", short: "G2", x: 160, y: 20 },
    { id: "Gate 3", short: "G3", x: 40, y: 140 },
    { id: "Gate 4", short: "G4", x: 160, y: 140 },
  ];
  return (
    <svg viewBox="0 0 200 160" style={{ width: "100%", borderRadius: 10 }}>
      <rect x="0" y="0" width="200" height="160" rx="12" fill={c.card} />
      <ellipse cx="100" cy="80" rx="70" ry="55" fill={c.pitch} stroke={c.border} strokeWidth="2" />
      <line x1="100" y1="25" x2="100" y2="135" stroke={c.border} strokeWidth="1.5" />
      <circle cx="100" cy="80" r="18" fill="none" stroke={c.border} strokeWidth="1.5" />
      <rect x="15" y="10" width="170" height="15" rx="4" fill="none" stroke={c.border} strokeWidth="1" />
      <rect x="15" y="135" width="170" height="15" rx="4" fill="none" stroke={c.border} strokeWidth="1" />
      <rect x="8" y="30" width="12" height="100" rx="4" fill="none" stroke={c.border} strokeWidth="1" />
      <rect x="180" y="30" width="12" height="100" rx="4" fill="none" stroke={c.border} strokeWidth="1" />
      {positions.map((p) => {
        const gate = gateData.find((g) => g.id === p.id);
        const dotColor = gate?.crowd === "High" ? c.red : gate?.crowd === "Medium" ? c.accent : c.green;
        return (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r="9" fill={dotColor} />
            <text x={p.x} y={p.y + 3} fontSize="8" fontWeight="700" textAnchor="middle" fill={c.accentText}>{p.short}</text>
          </g>
        );
      })}
    </svg>
  );
}

const CONSOLES = [
  { id: "assistant", icon: "💬", title: "AI Assistant", desc: "Chat with GateGuide for real-time help" },
  { id: "navigation", icon: "🧭", title: "Smart Navigation", desc: "Gate map & accessible routing" },
  { id: "emergency", icon: "🚨", title: "Emergency Center", desc: "One-tap SOS & medical help" },
  { id: "accessibility", icon: "♿", title: "Accessibility Hub", desc: "Step-free routes & support" },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(null);
  const [showFacts, setShowFacts] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [view, setView] = useState("home");
  const [weather, setWeather] = useState(null);
  const scrollRef = useRef(null);
  const c = THEMES[theme];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=40.8135&longitude=-74.0745&current_weather=true")
      .then((res) => res.json())
      .then((data) => setWeather(data.current_weather))
      .catch(() => setWeather(null));
  }, []);

  function startChat(lang) {
    setLanguage(lang);
    const welcome = lang === "en"
      ? "Kickoff time! ⚽ I'm GateGuide, your matchday assistant. Ask me about gates, accessibility, food, or emergency help."
      : "Kickoff ho gaya! ⚽ Main GateGuide hoon, tumhara matchday assistant. Gate, accessibility, food ya emergency help ke baare mein poochho.";
    setMessages([{ role: "assistant", text: welcome }]);
  }

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
        body: JSON.stringify({ systemPrompt: SYSTEM_PROMPT, messages: nextMessages }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Connection issue. Phir se try karo." }]);
    } finally {
      setLoading(false);
    }
  }

  function openConsole(id) {
    setView(id);
    if (id === "emergency") {
      sendMessage(language === "en" ? "EMERGENCY - I need urgent help right now!" : "EMERGENCY - mujhe abhi urgent help chahiye!");
    } else if (id === "accessibility") {
      sendMessage(language === "en" ? "Tell me about accessibility options here" : "Accessibility options kya hain yahan?");
    } else if (id === "navigation") {
      setShowFacts(true);
    }
  }

  if (!language) {
    return (
      <div style={{ maxWidth: 460, margin: "40px auto", background: c.bg, borderRadius: 20, padding: 40, textAlign: "center", color: c.text, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🏟️⚽</div>
        <h2 style={{ marginBottom: 6, color: c.text }}>Welcome to GateGuide</h2>
        <p style={{ color: c.subtext, marginBottom: 24 }}>Choose your language to begin</p>
        <button onClick={() => startChat("en")} style={{ display: "block", width: "100%", marginBottom: 12, padding: 12, borderRadius: 10, background: c.accent, color: c.accentText, border: "none", fontWeight: 700, cursor: "pointer" }}>
          Continue in English
        </button>
        <button onClick={() => startChat("hi")} style={{ display: "block", width: "100%", padding: 12, borderRadius: 10, background: c.card, color: c.text, border: `1px solid ${c.border}`, fontWeight: 700, cursor: "pointer" }}>
          Hinglish mein baat karo
        </button>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ marginTop: 16, background: "transparent", border: "none", color: c.subtext, fontSize: 12, cursor: "pointer" }}>
          {theme === "dark" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
        </button>
      </div>
    );
  }

  const navItems = [
    { icon: "🏠", label: "Home", onClick: () => setView("home") },
    { icon: "💬", label: "AI Assistant", onClick: () => setView("assistant") },
    { icon: "🧭", label: "Navigation", onClick: () => openConsole("navigation") },
    { icon: "🚨", label: "Emergency", onClick: () => openConsole("emergency") },
    { icon: "♿", label: "Accessibility", onClick: () => openConsole("accessibility") },
  ];

  return (
    <div style={{ maxWidth: 1140, margin: "30px auto", background: c.bg, borderRadius: 20, overflow: "hidden", fontFamily: "'Inter', sans-serif", height: 680, display: "flex" }}>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; }
        }
        .console-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .console-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.25);
        }
      `}</style>

      <div style={{ width: 210, background: c.sidebar, borderRight: `1px solid ${c.border}`, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ color: c.text, fontWeight: 800, fontSize: 16 }}>🏟️ GateGuide</div>
        <div style={{ color: c.subtext, fontSize: 12 }}>Operations Portal</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          {navItems.map((n, i) => (
            <div key={i} onClick={n.onClick} style={{
              display: "flex", alignItems: "center", gap: 10,
              color: c.subtext, fontSize: 13, fontWeight: 500, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
            }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: c.card, fontSize: 14 }}>
                {n.icon}
              </span>
              {n.label}
            </div>
          ))}
        </div>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ marginTop: "auto", background: "transparent", border: `1px solid ${c.border}`, color: c.subtext, borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {view === "home" ? (
        <div style={{ flex: 1, padding: 30, overflowY: "auto" }}>
          <div style={{ color: c.text, fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Welcome back 👋</div>
          <div style={{ color: c.subtext, fontSize: 13, marginBottom: 24 }}>Choose a console to get started</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {CONSOLES.map((cs) => (
              <div key={cs.id} onClick={() => openConsole(cs.id)} className="console-card" style={{
                background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20, cursor: "pointer",
              }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{cs.icon}</div>
                <div style={{ color: c.text, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{cs.title}</div>
                <div style={{ color: c.subtext, fontSize: 12 }}>{cs.desc}</div>
                <div style={{ color: c.accent, fontSize: 12, marginTop: 12, fontWeight: 700 }}>Enter Console →</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 18, background: c.card, color: c.text, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              🏟️ GateGuide
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.green, display: "inline-block", animation: "pulse 1.5s infinite" }} />
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowFacts(!showFacts)} style={{ background: "transparent", border: `1px solid ${c.subtext}`, color: c.subtext, borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                ℹ️ Gates
              </button>
              <button onClick={() => setView("home")} style={{ background: "transparent", border: `1px solid ${c.subtext}`, color: c.subtext, borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                ← Back
              </button>
            </div>
          </div>

          {showFacts && (
            <div style={{ background: c.sidebar, padding: 14, fontSize: 12, color: c.subtext, borderBottom: `1px solid ${c.border}` }}>
              {STADIUM_DATA.gates.map((g, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <strong style={{ color: c.text }}>{g.id}</strong> — {g.section} · {g.note}
                </div>
              ))}
            </div>
          )}

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10, background: c.bg }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? c.accent : c.card,
                color: m.role === "user" ? c.accentText : c.text,
                padding: "10px 14px", borderRadius: 14, maxWidth: "80%", position: "relative",
              }}>
                {m.text}
                {m.role === "assistant" && (
                  <button onClick={() => navigator.clipboard.writeText(m.text)} style={{ display: "block", marginTop: 6, background: "transparent", border: "none", color: c.subtext, fontSize: 11, cursor: "pointer", padding: 0 }}>
                    📋 Copy
                  </button>
                )}
              </div>
            ))}
            {loading && <div style={{ color: c.subtext }}>GateGuide typing…</div>}
          </div>

          <div style={{ display: "flex", gap: 8, padding: "12px 12px 0" }}>
            <button onClick={() => openConsole("emergency")} style={{ flex: "0 0 auto", background: c.red, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              🚨 SOS
            </button>
            {(language === "en" ? SUGGESTIONS_EN : SUGGESTIONS_HI)
              .filter((s) => !s.label.toLowerCase().includes("lost"))
              .map((s, i) => (
                <button key={i} onClick={() => sendMessage(s.label)} style={{ fontSize: 12, background: c.card, color: c.text, border: `1px solid ${c.border}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}>
                  {s.icon} {s.label}
                </button>
              ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} style={{ display: "flex", gap: 8, padding: 14 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type karo…" style={{ flex: 1, background: c.card, color: c.text, border: `1px solid ${c.border}`, borderRadius: 8, padding: "8px 12px" }} />
            <button type="submit" style={{ background: c.accent, color: c.accentText, border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}>➤</button>
          </form>
        </div>
      )}

      <div style={{ width: 240, background: c.sidebar, borderLeft: `1px solid ${c.border}`, padding: 20, overflowY: "auto" }}>
        {weather && (
          <div style={{ background: c.card, borderRadius: 10, padding: 12, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: c.subtext, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5 }}>Live Weather · MetLife Stadium</div>
              <div style={{ color: c.text, fontSize: 18, fontWeight: 800 }}>{Math.round(weather.temperature * 9/5 + 32)}°F</div>
            </div>
            <span style={{ fontSize: 22 }}>🌤️</span>
          </div>
        )}

        <div style={{ color: c.text, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Stadium Map</div>
        <StadiumMap c={c} gateData={STADIUM_DATA.gates} />

        <div style={{ color: c.text, fontWeight: 700, fontSize: 13, margin: "18px 0 10px" }}>⚡ Live Status</div>
        <div style={{ background: c.card, borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <div style={{ color: c.subtext, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5 }}>Gates Active</div>
          <div style={{ color: c.accent, fontSize: 18, fontWeight: 800 }}>4 / 4</div>
        </div>
        <div style={{ background: c.card, borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <div style={{ color: c.subtext, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5 }}>Accessible Routes</div>
          <div style={{ color: c.green, fontSize: 18, fontWeight: 800 }}>3 Ready</div>
        </div>
        <div style={{ background: c.card, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <div style={{ color: c.subtext, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5 }}>Medical Points</div>
          <div style={{ color: c.text, fontSize: 18, fontWeight: 800 }}>2 Staffed</div>
        </div>

        <div style={{ color: c.text, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>👥 Gate Crowd Levels</div>
        {STADIUM_DATA.gates.map((g, i) => {
          const crowdColor = g.crowd === "High" ? c.red : g.crowd === "Medium" ? c.accent : c.green;
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < STADIUM_DATA.gates.length - 1 ? `1px solid ${c.border}` : "none" }}>
              <span style={{ color: c.text, fontSize: 12 }}>{g.id}</span>
              <span style={{ color: crowdColor, fontSize: 11, fontWeight: 700, background: c.card, padding: "3px 8px", borderRadius: 6 }}>{g.crowd}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}