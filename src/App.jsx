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
  matches: [
    { teams: "FIFA World Cup Final", date: "Jul 19, 2026", status: "SCHEDULED" },
  ],
  transit: [
    { name: "NJ Transit — Meadowlands Rail Line", freq: "Runs from Secaucus Junction", status: "AVAILABLE" },
    { name: "FIFA Shuttle Service", freq: "From Midtown Manhattan & Newark", status: "AVAILABLE" },
  ],
};

const SUGGESTIONS_EN = [
  { label: "How do I get to my seat?" },
  { label: "Is there a wheelchair-friendly route?" },
  { label: "Where can I grab food nearby?" },
];

const SUGGESTIONS_HI = [
  { label: "Mera seat kahan hai?" },
  { label: "Wheelchair wala route hai kya?" },
  { label: "Khana kahan milega paas mein?" },
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
    green: "#4ADE80", red: "#D64545", pitch: "#1A2E22", board: "#0D1B2A",
  },
  light: {
    bg: "#F4F1E8", sidebar: "#FFFFFF", card: "#ECE7D9", border: "#D8D2BF",
    text: "#1F2937", subtext: "#6B6555", accent: "#C9922A", accentText: "#2A1A00",
    green: "#1E8449", red: "#C0392B", pitch: "#DCEFE0", board: "#ECE7D9",
  },
};

const MONO = "'Courier New', ui-monospace, monospace";

