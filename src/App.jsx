import { useState, useEffect, useRef, useCallback } from "react";

const mono = "'Space Mono', monospace";
const serif = "'Playfair Display', serif";

/* ── Snowfall ─────────────────────────────────────────────────────────────── */
function Snowfall() {
  const canvasRef = useRef(null);
  const flakes = useRef([]);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    flakes.current = Array.from({ length: 130 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 2.4 + 0.5, speed: Math.random() * 0.6 + 0.18,
      drift: (Math.random() - 0.5) * 0.28, opacity: Math.random() * 0.45 + 0.12,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.current.forEach((f) => {
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`; ctx.fill();
        f.y += f.speed; f.x += f.drift;
        if (f.y > canvas.height + 4) { f.y = -4; f.x = Math.random() * canvas.width; }
        if (f.x > canvas.width + 4) f.x = -4;
        if (f.x < -4) f.x = canvas.width + 4;
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(rafRef.current); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

/* ── Music Player ─────────────────────────────────────────────────────────── */
function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const progressRef = useRef(null);

  // Autoplay on mount
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    audio.loop = true;
    const tryPlay = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };
    // Try immediately, then on first user interaction
    tryPlay();
    const onInteract = () => { tryPlay(); document.removeEventListener("click", onInteract); document.removeEventListener("keydown", onInteract); };
    document.addEventListener("click", onInteract);
    document.addEventListener("keydown", onInteract);
    return () => { document.removeEventListener("click", onInteract); document.removeEventListener("keydown", onInteract); };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => { if (!dragging) setProgress(audio.currentTime); };
    const onLoaded = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => { audio.removeEventListener("timeupdate", onTimeUpdate); audio.removeEventListener("loadedmetadata", onLoaded); };
  }, [dragging]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const toggleMute = () => {
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    audioRef.current.volume = v;
    if (v === 0) setMuted(true);
    else setMuted(false);
  };

  const seek = useCallback((e) => {
    const bar = progressRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  }, [duration]);

  const skipForward = () => { audioRef.current.currentTime = Math.min(duration, progress + 10); };
  const skipBack = () => { audioRef.current.currentTime = Math.max(0, progress - 10); };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} src="/In_Da_Party.mp3" loop preload="auto" />
      <div
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 50,
          background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.15)",
          width: expanded ? 280 : 52, height: expanded ? "auto" : 52,
          borderRadius: 4, overflow: "hidden",
          transition: "width 0.3s ease, height 0.3s ease",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Collapsed pill */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            title="Open player"
            style={{ width: 52, height: 52, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {/* Music note SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </button>
        )}

        {/* Expanded player */}
        {expanded && (
          <div style={{ padding: "16px" }}>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontFamily: mono, fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                now playing
              </span>
              <button onClick={() => setExpanded(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontFamily: mono, fontSize: "0.9rem", lineHeight: 1, padding: 0 }}>
                x
              </button>
            </div>

            {/* Cover art */}
            <div style={{ width: "100%", aspectRatio: "1", background: "#111", marginBottom: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              <img src="/cover.jpg" alt="Album cover" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(100%)" }} />
            </div>

            {/* Track info */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: serif, fontSize: "0.95rem", fontWeight: 700, color: "white", margin: "0 0 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                In Da Party
              </p>
              <p style={{ fontFamily: mono, fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", margin: 0, letterSpacing: "0.1em" }}>
                smokedope2016
              </p>
            </div>

            {/* Progress bar */}
            <div
              ref={progressRef}
              onClick={seek}
              onMouseDown={() => setDragging(true)}
              onMouseUp={(e) => { setDragging(false); seek(e); }}
              onMouseMove={(e) => { if (dragging) seek(e); }}
              style={{ position: "relative", height: 3, background: "rgba(255,255,255,0.12)", cursor: "pointer", marginBottom: 6, borderRadius: 2 }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: "white", borderRadius: 2, transition: dragging ? "none" : "width 0.1s linear" }} />
            </div>

            {/* Time */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontFamily: mono, fontSize: "0.55rem", color: "rgba(255,255,255,0.35)" }}>{fmt(progress)}</span>
              <span style={{ fontFamily: mono, fontSize: "0.55rem", color: "rgba(255,255,255,0.35)" }}>{fmt(duration)}</span>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 16 }}>
              {/* Skip back */}
              <button onClick={skipBack} style={btnStyle} title="-10s">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>

              {/* Play/pause */}
              <button onClick={togglePlay} style={{ ...btnStyle, width: 38, height: 38, border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", color: "white" }}>
                {playing
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                }
              </button>

              {/* Skip forward */}
              <button onClick={skipForward} style={btnStyle} title="+10s">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            </div>

            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={toggleMute} style={{ ...btnStyle, flexShrink: 0 }}>
                {muted || volume === 0
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                  : volume < 0.5
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                }
              </button>
              <input
                type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume}
                onChange={handleVolume}
                style={{ flex: 1, accentColor: "white", height: 2, cursor: "pointer" }}
              />
            </div>

            {/* Loop indicator */}
            <div style={{ marginTop: 10, textAlign: "center", fontFamily: mono, fontSize: "0.52rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
              looping
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const btnStyle = {
  background: "none", border: "none", color: "rgba(255,255,255,0.6)",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  padding: 4, transition: "color 0.15s",
};

/* ── SVG Diagrams ─────────────────────────────────────────────────────────── */
function FlowDiagram() {
  const steps = [
    { label: "/orders runs", sub: "server sends chest packet" },
    { label: "Screen detected", sub: "ScreenEvents.AFTER_INIT" },
    { label: "Slots scanned", sub: "ItemStack lore parsed" },
    { label: "Watch list check", sub: "price >= minimum?" },
    { label: "Alert fires", sub: "chat / toast / Discord" },
  ];
  const W = 560, boxW = 90, boxH = 40, gap = (W - boxW) / (steps.length - 1);
  return (
    <svg viewBox={`0 0 ${W} 90`} style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto" }}>
      {steps.map((s, i) => {
        const cx = i * gap + boxW / 2;
        return (
          <g key={i}>
            {i < steps.length - 1 && <line x1={cx + boxW / 2 + 2} y1={boxH / 2} x2={cx + gap - boxW / 2 - 2} y2={boxH / 2} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 3" />}
            <rect x={cx - boxW / 2} y={0} width={boxW} height={boxH} rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
            <text x={cx} y={14} textAnchor="middle" fill="white" fontSize="8" fontFamily={mono} fontWeight="700">{s.label}</text>
            <text x={cx} y={27} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="6.5" fontFamily={mono}>{s.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}

function WatchListDiagram() {
  const items = [
    { name: "Spruce Log", min: "$60" },
    { name: "Oak Log", min: "$50" },
    { name: "Iron Ingot", min: "$120" },
    { name: "Diamond", min: "$900" },
  ];
  const W = 520, rowH = 28, headerH = 30;
  const H = headerH + rowH * items.length + 16;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto" }}>
      <rect x={0} y={0} width={W} height={H} rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <rect x={0} y={0} width={W} height={headerH} rx="3" fill="rgba(255,255,255,0.07)" />
      {["Item", "Min Price", "Status"].map((h, i) => (
        <text key={i} x={[14, 200, 320][i]} y={19} fill="rgba(255,255,255,0.5)" fontSize="7.5" fontFamily={mono} fontWeight="700" letterSpacing="2">{h.toUpperCase()}</text>
      ))}
      {items.map((item, i) => {
        const y = headerH + i * rowH;
        return (
          <g key={i}>
            <line x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={14} y={y + 17} fill="rgba(255,255,255,0.8)" fontSize="8" fontFamily={mono}>{item.name}</text>
            <text x={200} y={y + 17} fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily={mono}>{item.min}</text>
            <rect x={320} y={y + 6} width={60} height={14} rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <text x={350} y={y + 16} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="6.5" fontFamily={mono}>WATCHING</text>
          </g>
        );
      })}
    </svg>
  );
}

function AutomationDiagram() {
  const nodes = [
    { label: "Order found", x: 70, y: 20 },
    { label: "Price check", x: 200, y: 20 },
    { label: "Auto-buy", x: 330, y: 20 },
    { label: "Auto-sell", x: 460, y: 20 },
    { label: "Profit logged", x: 330, y: 75 },
  ];
  const edges = [[0,1],[1,2],[2,3],[2,4]];
  return (
    <svg viewBox="0 0 540 110" style={{ width: "100%", maxWidth: 540, display: "block", margin: "0 auto" }}>
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.3)" />
        </marker>
      </defs>
      {edges.map(([a, b], i) => {
        const na = nodes[a], nb = nodes[b];
        return <line key={i} x1={na.x + 50} y1={na.y + 16} x2={nb.x - 2} y2={nb.y + 16} stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#arr)" />;
      })}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x - 52} y={n.y} width={100} height={32} rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x={n.x - 2} y={n.y + 20} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="8" fontFamily={mono} fontWeight="700">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

function DiscordDiagram() {
  const W = 520, H = 118;
  const fields = [{ name: "Price", val: "$80/each" }, { name: "Remaining", val: "10,000" }, { name: "Max Payout", val: "$800,000" }];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto" }}>
      <rect x={0} y={0} width={W} height={H} rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <rect x={0} y={0} width={3} height={H} rx="2" fill="rgba(255,255,255,0.4)" />
      <text x={18} y={22} fill="white" fontSize="9.5" fontFamily={mono} fontWeight="700">Order Alert -- Spruce Logs</text>
      <line x1={18} y1={30} x2={W - 18} y2={30} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {fields.map((f, i) => (
        <g key={i}>
          <text x={18 + i * 160} y={48} fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily={mono} fontWeight="700" letterSpacing="1.5">{f.name.toUpperCase()}</text>
          <text x={18 + i * 160} y={64} fill="rgba(255,255,255,0.85)" fontSize="9" fontFamily={mono}>{f.val}</text>
        </g>
      ))}
      <line x1={18} y1={76} x2={W - 18} y2={76} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x={18} y={92} fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily={mono}>DonutSMP Orders  |  LarpBot  |  2 seconds ago</text>
    </svg>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */
function Section({ heading, body, diagram: Diagram }) {
  return (
    <div style={{ marginBottom: 36 }}>
      {heading && <h4 style={{ fontFamily: mono, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: "0 0 8px 0" }}>{heading}</h4>}
      <p style={{ fontFamily: mono, fontSize: "0.78rem", lineHeight: 1.85, color: "rgba(255,255,255,0.68)", margin: "0 0 18px 0" }}>{body}</p>
      {Diagram && <div style={{ padding: "18px 0 4px 0" }}><Diagram /></div>}
    </div>
  );
}

/* ── Project Detail Modal ─────────────────────────────────────────────────── */
function ProjectDetail({ project, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", backdropFilter: "blur(5px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.18)", maxWidth: 700, width: "100%", maxHeight: "82vh", overflowY: "auto", padding: "48px 48px 52px", position: "relative", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.12) transparent" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 22, background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: "1.1rem", cursor: "pointer", fontFamily: mono }}>x</button>
        <p style={{ fontFamily: mono, fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 10px 0" }}>{project.tag}</p>
        <h2 style={{ fontFamily: serif, fontSize: "2.2rem", fontWeight: 900, color: "white", margin: "0 0 36px 0" }}>{project.name}</h2>
        {project.sections.map((s, i) => <Section key={i} heading={s.heading} body={s.body} diagram={s.diagram} />)}
        {project.tags && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32 }}>
            {project.tags.map((t) => <span key={t} style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.18)", padding: "4px 12px", color: "rgba(255,255,255,0.45)" }}>{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Project Card ─────────────────────────────────────────────────────────── */
function ProjectCard({ project, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => onClick(project)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border: `1px solid ${hov ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.16)"}`, padding: "32px 36px", cursor: "pointer", background: hov ? "rgba(255,255,255,0.04)" : "transparent", transition: "border-color 0.2s, background 0.2s, transform 0.2s", transform: hov ? "translateY(-3px)" : "translateY(0)", position: "relative", maxWidth: 480, width: "100%" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: hov ? "100%" : "0%", height: "1px", background: "white", transition: "width 0.35s ease" }} />
      <p style={{ fontFamily: mono, fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", margin: "0 0 10px 0" }}>{project.tag}</p>
      <h3 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 700, color: "white", margin: "0 0 10px 0" }}>{project.name}</h3>
      <p style={{ fontFamily: mono, fontSize: "0.78rem", lineHeight: 1.65, color: "rgba(255,255,255,0.52)", margin: 0 }}>{project.blurb}</p>
      <div style={{ marginTop: 20, fontFamily: mono, fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: hov ? "white" : "rgba(255,255,255,0.3)", transition: "color 0.2s" }}>Read more +</div>
    </div>
  );
}

/* ── Data ─────────────────────────────────────────────────────────────────── */
const PROJECTS = [
  {
    name: "LarpBot",
    tag: "Fabric Minecraft Mod",
    blurb: "A DonutSMP order flipping bot",
    sections: [
      { heading: "What it is", body: "LarpBot is a client-side Fabric mod for DonutSMP that watches the server's /orders chest GUI in real time and fires instant alerts via in-game chat, toast notifications, sound, and Discord webhooks the moment a buy order hits your minimum price per item. It tracks as many items as you want simultaneously and fully automates the entire sell and reorder process so you never miss a profitable flip.", diagram: FlowDiagram },
      { heading: "How it works", body: "DonutSMP's /orders command opens a virtual chest via standard OpenScreenS2CPacket and InventoryS2CPacket packets. LarpBot hooks into Fabric's ScreenEvents.AFTER_INIT, confirms the title matches the orders pattern, and reads each slot's ItemStack lore and custom name using the 1.21 DataComponentTypes API. No server-side access is needed. It is purely observational, exactly like reading the screen yourself." },
      { heading: "Multi-item watch list", body: "LarpBot is item-centric rather than using a single global payout threshold. You build a watch list with as many items as you need, each with its own minimum price, all managed from an in-game GUI opened with a keybind. A configurable cooldown (default 60 seconds) prevents duplicate alerts for the same item and price combo.", diagram: WatchListDiagram },
      { heading: "Full automation", body: "Beyond alerting, LarpBot can fully automate the selling and ordering cycle. When a watched item clears your price threshold, the mod triggers the buy action, queues a resell order, and logs the profit to your configured Discord channel without any manual input. The entire flip loop runs hands-free.", diagram: AutomationDiagram },
      { heading: "Discord integration", body: "Every alert posts a rich embed to your webhook showing the item name, price per unit, remaining quantity, and total max payout. The virtual-chest desync issue where the server thinks your GUI is still open and blocks a new /orders request is resolved by sending a CloseHandledScreenC2SPacket on screen close via the ScreenEvents.remove hook, with no mixin required.", diagram: DiscordDiagram },
      { heading: "Tech stack", body: "Java 21, Fabric Loader, Fabric API, Gson for config. The larpflip.json file persists your full watch list, Discord webhook URL, notification toggles, cooldown duration, rescan interval, and debug mode toggle." },
    ],
    tags: ["Java", "Fabric", "Minecraft", "Discord", "DonutSMP"],
  },
];

/* ── Nav Icons ────────────────────────────────────────────────────────────── */
function FolderIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="2" y="14" width="44" height="30" rx="3" stroke="white" strokeWidth="2.2" />
      <path d="M2 20h44" stroke="white" strokeWidth="2.2" />
      <path d="M2 17V10a3 3 0 013-3h12l4 7H2z" stroke="white" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

function NavIcon({ icon: Icon, label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}>
      <div style={{ width: 32, height: 32, opacity: hov ? 1 : 0.5, transform: hov ? "scale(1.14)" : "scale(1)", transition: "opacity 0.2s, transform 0.2s", filter: hov ? "drop-shadow(0 0 8px rgba(255,255,255,0.4))" : "none" }}>
        <Icon />
      </div>
      <span style={{ fontFamily: mono, fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "white", opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(-4px)", transition: "opacity 0.18s, transform 0.18s", whiteSpace: "nowrap", userSelect: "none" }}>
        {label}
      </span>
    </div>
  );
}

/* ── Pages ────────────────────────────────────────────────────────────────── */
function HomePage({ onNav }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
      <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(18px)", transition: "opacity 0.9s ease, transform 0.9s ease", textAlign: "center", marginBottom: 64 }}>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(4rem, 14vw, 10rem)", fontWeight: 900, color: "white", letterSpacing: "-0.02em", lineHeight: 1, margin: 0, userSelect: "none" }}>demire</h1>
        <div style={{ marginTop: 16, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }} />
        <p style={{ fontFamily: mono, fontSize: "0.7rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.32)", margin: "14px 0 0 0" }}>larp king</p>
      </div>
      <div style={{ display: "flex", gap: 48, marginTop: -32, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s" }}>
        <NavIcon icon={FolderIcon} label="Projects" onClick={() => onNav("projects")} />
      </div>
    </div>
  );
}

function ProjectsPage({ onNav }) {
  const [selected, setSelected] = useState(null);
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 60); }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "80px clamp(24px, 8vw, 120px)", position: "relative", zIndex: 1 }}>
      <button onClick={() => onNav("home")}
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.38)", fontFamily: mono, fontSize: "0.67rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", padding: 0, marginBottom: 64, alignSelf: "flex-start", transition: "color 0.15s" }}
        onMouseEnter={(e) => (e.target.style.color = "white")}
        onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.38)")}>
        back to demire
      </button>
      <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
        <h2 style={{ fontFamily: serif, fontSize: "clamp(2.4rem, 6vw, 4.5rem)", fontWeight: 900, color: "white", margin: "0 0 8px 0", letterSpacing: "-0.01em" }}>Projects</h2>
        <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.28)", marginBottom: 48 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          {PROJECTS.map((p) => <ProjectCard key={p.name} project={p} onClick={setSelected} />)}
        </div>
      </div>
      {selected && <ProjectDetail project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ── App ──────────────────────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("home");
  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "white", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <Snowfall />
      <MusicPlayer />
      {page === "home" && <HomePage onNav={setPage} />}
      {page === "projects" && <ProjectsPage onNav={setPage} />}
    </div>
  );
}
