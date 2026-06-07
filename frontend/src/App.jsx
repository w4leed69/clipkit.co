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
              </linearGradient>linearGradient>
        </defs>defs>
    </svg>svg>
  );

const FEATURES = [
  { icon: "⚡", title: "Lightning fast", desc: "Downloads complete in less than a minute on any connection." },
  { icon: "🎬", title: "Up to 4K quality", desc: "We preserve original resolution. No compression, no quality loss." },
  { icon: "🚫", title: "Zero watermark", desc: "Clean, source-quality video. No overlays, no branding — except Snapchat, which includes its own watermark." },
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

const PLATFORMS = [
  {
        num: "001", name: "Instagram", status: "no-watermark",
        logo: <div className="platform-logo-wrap" style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}><svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>svg></div>div>
          },
  {
        num: "002", name: "TikTok", status: "no-watermark",
        logo: <div className="platform-logo-wrap" style={{ background: "#010101", border: "1px solid #222" }}><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.14 8.14 0 0 0 4.77 1.52V6.78a4.85 4.85 0 0 1-1-.09z"/></svg>svg></div>div>
          },
  {
        num: "003", name: "YouTube", status: "no-watermark",
        logo: <div className="platform-logo-wrap" style={{ background: "#ff0000" }}><svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>svg></div>div>
          },
  {
        num: "004", name: "Facebook", status: "no-watermark",
        logo: <div className="platform-logo-wrap" style={{ background: "#1877f2" }}><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>svg></div>div>
          },
  {
        num: "005", name: "X (Twitter)", status: "no-watermark",
        logo: <div className="platform-logo-wrap" style={{ background: "#000", border: "1px solid #333" }}><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>svg></div>div>
          },
  {
        num: "006", name: "Snapchat", status: "watermark",
        logo: <div className="platform-logo-wrap" style={{ background: "#FFFC00" }}><i className="bi bi-snapchat" style={{ fontSize: 24, color: "#000", lineHeight: 1 }}></i>i></div>div>
          },
  {
        num: "007", name: "Pinterest", status: "no-watermark",
        logo: <div className="platform-logo-wrap" style={{ background: "#e60023" }}><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="white" viewBox="0 0 16 16"><path d="M8 0a8 8 0 0 0-2.915 15.452c-.07-.633-.134-1.606.027-2.297.146-.625.975-4.13.975-4.13s-.249-.498-.249-1.235c0-1.158.67-2.023 1.503-2.023.71 0 1.053.533 1.053 1.172 0 .714-.454 1.782-.69 2.773-.197.828.415 1.503 1.229 1.503 1.474 0 2.61-1.554 2.61-3.798 0-1.986-1.427-3.374-3.464-3.374-2.36 0-3.745 1.769-3.745 3.598 0 .712.274 1.475.615 1.892a.25.25 0 0 1 .057.239c-.063.259-.202.828-.23.944-.037.153-.123.185-.284.111-1.058-.493-1.719-2.042-1.719-3.285 0-2.669 1.938-5.122 5.593-5.122 2.936 0 5.215 2.093 5.215 4.886 0 2.916-1.838 5.264-4.389 5.264-.858 0-1.664-.446-1.94-.972l-.527 1.966c-.191.734-.707 1.654-1.052 2.215A8 8 0 1 0 8 0"/></svg>svg></div>div>
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
                  // Normalize: handle both {formats:[]} and {file_id, download_url} shapes
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
          
            {/* Navbar */}
                <nav className="navbar">
                        <div className="nav-inner">
                                  <a href="/" className="nav-brand">
                                              <ClipkitLogo size={32} />
                                              Clipkit
                                  </a>a>
                                  <div className="nav-links">
                                              <a href="#features">Features</a>a>
                                              <a href="#compare">Compare</a>a>
                                              <a href="#how">How it works</a>a>
                                              <a href="#faq">FAQ</a>a>
                                              <a href="#history">Download History</a>a>
                                  </div>div>
                        </div>div>
                </nav>nav>
          
            {/* Hero */}
                <section className="hero">
                        <div className="hero-inner">
                                  <div className="hero-eyebrow">
                                              <span className="eyebrow-dot"></span>span>
                                              Free · No signup · Public videos only
                                  </div>div>
                                  <h1 className="hero-h1">
                                              Download any reel<br />
                                              <span>in less than a minute.</span>span>
                                  </h1>h1>
                                  <p className="hero-p">
                                              Paste a link from Instagram, TikTok, YouTube, Facebook or Snapchat.<br />
                                              Get the original quality video quickly — no watermark, no waiting.{" "}
                                              <span style={{ color: "var(--text3)", fontSize: 15 }}>(Snapchat includes watermark)</span>span>
                                  </p>p>
                        
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
                                                            </button>button>
                                              </div>div>
                                  </form>form>
                        
                          {/* Platform pills */}
                                  <div className="hero-platforms">
                                    {["Instagram", "TikTok", "YouTube", "Facebook", "X", "Pinterest"].map((p) => (
                          <span key={p} className="platform-tag">{p}</span>span>
                        ))}
                                              <span className="platform-tag platform-tag-snap">
                                                            <i className="bi bi-snapchat"></i>i> Snapchat <span className="watermark-label">⚠ watermark</span>span>
                                              </span>span>
                                  </div>div>
                                  <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 12 }}>
                                              ⚠ <strong>Note:</strong>strong> Snapchat videos are downloaded with a Snapchat watermark. All other platforms download{" "}
                                              <strong>without any watermark</strong>strong>.
                                  </p>p>
                        
                          {/* Error */}
                          {error && <p style={{ color: "var(--bad)", marginTop: 16 }}>{error}</p>p>}
                        
                          {/* Result Box */}
                          {result && (
                        <div className="result-box">
                                      <div className="result-content">
                                        {/* Left: Thumbnail */}
                                                      <div className="result-thumb-wrap">
                                                        {result.thumbnail ? (
                                              <img src={result.thumbnail} alt="thumbnail" className="result-thumb" />
                                            ) : (
                                              <div className="result-thumb-placeholder">
                                                                    <span>Thumbnail/<br />video preview</span>span>
                                              </div>div>
                                                                        )}
                                                        {result.duration && <span className="result-dur">{result.duration}s</span>span>}
                                                      </div>div>
                                      
                                        {/* Right: Details */}
                                                      <div className="result-details">
                                                                        <p className="result-platform"
                                                                                              style={{ background: PLATFORM_COLORS[result.platform] || PLATFORM_COLORS.Unknown }}>
                                                                          {result.platform || "Video"}
                                                                        </p>p>
                                                                        <p className="result-title">{result.title || "Video ready"}</p>p>
                                                        {result.uploader && (
                                              <p className="result-uploader">@{result.uploader}</p>p>
                                                                        )}
                                                      
                                                        {/* Quality buttons */}
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
                                                                                                                                                                  </span>span>
                                                                                                                                )}
                                                                                                      </button>button>
                                                                                                  );
                                              })}
                                              </div>div>
                                                                        )}
                                                      
                                                        {/* MP3 / MP4 type toggle */}
                                                                        <div className="result-type-btns">
                                                                                            <button
                                                                                                                    className={`btn-type${fileType === "mp3" ? " active" : ""}`}
                                                                                                                    onClick={() => setFileType("mp3")}
                                                                                                                  >
                                                                                                                  MP3
                                                                                              </button>button>
                                                                                            <button
                                                                                                                    className={`btn-type${fileType === "mp4" ? " active" : ""}`}
                                                                                                                    onClick={() => setFileType("mp4")}
                                                                                                                  >
                                                                                                                  MP4
                                                                                              </button>button>
                                                                        </div>div>
                                                      
                                                        {/* Download action */}
                                                                        <div className="result-actions">
                                                                                            <button className="btn-save" onClick={handleSave}>
                                                                                                                  ↓ Download
                                                                                              </button>button>
                                                                        </div>div>
                                                      </div>div>
                                      </div>div>
                        </div>div>
                                  )}
                        </div>div>
                </section>section>
          
            {/* Stats bar */}
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
                                                  <span className="stat-n">{s.n}</span>span>
                                                  <span className="stat-l">{s.l}</span>span>
                                    </div>div>
                                  ))}
                        </div>div>
                </div>div>
          
            {/* Compare section */}
                <section className="compare-section" id="compare">
                        <div className="section-inner">
                                  <p className="section-eyebrow">THE PROOF</p>p>
                                  <h2 className="section-h2">
                                              Stop wasting time.<br />Start saving in less than a minute.
                                  </h2>h2>
                                  <p className="section-p">Every other method is a workaround. Clipkit is the direct route.</p>p>
                                  <div className="compare-table">
                                              <div className="compare-col compare-col-bad">
                                                            <div className="compare-col-header">
                                                                            <span className="col-badge col-badge-bad">✕ Without Clipkit</span>span>
                                                            </div>div>
                                                {["Open screen recorder", "Record in real-time (wait full duration)", "Get watermark + low quality", "Manually trim & export", "Lose audio sync or metadata"].map((item) => (
                            <div key={item} className="compare-row bad">
                                              <span className="compare-icon bad">✕</span>span> {item}
                            </div>div>
                          ))}
                                              </div>div>
                                              <div className="compare-col compare-col-good">
                                                            <div className="compare-col-header">
                                                                            <span className="col-badge col-badge-good">✓ With Clipkit</span>span>
                                                            </div>div>
                                                {["Paste the link", "Click download", "Get original quality file", "No watermark, no waiting", "Done in under a minute"].map((item) => (
                            <div key={item} className="compare-row good">
                                              <span className="compare-icon good">✓</span>span> {item}
                            </div>div>
                          ))}
                                              </div>div>
                                  </div>div>
                        </div>div>
                </section>section>
          
            {/* Features */}
                <section className="features-section" id="features">
                        <div className="section-inner">
                                  <p className="section-eyebrow">WHY CLIPKIT</p>p>
                                  <h2 className="section-h2">Everything you need.<br />Nothing you don't.</h2>h2>
                                  <div className="features-grid">
                                    {FEATURES.map((f) => (
                          <div key={f.title} className="feature-card">
                                          <span className="feature-icon">{f.icon}</span>span>
                                          <h3 className="feature-title">{f.title}</h3>h3>
                                          <p className="feature-desc">{f.desc}</p>p>
                          </div>div>
                        ))}
                                  </div>div>
                        </div>div>
                </section>section>
          
            {/* Platforms */}
                <section className="platforms-section">
                        <div className="section-inner">
                                  <p className="section-eyebrow">SUPPORTED PLATFORMS</p>p>
                                  <h2 className="section-h2">Works everywhere<br />you watch.</h2>h2>
                                  <div className="platforms-list">
                                    {PLATFORMS.map((p) => (
                          <div key={p.num} className="platform-row">
                                          <span className="platform-num">{p.num}</span>span>
                            {p.logo}
                                          <span className="platform-name">{p.name}</span>span>
                                          <span className={`platform-status ${p.status}`}>
                                            {p.status === "no-watermark" ? "✓ No watermark" : "⚠ Watermark"}
                                          </span>span>
                          </div>div>
                        ))}
                                  </div>div>
                        </div>div>
                </section>section>
          
            {/* How it works */}
                <section className="how-section" id="how">
                        <div className="section-inner">
                                  <p className="section-eyebrow">HOW IT WORKS</p>p>
                                  <h2 className="section-h2">Three steps.<br />One click to save.</h2>h2>
                                  <div className="how-steps">
                                    {HOW_STEPS.map((s) => (
                          <div key={s.step} className="how-step">
                                          <span className="how-step-num">{s.step}</span>span>
                                          <h3 className="how-step-title">{s.title}</h3>h3>
                                          <p className="how-step-desc">{s.desc}</p>p>
                          </div>div>
                        ))}
                                  </div>div>
                        </div>div>
                </section>section>
          
            {/* FAQ */}
                <section className="faq-section" id="faq">
                        <div className="section-inner">
                                  <p className="section-eyebrow">FAQ</p>p>
                                  <h2 className="section-h2">Common questions.</h2>h2>
                                  <div className="faq-list">
                                    {FAQ_ITEMS.map((item, i) => (
                          <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
                                          <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                            {item.q}
                                                            <span className="faq-arrow">{openFaq === i ? "▲" : "▼"}</span>span>
                                          </button>button>
                            {openFaq === i && <p className="faq-a">{item.a}</p>p>}
                          </div>div>
                        ))}
                                  </div>div>
                        </div>div>
                </section>section>
          
            {/* Download History */}
                <section className="history-section" id="history">
                        <div className="section-inner">
                                  <p className="section-eyebrow">YOUR HISTORY</p>p>
                                  <h2 className="section-h2">Download History</h2>h2>
                          {user ? (
                        <button className="btn-nav-accent" onClick={() => setShowHistory(true)}>
                                      View History
                        </button>button>
                      ) : (
                        <p style={{ color: "var(--text2)" }}>
                                      <button className="btn-nav-ghost" onClick={() => setShowAuth(true)}>Sign in</button>button>
                          {" "}to track your download history.
                        </p>p>
                                  )}
                        </div>div>
                </section>section>
          
            {/* Footer */}
                <footer className="footer">
                        <div className="footer-inner">
                                  <a href="/" className="nav-brand">
                                              <ClipkitLogo size={24} />
                                              Clipkit
                                  </a>a>
                                  <p className="footer-copy">© {new Date().getFullYear()} Clipkit. Free forever.</p>p>
                        </div>div>
                </footer>footer>
          </div>div>
        );
}</svg>
