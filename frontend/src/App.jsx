import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import AuthModal from "./AuthModal";
import HistoryPanel from "./HistoryPanel";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PLATFORM_COLORS = {
  Instagram: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
  Facebook: "linear-gradient(45deg, #1877f2, #0d5dbf)",
  Snapchat: "linear-gradient(45deg, #f0e800, #c8c200)",
  TikTok: "linear-gradient(45deg, #69c9d0, #ee1d52)",
  "Twitter/X": "linear-gradient(45deg, #1da1f2, #0d8bd9)",
  YouTube: "linear-gradient(45deg, #ff0000, #cc0000)",
  Unknown: "linear-gradient(135deg, #c8ff00, #00ffaa)",
};

const FEATURES = [
  { icon: "⚡", title: "Lightning fast", desc: "Downloads complete in under 3 seconds on any connection." },
  { icon: "🎬", title: "Up to 4K quality", desc: "We preserve original resolution. No compression, no quality loss." },
  { icon: "🚫", title: "Zero watermark", desc: "Clean, source-quality video. No overlays, no branding added." },
  { icon: "🌐", title: "7+ platforms", desc: "Instagram, TikTok, YouTube, Facebook, X, Snapchat & more." },
  { icon: "🔒", title: "Private by default", desc: "We don't store your links, files, or any personal data." },
  { icon: "🖥️", title: "No install needed", desc: "Runs entirely in your browser. Works on any device instantly." },
];

const FAQS = [
  { q: "Is ReelSaver free to use?", a: "Yes — completely free. No account required for basic downloads." },
  { q: "Which platforms are supported?", a: "Instagram, TikTok, YouTube, Facebook, X (Twitter), Snapchat, and more." },
  { q: "Do you store my videos?", a: "No. Files are processed in-memory and deleted immediately after download." },
  { q: "Can I download private videos?", a: "No. Only publicly available content can be downloaded. Private accounts are blocked by design." },
  { q: "What's the max quality I can download?", a: "Up to 4K if the original source is 4K. We never upscale or compress." },
];

const COMPARISONS = [
  { without: "Open screen recorder", with: "Paste the URL" },
  { without: "Record in real-time (wait full duration)", with: "Download in 3 seconds" },
  { without: "Get watermark + low quality", with: "Get original quality, no watermark" },
  { without: "Manually trim & export", with: "File is ready instantly" },
  { without: "Lose audio sync or metadata", with: "Full audio, original metadata" },
];

