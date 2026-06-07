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

const ClipkitLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="8" fill="url(#clipkit-grad)"/>
    <path d="M17 4L9 16h6l-2 8 10-13h-6l2-7z" fill="white"/>
    <defs>
      <linearGradient id="clipkit-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7c3aed"/>
        <stop offset="100%" stopColor="#a855f7"/>
      </linearGradient>
    </defs>
  </svg>
);

const FEATURES = [
  { icon: "⚡", title: "Lightning fast", desc: "Downloads complete in less than a minute on any connection." },
  { icon: "🎬", title: "Up to 4K quality", desc: "We preserve original resolution. No compression, no quality loss." },
  { icon: "🚫", title: "Zero watermark", desc: "Clean, source-quality video. No overlays, no branding — except Snapchat." },
  { icon: "🌐", title: "7+ platforms", desc: "Instagram, TikTok, YouTube, Facebook, X, Snapchat, Pinterest & more." },
  { icon: "🔒", title: "Private by default", desc: "We never store your links, files, or any personal data." },
  { icon: "🖥️", title: "No install needed", desc: "Runs entirely in your browser. Works on any device quickly." },
];

const HOW_STEPS = [
  { step: "01", title: "Paste the link", desc: "Copy any public video URL from Instagram, TikTok, YouTube, Facebook or Snapchat." },
  { step: "02", title: "Click download", desc: "We fetch the video quickly — no queues, no waiting rooms, no captchas." },
  { step: "03", title: "Save the file", desc: "Pick your quality and save the original file directly to your device." },
];

