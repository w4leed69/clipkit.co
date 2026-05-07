import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./HistoryPanel.css";

const PLATFORM_ICONS = {
  Instagram: "📸",
  Facebook: "👥",
  Snapchat: "👻",
  TikTok: "🎵",
  "Twitter/X": "🐦",
  YouTube: "▶️",
  Unknown: "🌐",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

export default function HistoryPanel({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  async function fetchHistory() {
    setLoading(true);
    const { data, error } = await supabase
      .from("downloads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error) setHistory(data || []);
    setLoading(false);
  }

  async function clearHistory() {
    await supabase.from("downloads").delete().eq("user_id", user.id);
    setHistory([]);
  }

  if (!user) {
    return (
      <div className="history-empty">
        <div className="history-empty-icon">📋</div>
        <h3>Sign in to see history</h3>
        <p>Your download history will be saved when you&apos;re signed in.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="history-loading">
        <span className="spinner" />
        <p>Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <div className="history-empty-icon">📭</div>
        <h3>No downloads yet</h3>
        <p>Your downloaded videos will appear here.</p>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>Download History <span className="count">{history.length}</span></h3>
        <button className="btn-clear-history" onClick={clearHistory}>Clear all</button>
      </div>

      <div className="history-list">
        {history.map((item) => (
          <div key={item.id} className="history-item">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt="" className="history-thumb" />
            ) : (
              <div className="history-thumb-placeholder">
                {PLATFORM_ICONS[item.platform] || "🎬"}
              </div>
            )}
            <div className="history-info">
              <p className="history-title">{item.title || "Untitled"}</p>
              <div className="history-meta">
                <span>{PLATFORM_ICONS[item.platform]} {item.platform}</span>
                <span>·</span>
                <span>{timeAgo(item.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
