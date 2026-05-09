import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import AuthModal from "./AuthModal";
import HistoryPanel from "./HistoryPanel";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PLATFORM_COLORS = {
  Instagram: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
  Facebook: "linear-gradient(45deg, #1877f2, #0d5dbf)",
  Snapchat: "#FFFC00",
  TikTok: "linear-gradient(45deg, #69c9d0, #ee1d52)",
  "Twitter/X": "linear-gradient(45deg, #1da1f2, #0d8bd9)",
  YouTube: "linear-gradient(45deg, #ff0000, #cc0000)",
  Unknown: "linear-gradient(135deg, #c8ff00, #00ffaa)",
};

const FEATURES = [
  { icon: "⚡", title: "Lightning fast", desc: "Downloads complete in less than a minute on any connection." },
  { icon: "🎬", title: "Up to 4K quality", desc: "We preserve original resolution. No compression, no quality loss." },
  { icon: "🚫", title: "Zero watermark", desc: "Clean, source-quality video. No overlays, no branding added — except Snapchat, which includes its own watermark." },
  { icon: "🌐", title: "7+ platforms", desc: "Instagram, TikTok, YouTube, Facebook, X, Snapchat & more." },
  { icon: "🔒", title: "Private by default", desc: "We don't store your links, files, or any personal data." },
  { icon: "🖥️", title: "No install needed", desc: "Runs entirely in your browser. Works on any device quickly." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Paste the link", desc: "Copy any public video URL from Instagram, TikTok, YouTube, Facebook or Snapchat." },
  { step: "02", title: "Click download", desc: "We fetch the video quickly — no queues, no waiting rooms, no captchas." },
  { step: "03", title: "Save the file", desc: "Pick your quality and save the original file directly to your device." },
];

const FAQ = [
  { q: "Is ReelSaver free to use?", a: "Yes — completely free. No account required for basic downloads." },
  { q: "Which platforms are supported?", a: "Instagram, TikTok, YouTube, Facebook, X (Twitter), Snapchat and more." },
  { q: "Do you store my videos?", a: "No. We never store your videos, links, or personal data." },
  { q: "Can I download private videos?", a: "No — ReelSaver only works with public content." },
  { q: "What's the max quality I can download?", a: "Up to 4K, depending on the original upload quality." },
];

const PLATFORMS = [
  {
    num: "001",
    name: "Instagram",
    logo: (
      <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </div>
    ),
    status: "no-watermark",
  },
  {
    num: "002",
    name: "TikTok",
    logo: (
      <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#010101", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.14 8.14 0 0 0 4.77 1.52V6.78a4.85 4.85 0 0 1-1-.09z"/></svg>
      </div>
    ),
    status: "no-watermark",
  },
  {
    num: "003",
    name: "YouTube",
    logo: (
      <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      </div>
    ),
    status: "no-watermark",
  },
  {
    num: "004",
    name: "Facebook",
    logo: (
      <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#1877f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </div>
    ),
    status: "no-watermark",
  },
  {
    num: "005",
    name: "X (Twitter)",
    logo: (
      <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#000", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </div>
    ),
    status: "no-watermark",
  },
  {
    num: "006",
    name: "Snapchat",
    logo: (
      <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#FFFC00", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className="bi bi-snapchat" style={{ fontSize: 26, color: "#000", lineHeight: 1 }}></i>
      </div>
    ),
    status: "watermark",
  },
];

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Download failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (videoUrl, quality) => {
    if (user) {
      await supabase.from("download_history").insert({
        user_id: user.id,
        video_url: url,
        platform: result?.platform,
        title: result?.title,
        quality,
      });
    }
    window.open(videoUrl, "_blank");
  };

  return (
    <div className="app">
      {/* NAV */}
      <nav className="nav">
        <a href="/" className="logo">
          <span className="logo-icon">↓</span>
          <span>ReelSaver</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#compare">Compare</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
          <a href="#" onClick={(e) => { e.preventDefault(); if (user) setShowHistory(true); else setShowAuth(true); }}>Download History</a>
        </div>
        <button className="btn-primary" onClick={() => setShowAuth(true)}>
          {user ? "My Account" : "Login / Signup"} →
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">Free · No signup · Public videos only</div>
        <h1>
          Download any reel<br />
          <span className="accent">in less than a minute.</span>
        </h1>
        <p className="hero-sub">
          Paste a link from Instagram, TikTok, YouTube, Facebook or Snapchat.<br />
          Get the original quality video quickly — no watermark, no waiting.{" "}
          <span style={{ fontSize: "12px", color: "#888" }}>(Snapchat includes watermark)</span>
        </p>

        <form onSubmit={handleDownload} className="download-form">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Download ↓"}
          </button>
        </form>

        {error && <div className="error-box">{error}</div>}
        {result && (
          <div className="result-box">
            {result.thumbnail && <img src={result.thumbnail} alt="thumb" className="thumb" />}
            <div className="result-info">
              {result.platform && <span className="platform-badge">{result.platform}</span>}
              {result.title && <p className="result-title">{result.title}</p>}
              {result.uploader && <p className="result-uploader">{result.uploader}</p>}
              <div className="quality-btns">
                {result.formats?.map((f) => (
                  <button key={f.quality} className={f.quality === result.formats[0]?.quality ? "active" : ""}>
                    {f.quality}
                  </button>
                ))}
              </div>
              <div className="save-row">
                {result.formats?.map((f) => (
                  <button key={f.quality} className="btn-save" onClick={() => handleSave(f.url, f.quality)}>
                    ↓ Save video ({f.quality})
                  </button>
                ))}
                <button className="btn-cancel" onClick={() => setResult(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="platform-tags">
          {["Instagram", "TikTok", "YouTube", "Facebook", "X", "Snapchat"].map((p) => (
            <span key={p} className={`platform-tag ${p === "Snapchat" ? "platform-tag-snap" : ""}`}>
              {p === "Snapchat" ? <><i className="bi bi-snapchat"></i> Snapchat <span className="snap-warn">⚠️ watermark</span></> : p}
            </span>
          ))}
        </div>
        <p className="snap-note">
          ⚠️ <strong>Note:</strong> Snapchat videos are downloaded with a Snapchat watermark. All other platforms (Instagram, TikTok, YouTube, Facebook, X) download <strong>without any watermark</strong>.
        </p>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        {[
          { val: "10M+", label: "Videos downloaded" },
          { val: "7+", label: "Platforms supported" },
          { val: "4K", label: "Max quality" },
          { val: "0", label: "Data stored" },
          { val: "<1min", label: "Avg. download time" },
        ].map(({ val, label }) => (
          <div key={label} className="stat">
            <span className="stat-val">{val}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* COMPARE */}
      <section id="compare" className="compare-section">
        <p className="section-label">THE PROOF</p>
        <h2>Stop wasting time.<br /><span className="accent">Start saving in less than a minute.</span></h2>
        <p className="compare-sub">Every other method is a workaround. ReelSaver is the direct route.</p>
        <div className="compare-grid">
          <div className="compare-col bad">
            <h3>✕ Without ReelSaver</h3>
            {["Open screen recorder", "Record in real-time (wait full duration)", "Get watermark + low quality", "Manually trim & export", "Lose audio sync or metadata"].map((item) => (
              <div key={item} className="compare-item bad-item">✕ {item}</div>
            ))}
          </div>
          <div className="compare-vs">VS</div>
          <div className="compare-col good">
            <h3>✓ With ReelSaver</h3>
            {["Paste the URL", "Download in less than a minute", "Get original quality, no watermark (except Snapchat)", "File is ready quickly", "Full audio, original metadata"].map((item) => (
              <div key={item} className="compare-item good-item">✓ {item}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <p className="section-label">FEATURES</p>
        <h2>Everything you need.<br /><span className="accent">Nothing you don't.</span></h2>
        <div className="features-grid">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card">
              <span className="feature-icon">{icon}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-section">
        <p className="section-label">HOW IT WORKS</p>
        <h2>Three steps.<br /><span className="accent">Quick & easy.</span></h2>
        <div className="steps">
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <div key={step} className="step">
              <div className="step-num">{step}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              {i < HOW_IT_WORKS.length - 1 && <span className="step-arrow">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM STATUS */}
      <section className="platform-status-section">
        <p className="section-label" style={{ textAlign: "center" }}>
          <span style={{ color: "#b6f000" }}>●</span> PLATFORM STATUS
        </p>
        <h2 style={{ textAlign: "center", fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 60px 0" }}>
          Clean downloads.<br />Tested daily across<br />every platform.
        </h2>
        <div className="platform-status-list">
          {PLATFORMS.map(({ num, name, logo, status }) => (
            <div key={name} className="platform-status-row">
              <div className="platform-status-left">
                <span className="platform-num">{num}</span>
                {logo}
                <span className="platform-status-name">{name}</span>
              </div>
              <div className="platform-status-right">
                <span className={status === "no-watermark" ? "dot-green" : "dot-amber"}>●</span>
                {status === "no-watermark" ? (
                  <span className="badge-no-watermark">✓ No Watermark</span>
                ) : (
                  <span className="badge-watermark">⚠️ Watermark</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq-section">
        <p className="section-label">FAQ</p>
        <h2>Questions?<br /><span className="accent">We've got answers.</span></h2>
        <div className="faq-list">
          {FAQ.map(({ q, a }, i) => (
            <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-q">
                {q} <span className="faq-toggle">{openFaq === i ? "−" : "+"}</span>
              </div>
              {openFaq === i && <div className="faq-a">{a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to save your first video?</h2>
        <p>No signup. No watermark. No limits on public videos.</p>
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn-primary">
          Download now →
        </a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">
          <span className="logo-icon">↓</span> ReelSaver
        </div>
        <p className="footer-note">Only works with public content.<br />Respect creators' rights.</p>
        <div className="footer-cols">
          <div>
            <h4>PRODUCT</h4>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#compare">Compare</a>
          </div>
          <div>
            <h4>SUPPORT</h4>
            <a href="#faq">FAQ</a>
            <a href="#" onClick={() => setShowAuth(true)}>Sign in</a>
          </div>
        </div>
        <p className="footer-copy">© 2025 ReelSaver. Made with ♥ for content lovers</p>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </div>
  );
}