function formatDuration(s) {
  if (!s) return null;
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}
function formatSize(b) {
  if (!b) return null;
  if (b > 1048576) return `${(b / 1048576).toFixed(1)} MB`;
  if (b > 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setShowAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleFetch(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true); setError(""); setSuccess(""); setVideoInfo(null); setSelectedFormat("");
    try {
      const res = await fetch(`${API}/api/info`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Failed to fetch video info."); return; }
      setVideoInfo(data);
      setSelectedFormat(data.formats[0]?.format_id || "best");
    } catch { setError("Network error. Make sure the backend is running."); }
    finally { setLoading(false); }
  }

  async function handleDownload() {
    if (!videoInfo) return;
    setDownloading(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API}/api/download?format_id=${encodeURIComponent(selectedFormat)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Download failed."); return; }
      const link = document.createElement("a");
      link.href = `${API}${data.download_url}`; link.download = data.filename; link.click();
      setSuccess("Download started!");
      if (user) await supabase.from("downloads").insert({ user_id: user.id, url: url.trim(), title: videoInfo.title, platform: videoInfo.platform, thumbnail: videoInfo.thumbnail });
    } catch { setError("Download failed. Please try again."); }
    finally { setDownloading(false); }
  }

  const platform = videoInfo?.platform || "Unknown";
  const platformGrad = PLATFORM_COLORS[platform] || PLATFORM_COLORS.Unknown;

  return (
    <div className="app">

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-inner">
          <a href="#" className="nav-brand">
            <span className="brand-icon">↓</span>
            ReelSaver
          </a>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#compare">Compare</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-cta">
            {user ? (
              <>
                <button className="btn-nav-ghost" onClick={() => setShowHistory(true)}>History</button>
                <button className="btn-nav-ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
              </>
            ) : (
              <button className="btn-nav-accent" onClick={() => setShowAuth(true)}>Get Started →</button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            Free · No signup · Public videos only
          </div>

          <h1 className="hero-h1">
            Download any reel<br />
            <span className="accent-text">in 3 seconds.</span>
          </h1>

          <p className="hero-p">
            Paste a link from Instagram, TikTok, YouTube, Facebook or Snapchat.<br />
            Get the original quality video instantly — no watermark, no waiting.
          </p>

          <form className="hero-form" onSubmit={handleFetch}>
            <div className="hero-input-wrap">
              <input
                className="hero-input"
                type="text"
                placeholder="Paste your video URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading || downloading}
              />
              <button className="hero-btn" type="submit" disabled={loading || !url.trim()}>
                {loading ? <span className="spin" /> : "Download ↓"}
              </button>
            </div>
          </form>

          {error && <div className="toast toast-error">⚠ {error}</div>}
          {success && <div className="toast toast-success">✓ {success}</div>}

          {/* Result */}
          {videoInfo && (
            <div className="result-box">
              <div className="result-bar" style={{ background: platformGrad }} />
              <div className="result-content">
                {videoInfo.thumbnail && (
                  <div className="result-thumb-wrap">
                    <img src={videoInfo.thumbnail} className="result-thumb" alt="" />
                    {videoInfo.duration && <span className="result-dur">{formatDuration(videoInfo.duration)}</span>}
                  </div>
                )}
                <div className="result-details">
                  <span className="result-platform">{platform}</span>
                  <h3 className="result-title">{videoInfo.title}</h3>
                  {videoInfo.uploader && <p className="result-uploader">{videoInfo.uploader}</p>}
                  <div className="result-formats">
                    {videoInfo.formats.map((f) => (
                      <button key={f.format_id}
                        className={`fmt-btn ${selectedFormat === f.format_id ? "fmt-active" : ""}`}
                        style={selectedFormat === f.format_id ? { background: platformGrad, borderColor: "transparent" } : {}}
                        onClick={() => setSelectedFormat(f.format_id)}>
                        {f.quality}
                        {f.filesize && <span className="fmt-size">{formatSize(f.filesize)}</span>}
                      </button>
                    ))}
                  </div>
                  <div className="result-btns">
                    <button className="btn-save" onClick={handleDownload} disabled={downloading}>
                      {downloading ? <><span className="spin" /> Saving...</> : "↓ Save video"}
                    </button>
                    <button className="btn-cancel" onClick={() => { setVideoInfo(null); setUrl(""); setError(""); setSuccess(""); }}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="hero-platforms">
            {["Instagram", "TikTok", "YouTube", "Facebook", "X", "Snapchat"].map(p => (
              <span key={p} className="platform-tag">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat"><span className="stat-n">10M+</span><span className="stat-l">Videos downloaded</span></div>
          <div className="stat-div" />
          <div className="stat"><span className="stat-n">7+</span><span className="stat-l">Platforms supported</span></div>
          <div className="stat-div" />
          <div className="stat"><span className="stat-n">4K</span><span className="stat-l">Max quality</span></div>
          <div className="stat-div" />
          <div className="stat"><span className="stat-n">0</span><span className="stat-l">Data stored</span></div>
          <div className="stat-div" />
          <div className="stat"><span className="stat-n">3s</span><span className="stat-l">Avg. download time</span></div>
        </div>
      </div>

      {/* ── Comparison ── */}
      <section className="compare-section" id="compare">
        <div className="section-inner">
          <p className="section-eyebrow">THE PROOF</p>
          <h2 className="section-h2">Stop wasting time.<br /><span className="accent-text">Start saving in seconds.</span></h2>
          <p className="section-p">Every other method is a workaround. ReelSaver is the direct route.</p>

          <div className="compare-table">
            <div className="compare-col compare-col-bad">
              <div className="compare-col-header">
                <span className="col-badge col-badge-bad">✕ Without ReelSaver</span>
              </div>
              {COMPARISONS.map((c, i) => (
                <div key={i} className="compare-row bad">
                  <span className="compare-icon bad">✕</span>
                  <span>{c.without}</span>
                </div>
              ))}
            </div>

            <div className="compare-vs">VS</div>

            <div className="compare-col compare-col-good">
              <div className="compare-col-header">
                <span className="col-badge col-badge-good">✓ With ReelSaver</span>
              </div>
              {COMPARISONS.map((c, i) => (
                <div key={i} className="compare-row good">
                  <span className="compare-icon good">✓</span>
                  <span>{c.with}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <p className="section-eyebrow">FEATURES</p>
          <h2 className="section-h2">Everything you need.<br /><span className="accent-text">Nothing you don't.</span></h2>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section" id="how">
        <div className="section-inner">
          <p className="section-eyebrow">HOW IT WORKS</p>
          <h2 className="section-h2">Three steps.<br /><span className="accent-text">Under ten seconds.</span></h2>
          <div className="steps-row">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3>Paste the link</h3>
              <p>Copy any public video URL from Instagram, TikTok, YouTube, Facebook or Snapchat.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h3>Click download</h3>
              <p>We fetch the video instantly — no queues, no waiting rooms, no captchas.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h3>Save the file</h3>
              <p>Pick your quality and save the original file directly to your device.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section" id="faq">
        <div className="section-inner faq-inner">
          <p className="section-eyebrow">FAQ</p>
          <h2 className="section-h2">Questions?<br /><span className="accent-text">We've got answers.</span></h2>
          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className="faq-icon">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <div className="faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-h2">Ready to save your first video?</h2>
          <p className="cta-p">No signup. No watermark. No limits on public videos.</p>
          <a href="#" className="btn-cta" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            Download now →
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-brand"><span className="brand-icon">↓</span> ReelSaver</div>
            <p className="footer-sub">Only works with public content.<br />Respect creators' rights.</p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <p className="footer-col-title">Product</p>
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#compare">Compare</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Support</p>
              <a href="#faq">FAQ</a>
              {user
                ? <button className="footer-link-btn" onClick={() => setShowHistory(true)}>My History</button>
                : <button className="footer-link-btn" onClick={() => setShowAuth(true)}>Sign in</button>
              }
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 ReelSaver</span>
          <span>Made with ♥ for content lovers</span>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {showHistory && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowHistory(false)}>
          <div className="history-modal">
            <div className="history-modal-head">
              <h2>Download History</h2>
              <button onClick={() => setShowHistory(false)}>✕</button>
            </div>
            <HistoryPanel user={user} />
          </div>
        </div>
      )}
    </div>
  );
}