function crowdLabel(crowd) {
  if (crowd === "High") return "FULL";
  if (crowd === "Medium") return "BUSY";
  return "OPEN";
}

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
  { id: "assistant", code: "AI", title: "AI Assistant", desc: "Real-time chat & matchday help" },
  { id: "navigation", code: "NAV", title: "Smart Navigation", desc: "Gate map & accessible routes" },
  { id: "emergency", code: "SOS", title: "Emergency Center", desc: "One-tap SOS & medical help" },
  { id: "accessibility", code: "ACC", title: "Accessibility Hub", desc: "Step-free routes & support" },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(null);
  const [showFacts, setShowFacts] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [weather, setWeather] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const bubbleScrollRef = useRef(null);
  const factsRef = useRef(null);
  const c = THEMES[theme];

  useEffect(() => {
    bubbleScrollRef.current?.scrollTo({ top: bubbleScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, chatOpen]);

  useEffect(() => {
    if (showFacts && factsRef.current) {
      factsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showFacts]);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=40.8135&longitude=-74.0745&current_weather=true")
      .then((res) => res.json())
      .then((data) => setWeather(data.current_weather))
      .catch(() => setWeather(null));
  }, []);

  function startChat(lang) {
    setLanguage(lang);
    const welcome = lang === "en"
      ? "Welcome. I'm GateGuide, your matchday assistant. Ask me about gates, accessibility, food, or emergency help."
      : "Namaste! Main GateGuide hoon, tumhara matchday assistant. Gate, accessibility, food ya emergency help ke baare mein poochho.";
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
    setNavOpen(false);
    if (id === "navigation") {
      setShowFacts(true);
      setTimeout(() => factsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      return;
    }
    setChatOpen(true);
    if (id === "emergency") {
      sendMessage(language === "en" ? "EMERGENCY - I need urgent help right now!" : "EMERGENCY - mujhe abhi urgent help chahiye!");
    } else if (id === "accessibility") {
      sendMessage(language === "en" ? "Tell me about accessibility options here" : "Accessibility options kya hain yahan?");
    }
  }

  if (!language) {
    return (
      <div style={{ maxWidth: 460, margin: "40px auto", background: c.bg, borderRadius: 20, padding: 40, textAlign: "center", color: c.text, fontFamily: "'Inter', sans-serif" }}>
        <h2 style={{ marginBottom: 6, color: c.text, letterSpacing: 1 }}>GATEGUIDE</h2>
        <p style={{ color: c.subtext, marginBottom: 24 }}>Choose your language to begin</p>
        <button onClick={() => startChat("en")} style={{ display: "block", width: "100%", marginBottom: 12, padding: 12, borderRadius: 10, background: c.accent, color: c.accentText, border: "none", fontWeight: 700, cursor: "pointer" }}>
          Continue in English
        </button>
        <button onClick={() => startChat("hi")} style={{ display: "block", width: "100%", padding: 12, borderRadius: 10, background: c.card, color: c.text, border: `1px solid ${c.border}`, fontWeight: 700, cursor: "pointer" }}>
          Hinglish mein baat karo
        </button>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ marginTop: 16, background: "transparent", border: "none", color: c.subtext, fontSize: 12, cursor: "pointer" }}>
          {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
        </button>
      </div>
    );
  }

  const navItems = [
    { code: "H", label: "Home", onClick: () => { setChatOpen(false); setNavOpen(false); } },
    { code: "AI", label: "AI Assistant", onClick: () => { setChatOpen(true); setNavOpen(false); } },
    { code: "NAV", label: "Navigation", onClick: () => openConsole("navigation") },
    { code: "SOS", label: "Emergency", onClick: () => openConsole("emergency") },
    { code: "ACC", label: "Accessibility", onClick: () => openConsole("accessibility") },
  ];

  return (
    <div className="gg-shell" style={{ maxWidth: 1140, margin: "30px auto", background: c.bg, borderRadius: 20, overflow: "hidden", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
        }
        .gg-console-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .gg-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
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
        .flip-row {
          font-family: ${MONO};
          letter-spacing: 0.5px;
        }
        .gg-shell {
          display: flex;
          width: 100%;
          height: 680px;
        }
        .gg-sidebar {
          width: 210px;
          flex-shrink: 0;
          overflow-y: auto;
        }
        .gg-right {
          width: 240px;
          flex-shrink: 0;
          overflow-y: auto;
        }
        .gg-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
        }
        .gg-mobile-topbar { display: none; }
        .gg-backdrop { display: none; }
        .gg-nav-toggle { display: none; }

        @media (max-width: 860px) {
          .gg-shell {
            flex-direction: column;
            height: auto;
            max-height: none;
            overflow: visible;
            overflow-x: hidden;
            margin: 0;
            border-radius: 0;
            max-width: 100%;
          }
          .gg-mobile-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 12px 16px;
            background: ${c.sidebar};
            border-bottom: 1px solid ${c.border};
            position: sticky;
            top: 0;
            z-index: 60;
          }
          .gg-nav-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: ${c.card};
            border: 1px solid ${c.border};
            color: ${c.text};
            font-size: 16px;
            cursor: pointer;
          }
          .gg-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            width: 80%;
            max-width: 300px;
            transform: translateX(-105%);
            transition: transform 0.25s ease;
            z-index: 200;
            box-shadow: 4px 0 24px rgba(0,0,0,0.4);
          }
          .gg-sidebar.open {
            transform: translateX(0);
          }
          .gg-backdrop.open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            z-index: 150;
          }
          .gg-main, .gg-right {
            width: 100%;
            overflow-y: visible;
          }
          .gg-main {
            padding: 20px 16px !important;
          }
          .gg-right {
            padding: 20px 16px 110px !important;
            border-left: none !important;
            border-top: 1px solid ${c.border};
          }
          .gg-console-grid, .gg-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className={`gg-mobile-topbar`}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="gg-nav-toggle" onClick={() => setNavOpen(true)} aria-label="Open navigation">☰</button>
          <span style={{ color: c.text, fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>GATEGUIDE</span>
        </div>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ background: "transparent", border: `1px solid ${c.border}`, color: c.subtext, borderRadius: 8, padding: "5px 9px", fontSize: 11, cursor: "pointer" }}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>

      <div className={`gg-backdrop ${navOpen ? "open" : ""}`} onClick={() => setNavOpen(false)} />

      <div className={`gg-sidebar ${navOpen ? "open" : ""}`} style={{ background: c.sidebar, borderRight: `1px solid ${c.border}`, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: c.text, fontWeight: 800, fontSize: 16, letterSpacing: 1 }}>GATEGUIDE</div>
          <button className="gg-nav-toggle" onClick={() => setNavOpen(false)} aria-label="Close navigation" style={{ display: navOpen ? "inline-flex" : undefined }}>✕</button>
        </div>
        <div style={{ color: c.subtext, fontSize: 11, fontFamily: MONO, letterSpacing: 1 }}>OPERATIONS PORTAL</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          {navItems.map((n, i) => (
            <div key={i} onClick={n.onClick} style={{
              display: "flex", alignItems: "center", gap: 10,
              color: c.subtext, fontSize: 13, fontWeight: 500, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
            }}>
              <span style={{ width: 30, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: c.card, fontSize: 10, fontWeight: 800, color: c.accent, fontFamily: MONO }}>
                {n.code}
              </span>
              {n.label}
            </div>
          ))}
        </div>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ background: "transparent", border: `1px solid ${c.border}`, color: c.subtext, borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <div className="gg-main" style={{ padding: 30 }}>
        <div style={{ color: c.text, fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Welcome back</div>
        <div style={{ color: c.subtext, fontSize: 13, marginBottom: 24 }}>Choose a console to get started</div>

        <div className="gg-console-grid">
          {CONSOLES.map((cs) => (
            <div key={cs.id} onClick={() => openConsole(cs.id)} className="console-card" style={{
              background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20, cursor: "pointer",
            }}>
              <div style={{ display: "inline-block", background: c.board, color: c.accent, fontFamily: MONO, fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 6, marginBottom: 10, letterSpacing: 1 }}>
                {cs.code}
              </div>
              <div style={{ color: c.text, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{cs.title}</div>
              <div style={{ color: c.subtext, fontSize: 12 }}>{cs.desc}</div>
              <div style={{ color: c.accent, fontSize: 12, marginTop: 12, fontWeight: 700 }}>Enter Console →</div>
            </div>
          ))}
        </div>

        {showFacts && (
          <div ref={factsRef} style={{ background: c.board, borderRadius: 10, padding: 14, marginBottom: 20, border: `1px solid ${c.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ color: c.text, fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>GATE STATUS</div>
              <button onClick={() => setShowFacts(false)} style={{ background: "transparent", border: "none", color: c.subtext, cursor: "pointer", fontSize: 13 }}>✕</button>
            </div>
            {STADIUM_DATA.gates.map((g, i) => (
              <div key={i} className="flip-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", fontSize: 11, borderBottom: i < STADIUM_DATA.gates.length - 1 ? `1px solid ${c.border}` : "none" }}>
                <span style={{ color: c.subtext }}>{g.id.toUpperCase()} — {g.section}</span>
                <span style={{ color: g.crowd === "High" ? c.red : g.crowd === "Medium" ? c.accent : c.green, fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", marginLeft: 8 }}>
                  {crowdLabel(g.crowd)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="gg-info-grid">
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ color: c.text, fontWeight: 700, fontSize: 12, marginBottom: 10, letterSpacing: 1 }}>UPCOMING MATCHES</div>
            {STADIUM_DATA.matches.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < STADIUM_DATA.matches.length - 1 ? `1px solid ${c.border}` : "none" }}>
                <div>
                  <div style={{ color: c.text, fontSize: 12.5, fontWeight: 600 }}>{m.teams}</div>
                  <div style={{ color: c.subtext, fontSize: 11 }}>{m.date}</div>
                </div>
                <span style={{ color: c.green, fontSize: 10, fontFamily: MONO, fontWeight: 700, letterSpacing: 0.5 }}>{m.status}</span>
              </div>
            ))}
          </div>
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ color: c.text, fontWeight: 700, fontSize: 12, marginBottom: 10, letterSpacing: 1 }}>TRANSIT OPTIONS</div>
            {STADIUM_DATA.transit.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < STADIUM_DATA.transit.length - 1 ? `1px solid ${c.border}` : "none" }}>
                <div>
                  <div style={{ color: c.text, fontSize: 12.5, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ color: c.subtext, fontSize: 11 }}>{t.freq}</div>
                </div>
                <span style={{ color: c.green, fontSize: 10, fontFamily: MONO, fontWeight: 700, letterSpacing: 0.5 }}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gg-right" style={{ background: c.sidebar, borderLeft: `1px solid ${c.border}`, padding: "20px 20px 90px" }}>
        <div style={{ background: c.board, borderRadius: 8, padding: 12, marginBottom: 14, border: `1px solid ${c.border}` }}>
          <div style={{ color: c.subtext, fontSize: 10, fontFamily: MONO, letterSpacing: 1 }}>LIVE WEATHER — METLIFE</div>
          {weather ? (
            <div style={{ color: c.accent, fontSize: 20, fontWeight: 800, fontFamily: MONO }}>{Math.round(weather.temperature * 9 / 5 + 32)}°F</div>
          ) : (
            <div style={{ color: c.subtext, fontSize: 20, fontWeight: 800, fontFamily: MONO, opacity: 0.4 }}>—°F</div>
          )}
        </div>

        <div style={{ color: c.text, fontWeight: 700, fontSize: 13, marginBottom: 10, letterSpacing: 1 }}>STADIUM MAP</div>
        <StadiumMap c={c} gateData={STADIUM_DATA.gates} />

        <div style={{ color: c.text, fontWeight: 700, fontSize: 13, margin: "18px 0 10px", letterSpacing: 1 }}>LIVE STATUS</div>
        <div style={{ background: c.board, borderRadius: 8, padding: "10px 12px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, border: `1px solid ${c.border}` }}>
          <span style={{ color: c.subtext, fontSize: 10, letterSpacing: 1 }}>GATES ACTIVE</span>
          <span style={{ color: c.accent, fontSize: 16, fontWeight: 800 }}>4/4</span>
        </div>
        <div style={{ background: c.board, borderRadius: 8, padding: "10px 12px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, border: `1px solid ${c.border}` }}>
          <span style={{ color: c.subtext, fontSize: 10, letterSpacing: 1 }}>ACCESSIBLE</span>
          <span style={{ color: c.green, fontSize: 16, fontWeight: 800 }}>3 READY</span>
        </div>
        <div style={{ background: c.board, borderRadius: 8, padding: "10px 12px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, border: `1px solid ${c.border}` }}>
          <span style={{ color: c.subtext, fontSize: 10, letterSpacing: 1 }}>MEDICAL</span>
          <span style={{ color: c.text, fontSize: 16, fontWeight: 800 }}>2 STAFFED</span>
        </div>

        <div style={{ color: c.text, fontWeight: 700, fontSize: 13, marginBottom: 8, letterSpacing: 1 }}>GATE STATUS</div>
        <div style={{ background: c.board, borderRadius: 8, border: `1px solid ${c.border}`, overflow: "hidden" }}>
          {STADIUM_DATA.gates.map((g, i) => {
            const crowdColor = g.crowd === "High" ? c.red : g.crowd === "Medium" ? c.accent : c.green;
            return (
              <div key={i} className="flip-row" style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 12px",
                borderBottom: i < STADIUM_DATA.gates.length - 1 ? `1px solid ${c.border}` : "none",
              }}>
                <span style={{ color: c.subtext, fontSize: 11 }}>{g.id.toUpperCase()}</span>
                <span style={{ color: crowdColor, fontWeight: 800, fontSize: 16, whiteSpace: "nowrap" }}>{crowdLabel(g.crowd)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {chatOpen && (
        <div style={{
          position: "fixed", bottom: 80, right: 20, width: 320, maxWidth: "90vw", height: 420,
          background: c.sidebar, border: `1px solid ${c.border}`, borderRadius: 16,
          display: "flex", flexDirection: "column", boxShadow: "0 8px 30px rgba(0,0,0,0.4)", zIndex: 100,
        }}>
          <div style={{ padding: 12, background: c.card, color: c.text, fontWeight: 700, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "16px 16px 0 0" }}>
            GateGuide Assistant
            <button onClick={() => setChatOpen(false)} style={{ background: "transparent", border: "none", color: c.subtext, cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          <div ref={bubbleScrollRef} style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? c.accent : c.card,
                color: m.role === "user" ? c.accentText : c.text,
                padding: "8px 10px", borderRadius: 10, maxWidth: "85%", fontSize: 12.5,
              }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{ color: c.subtext, fontSize: 12 }}>typing…</div>}
          </div>
          <div style={{ display: "flex", gap: 6, padding: "0 10px 8px", flexWrap: "wrap" }}>
            <button onClick={() => sendMessage(language === "en" ? "EMERGENCY - I need urgent help right now!" : "EMERGENCY - mujhe abhi urgent help chahiye!")} style={{ background: c.red, color: "#fff", border: "none", borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              SOS
            </button>
            {(language === "en" ? SUGGESTIONS_EN : SUGGESTIONS_HI).slice(0, 2).map((s, i) => (
              <button key={i} onClick={() => sendMessage(s.label)} style={{ background: c.card, color: c.text, border: `1px solid ${c.border}`, borderRadius: 8, padding: "5px 8px", fontSize: 11, cursor: "pointer" }}>
                {s.label}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} style={{ display: "flex", gap: 6, padding: 10, borderTop: `1px solid ${c.border}` }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={language === "en" ? "Type your message…" : "Type karo…"} style={{ flex: 1, background: c.card, color: c.text, border: `1px solid ${c.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }} />
            <button type="submit" style={{ background: c.accent, color: c.accentText, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>➤</button>
          </form>
        </div>
      )}

      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed", bottom: 20, right: 20, padding: "12px 18px", borderRadius: 26,
          background: c.accent, color: c.accentText, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)", zIndex: 101,
        }}
      >
        Chat
      </button>
    </div>
  );
}