const FAQ_ITEMS = [
  { q: "Is Clipkit free to use?", a: "Yes — completely free. No account required for basic downloads." },
  { q: "Which platforms are supported?", a: "Instagram, TikTok, YouTube, Facebook, X (Twitter), Snapchat, Pinterest and more." },
  { q: "Do you store my videos?", a: "No. We never store your videos, links, or personal data." },
  { q: "Can I download private videos?", a: "No — Clipkit only works with public content." },
  { q: "What's the max quality I can download?", a: "Up to 4K, depending on the original upload quality." },
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
  const [selectedFmt, setSelectedFmt] = useState(null);
  const [fileType, setFileType] = useState("mp4");

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
    setSelectedFmt(null);
    setFileType("mp4");
    try {
      const res = await fetch(`${API}/api/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Download failed");
      if (!data.formats && data.download_url) {
        const dlUrl = data.download_url.startsWith("http")
          ? data.download_url
          : `${API}${data.download_url}`;
        data.formats = [{ url: dlUrl, quality: "Download MP4" }];
      }
      setResult(data);
      if (data.formats && data.formats.length > 0) {
        setSelectedFmt(data.formats[0].quality);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !result.formats) return;
    const fmt = result.formats.find((f) => f.quality === selectedFmt) ?? result.formats[0];
    if (!fmt) return;
    if (user) {
      await supabase.from("download_history").insert({
        user_id: user.id,
        video_url: url,
        platform: result?.platform,
        title: result?.title,
        quality: fmt.quality,
      });
    }
    window.open(fmt.url, "_blank");
  };

  return (
    <div className="app">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showHistory && <HistoryPanel user={user} onClose={() => setShowHistory(false)} />}

      <nav className="navbar">
        <div className="nav-inner">
          <a href="/" className="nav-brand">
            <ClipkitLogo size={32} />
            Clipkit
          </a>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#compare">Compare</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
            <a href="#history">Download History</a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot"></span>
            Free · No signup · Public videos only
          </div>
          <h1 className="hero-h1">
            Download any reel<br />
            <span>in less than a minute.</span>
          </h1>
          <p className="hero-p">
            Paste a link from Instagram, TikTok, YouTube, Facebook or Snapchat.<br />
            Get the original quality video quickly — no watermark, no waiting.{" "}
            <span style={{ color: "var(--text3)", fontSize: 15 }}>(Snapchat includes watermark)</span>
          </p>

          <form className="hero-form" onSubmit={handleDownload}>
            <div className="hero-input-wrap">
              <input
                className="hero-input"
                type="url"
                placeholder="https://www.instagram.com/reel/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <button className="btn-download" type="submit" disabled={loading}>
                {loading ? "Processing…" : "Download ↓"}
              </button>
            </div>
          </form>

          <div className="hero-platforms">
            {["Instagram", "TikTok", "YouTube", "Facebook", "X", "Pinterest"].map((p) => (
              <span key={p} className="platform-tag">{p}</span>
            ))}
            <span className="platform-tag platform-tag-snap">
              Snapchat <span className="watermark-label">⚠ watermark</span>
            </span>
          </div>
          <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 12 }}>
            ⚠ <strong>Note:</strong> Snapchat videos are downloaded with a Snapchat watermark. All other platforms download{" "}
            <strong>without any watermark</strong>.
          </p>

          {error && <p style={{ color: "var(--bad)", marginTop: 16 }}>{error}</p>}

          {result && (
            <div className="result-box">
              <div className="result-content">
                <div className="result-thumb-wrap">
                  {result.thumbnail ? (
                    <img src={result.thumbnail} alt="thumbnail" className="result-thumb" />
                  ) : (
                    <div className="result-thumb-placeholder">
                      <span>Thumbnail/<br />video preview</span>
                    </div>
                  )}
                  {result.duration && <span className="result-dur">{result.duration}s</span>}
                </div>

                <div className="result-details">
                  <p
                    className="result-platform"
                    style={{ background: PLATFORM_COLORS[result.platform] || PLATFORM_COLORS.Unknown }}
                  >
                    {result.platform || "Video"}
                  </p>
                  <p className="result-title">{result.title || "Video ready"}</p>
                  {result.uploader && <p className="result-uploader">@{result.uploader}</p>}

                  {result.formats && result.formats.length > 0 && (
                    <div className="result-formats">
                      {result.formats.map((fmt) => {
                        const label = fmt.quality.replace("⬇ ", "").replace("↓ ", "");
                        return (
                          <button
                            key={fmt.quality}
                            className={`fmt-btn${selectedFmt === fmt.quality ? " fmt-active" : ""}`}
                            onClick={() => setSelectedFmt(fmt.quality)}
                          >
                            {label}
                            {fmt.filesize && (
                              <span className="fmt-size">
                                {(fmt.filesize / 1024 / 1024).toFixed(1)}MB
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="result-type-btns">
                    <button
                      className={`btn-type${fileType === "mp3" ? " active" : ""}`}
                      onClick={() => setFileType("mp3")}
                    >
                      MP3
                    </button>
                    <button
                      className={`btn-type${fileType === "mp4" ? " active" : ""}`}
                      onClick={() => setFileType("mp4")}
                    >
                      MP4
                    </button>
                  </div>

                  <div className="result-actions">
                    <button className="btn-save" onClick={handleSave}>
                      ↓ Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="stats-bar">
        <div className="stats-inner">
          {[
            { n: "10M+", l: "Videos downloaded" },
            { n: "7+", l: "Platforms supported" },
            { n: "4K", l: "Max quality" },
            { n: "0", l: "Data stored" },
            { n: "<1min", l: "Avg. download time" },
          ].map((s) => (
            <div key={s.l} className="stat">
              <span className="stat-n">{s.n}</span>
              <span className="stat-l">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="compare-section" id="compare">
        <div className="section-inner">
          <p className="section-eyebrow">THE PROOF</p>
          <h2 className="section-h2">Stop wasting time.<br />Start saving in less than a minute.</h2>
          <p className="section-p">Every other method is a workaround. Clipkit is the direct route.</p>
          <div className="compare-table">
            <div className="compare-col compare-col-bad">
              <div className="compare-col-header">
                <span className="col-badge col-badge-bad">✕ Without Clipkit</span>
              </div>
              {["Open screen recorder","Record in real-time (wait full duration)","Get watermark + low quality","Manually trim & export","Lose audio sync or metadata"].map((item) => (
                <div key={item} className="compare-row bad">
                  <span className="compare-icon bad">✕</span> {item}
                </div>
              ))}
            </div>
            <div className="compare-col compare-col-good">
              <div className="compare-col-header">
                <span className="col-badge col-badge-good">✓ With Clipkit</span>
              </div>
              {["Paste the link","Click download","Get original quality file","No watermark, no waiting","Done in under a minute"].map((item) => (
                <div key={item} className="compare-row good">
                  <span className="compare-icon good">✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-inner">
          <p className="section-eyebrow">WHY CLIPKIT</p>
          <h2 className="section-h2">Everything you need.<br />Nothing you don't.</h2>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="section-inner">
          <p className="section-eyebrow">HOW IT WORKS</p>
          <h2 className="section-h2">Three steps.<br />One click to save.</h2>
          <div className="how-steps">
            {HOW_STEPS.map((s) => (
              <div key={s.step} className="how-step">
                <span className="how-step-num">{s.step}</span>
                <h3 className="how-step-title">{s.title}</h3>
                <p className="how-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="section-inner">
          <p className="section-eyebrow">FAQ</p>
          <h2 className="section-h2">Common questions.</h2>
          <div className="faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {item.q}
                  <span className="faq-arrow">{openFaq === i ? "▲" : "▼"}</span>
                </button>
                {openFaq === i && <p className="faq-a">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="history-section" id="history">
        <div className="section-inner">
          <p className="section-eyebrow">YOUR HISTORY</p>
          <h2 className="section-h2">Download History</h2>
          {user ? (
            <button className="btn-nav-accent" onClick={() => setShowHistory(true)}>View History</button>
          ) : (
            <p style={{ color: "var(--text2)" }}>
              <button className="btn-nav-ghost" onClick={() => setShowAuth(true)}>Sign in</button>
              {" "}to track your download history.
            </p>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <a href="/" className="nav-brand">
            <ClipkitLogo size={24} />
            Clipkit
          </a>
          <p className="footer-copy">© {new Date().getFullYear()} Clipkit. Free forever.</p>
        </div>
      </footer>
    </div>
  );
}
