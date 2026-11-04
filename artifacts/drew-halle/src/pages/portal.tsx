import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MediaManager from "@/components/portal/media-manager";
import { parseYouTube } from "@/lib/media";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type RecentWorkItem = {
  id: number;
  type: "photo" | "video";
  embedUrl: string;
  title: string;
  category: "Music" | "Sports" | "Hospitality & Events" | "Snow";
  dateAdded: string;
  active: boolean;
};

type FormState = {
  type: "photo" | "video";
  embedUrl: string;
  title: string;
  category: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  type: "video",
  embedUrl: "",
  title: "",
  category: "Music",
  active: true,
};

// ── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json };
}

// ── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { ok } = await apiFetch("/portal/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (ok) {
      onLogin();
    } else {
      setError("INCORRECT PASSWORD");
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <p className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase mb-8">
          LUCA FILMS · PORTAL
        </p>
        <h1 className="font-sans text-3xl font-black tracking-widest text-white uppercase mb-8">
          SIGN IN
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[9px] tracking-widest text-white/40 uppercase mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white font-mono text-sm tracking-wide focus:border-white/60 focus:outline-none transition-colors placeholder:text-white/20"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="font-mono text-[9px] tracking-widest text-red-400 uppercase">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full border border-white/30 py-3 font-mono text-[10px] tracking-widest text-white uppercase hover:border-white hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-40"
          >
            {loading ? "AUTHENTICATING..." : "ENTER"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Homepage "Recent Work" carousel manager ─────────────────────────────────

function RecentWorkManager() {
  const [items, setItems] = useState<RecentWorkItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function fetchItems() {
    setLoadingItems(true);
    const { data } = await apiFetch("/portal/recent-work");
    setItems(Array.isArray(data) ? data : []);
    setLoadingItems(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus(null);

    const url = editingId !== null
      ? `/portal/recent-work/${editingId}`
      : "/portal/recent-work";
    const method = editingId !== null ? "PATCH" : "POST";

    // Accept a full <iframe> embed code / watch link for videos, store a clean embed URL.
    let embedUrl = form.embedUrl.trim();
    if (form.type === "video") {
      const parsed = parseYouTube(embedUrl);
      if (!parsed) {
        setSubmitting(false);
        setFormStatus({ type: "error", msg: "COULDN'T FIND A YOUTUBE VIDEO IN THAT LINK" });
        return;
      }
      embedUrl = `https://www.youtube.com/embed/${parsed.id}`;
    }

    const { ok, data } = await apiFetch(url, {
      method,
      body: JSON.stringify({ ...form, embedUrl }),
    });

    setSubmitting(false);
    if (ok) {
      setFormStatus({ type: "success", msg: editingId !== null ? "ENTRY UPDATED" : "ENTRY ADDED" });
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchItems();
    } else {
      setFormStatus({ type: "error", msg: data?.error || "FAILED TO SAVE" });
    }
  }

  function startEdit(item: RecentWorkItem) {
    setEditingId(item.id);
    setForm({
      type: item.type,
      embedUrl: item.embedUrl,
      title: item.title,
      category: item.category,
      active: item.active,
    });
    setFormStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormStatus(null);
  }

  async function toggleActive(item: RecentWorkItem) {
    await apiFetch(`/portal/recent-work/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !item.active }),
    });
    fetchItems();
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    const { ok } = await apiFetch(`/portal/recent-work/${id}`, { method: "DELETE" });
    setDeletingId(null);
    setConfirmDelete(null);
    if (ok) fetchItems();
  }

  function getYoutubeThumbnail(url: string) {
    const match = url.match(/embed\/([^?&]+)/);
    if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    return null;
  }

  return (
    <div>
      <div className="space-y-16">
        {/* Upload / Edit form */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-sans text-2xl font-black tracking-widest uppercase">
              {editingId !== null ? "EDIT ENTRY" : "ADD ENTRY"}
            </h2>
            {editingId !== null && (
              <button
                onClick={cancelEdit}
                className="font-mono text-[9px] tracking-widest text-white/40 uppercase hover:text-white transition-colors"
              >
                CANCEL
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type toggle */}
            <div>
              <label className="block font-mono text-[9px] tracking-widest text-white/40 uppercase mb-3">
                TYPE
              </label>
              <div className="flex gap-0">
                {(["video", "photo"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`px-6 py-2.5 font-mono text-[10px] tracking-widest uppercase border transition-colors ${
                      form.type === t
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/40 border-white/20 hover:border-white/40"
                    }`}
                  >
                    {t === "video" ? "VIDEO" : "PHOTO"}
                  </button>
                ))}
              </div>
            </div>

            {/* Embed URL */}
            <div>
              <label className="block font-mono text-[9px] tracking-widest text-white/40 uppercase mb-2">
                LINK <span className="text-white/20">— YouTube embed code / link, or image URL</span>
              </label>
              <input
                type="text"
                value={form.embedUrl}
                onChange={(e) => setForm({ ...form, embedUrl: e.target.value })}
                required
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-white/60 focus:outline-none transition-colors placeholder:text-white/20"
                placeholder={form.type === "video" ? "https://www.youtube.com/embed/…" : "https://…/image.jpg"}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block font-mono text-[9px] tracking-widest text-white/40 uppercase mb-2">
                TITLE
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-white/60 focus:outline-none transition-colors placeholder:text-white/20"
                placeholder="Enter title"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-mono text-[9px] tracking-widest text-white/40 uppercase mb-2">
                CATEGORY
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                className="w-full bg-black border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-white/60 focus:outline-none transition-colors"
              >
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Hospitality & Events">Hospitality &amp; Events</option>
                <option value="Snow">Snow</option>
              </select>
            </div>

            {/* Active checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 accent-white"
              />
              <label htmlFor="active" className="font-mono text-[9px] tracking-widest text-white/60 uppercase cursor-pointer">
                SHOW IN HOMEPAGE CAROUSEL
              </label>
            </div>

            {/* Status message */}
            {formStatus && (
              <p className={`font-mono text-[9px] tracking-widest uppercase ${
                formStatus.type === "success" ? "text-green-400" : "text-red-400"
              }`}>
                {formStatus.msg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="border border-white/30 px-8 py-3 font-mono text-[10px] tracking-widest text-white uppercase hover:border-white hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-40"
            >
              {submitting ? "SAVING..." : editingId !== null ? "UPDATE ENTRY" : "ADD TO RECENT WORK"}
            </button>
          </form>
        </section>

        {/* Manage entries */}
        <section>
          <h2 className="font-sans text-2xl font-black tracking-widest uppercase mb-8">
            MANAGE ENTRIES
          </h2>

          {loadingItems ? (
            <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
              LOADING...
            </p>
          ) : items.length === 0 ? (
            <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
              NO ENTRIES YET
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const thumb = item.type === "video"
                  ? getYoutubeThumbnail(item.embedUrl)
                  : item.embedUrl;

                return (
                  <div
                    key={item.id}
                    className="border border-white/10 p-4 flex gap-4 items-start group hover:border-white/20 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-14 flex-shrink-0 bg-white/5 overflow-hidden">
                      {thumb && (
                        <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 border ${
                          item.active
                            ? "border-green-500/40 text-green-400"
                            : "border-white/20 text-white/30"
                        }`}>
                          {item.active ? "LIVE" : "HIDDEN"}
                        </span>
                        <span className="font-mono text-[8px] tracking-widest text-white/30 uppercase">
                          {item.type}
                        </span>
                        <span className="font-mono text-[8px] tracking-widest text-white/30 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <p className="font-sans font-bold text-white text-sm uppercase tracking-wide truncate">
                        {item.title}
                      </p>
                      <p className="font-mono text-[8px] text-white/30 mt-1">
                        {new Date(item.dateAdded).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Active toggle */}
                      <button
                        onClick={() => toggleActive(item)}
                        className="font-mono text-[8px] tracking-widest uppercase border border-white/20 px-2 py-1 text-white/50 hover:text-white hover:border-white/50 transition-colors"
                        title={item.active ? "Hide from carousel" : "Show in carousel"}
                      >
                        {item.active ? "HIDE" : "SHOW"}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => startEdit(item)}
                        className="font-mono text-[8px] tracking-widest uppercase border border-white/20 px-2 py-1 text-white/50 hover:text-white hover:border-white/50 transition-colors"
                      >
                        EDIT
                      </button>

                      {/* Delete */}
                      {confirmDelete === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="font-mono text-[8px] tracking-widest uppercase border border-red-500/60 px-2 py-1 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                          >
                            {deletingId === item.id ? "..." : "CONFIRM"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="font-mono text-[8px] tracking-widest uppercase border border-white/10 px-2 py-1 text-white/30 hover:text-white transition-colors"
                          >
                            CANCEL
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(item.id)}
                          className="font-mono text-[8px] tracking-widest uppercase border border-white/20 px-2 py-1 text-white/50 hover:text-red-400 hover:border-red-500/40 transition-colors"
                        >
                          DELETE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ── Portal dashboard (tabs) ──────────────────────────────────────────────────

type Tab = "videos" | "photos" | "recent";
const TABS: { key: Tab; label: string; hint: string }[] = [
  { key: "videos", label: "VIDEOS", hint: "Videography page" },
  { key: "photos", label: "PHOTOS", hint: "Photography page + homepage gallery" },
  { key: "recent", label: "RECENT WORK", hint: "Homepage carousel" },
];

function PortalDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>(() => {
    try {
      const saved = localStorage.getItem("portal_tab") as Tab | null;
      return saved && TABS.some((t) => t.key === saved) ? saved : "videos";
    } catch {
      return "videos";
    }
  });

  function pick(t: Tab) {
    setTab(t);
    try {
      localStorage.setItem("portal_tab", t);
    } catch {
      /* ignore */
    }
  }

  async function handleLogout() {
    await apiFetch("/portal/logout", { method: "POST" });
    onLogout();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase">LUCA FILMS · PORTAL</span>
        <div className="flex items-center gap-6">
          <a href={`${BASE}/`} target="_blank" rel="noreferrer" className="font-mono text-[9px] tracking-widest text-white/40 uppercase hover:text-white transition-colors">
            VIEW SITE ↗
          </a>
          <button onClick={handleLogout} className="font-mono text-[9px] tracking-widest text-white/40 uppercase hover:text-white transition-colors">
            LOGOUT
          </button>
        </div>
      </div>

      <div className="border-b border-white/10 px-6">
        <div className="max-w-4xl mx-auto flex gap-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => pick(t.key)}
              className={`px-5 py-4 text-left border-b-2 transition-colors flex-shrink-0 ${
                tab === t.key ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              <span className="block font-mono text-[10px] tracking-widest uppercase">{t.label}</span>
              <span className="block font-mono text-[8px] tracking-widest uppercase text-white/30 mt-1">{t.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {tab === "videos" && <MediaManager kind="video" />}
        {tab === "photos" && <MediaManager kind="photo" />}
        {tab === "recent" && <RecentWorkManager />}
      </div>
    </div>
  );
}

// ── Main portal page ─────────────────────────────────────────────────────────

export default function PortalPage() {
  const [authState, setAuthState] = useState<"loading" | "unauthenticated" | "authenticated">("loading");

  useEffect(() => {
    apiFetch("/portal/auth").then(({ data }) => {
      setAuthState(data?.authenticated ? "authenticated" : "unauthenticated");
    });
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="font-mono text-[10px] tracking-widest text-white/20 uppercase">LOADING...</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {authState === "unauthenticated" ? (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LoginScreen onLogin={() => setAuthState("authenticated")} />
        </motion.div>
      ) : (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <PortalDashboard onLogout={() => setAuthState("unauthenticated")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
