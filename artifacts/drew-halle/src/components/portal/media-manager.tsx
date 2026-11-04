import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  PHOTO_CATEGORIES,
  VIDEO_CATEGORIES,
  optimizeImage,
  parseImageUrls,
  parseYouTube,
  youTubeId,
  type Aspect,
  type MediaItem,
  type MediaKind,
} from "@/lib/media";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── Shared styles ────────────────────────────────────────────────────────────

const LABEL = "block font-mono text-[9px] tracking-widest text-white/40 uppercase mb-2";
const INPUT =
  "w-full bg-transparent border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-white/60 focus:outline-none transition-colors placeholder:text-white/20";
const SELECT =
  "w-full bg-black border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-white/60 focus:outline-none transition-colors";
const SMALL_BTN =
  "font-mono text-[8px] tracking-widest uppercase border border-white/20 px-2 py-1 text-white/50 hover:text-white hover:border-white/50 transition-colors disabled:opacity-30 disabled:pointer-events-none";
const PRIMARY_BTN =
  "border border-white/30 px-8 py-3 font-mono text-[10px] tracking-widest text-white uppercase hover:border-white hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none";

function labelFor(kind: MediaKind, key: string) {
  const list = kind === "video" ? VIDEO_CATEGORIES : PHOTO_CATEGORIES;
  return list.find((c) => c.key === key)?.label.replace("\n", " ") ?? key.toUpperCase();
}

function thumbFor(item: Pick<MediaItem, "kind" | "src">) {
  if (item.kind === "video") {
    const id = youTubeId(item.src);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
  }
  return optimizeImage(item.src, 300);
}

function AspectToggle({ value, onChange }: { value: Aspect; onChange: (a: Aspect) => void }) {
  return (
    <div className="flex">
      {(
        [
          ["16/9", "HORIZONTAL 16:9"],
          ["9/16", "VERTICAL 9:16"],
        ] as const
      ).map(([a, label]) => (
        <button
          key={a}
          type="button"
          onClick={() => onChange(a)}
          className={`px-4 py-2 font-mono text-[9px] tracking-widest uppercase border transition-colors ${
            value === a ? "bg-white text-black border-white" : "text-white/40 border-white/20 hover:border-white/40"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Add forms ────────────────────────────────────────────────────────────────

function AddVideoForm({ onAdded }: { onAdded: (category: string) => void }) {
  const [pasted, setPasted] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(VIDEO_CATEGORIES[0].key);
  const [aspect, setAspect] = useState<Aspect>("16/9");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const parsed = useMemo(() => parseYouTube(pasted), [pasted]);
  // When a new link is pasted, adopt its detected orientation (still overridable).
  useEffect(() => {
    if (parsed) setAspect(parsed.aspect);
  }, [parsed?.id, parsed?.aspect]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!parsed) return;
    setSaving(true);
    setStatus(null);
    const { ok, data } = await api("/portal/media", {
      method: "POST",
      body: JSON.stringify({ kind: "video", category, title, src: parsed.embedSrc, aspect }),
    });
    setSaving(false);
    if (ok) {
      setStatus({ ok: true, msg: `ADDED TO ${labelFor("video", category)} — IT'S LIVE` });
      setPasted("");
      setTitle("");
      onAdded(category);
    } else {
      setStatus({ ok: false, msg: data?.error || "FAILED TO SAVE" });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className={LABEL}>
          YOUTUBE EMBED CODE OR LINK <span className="text-white/20">— paste the &lt;iframe&gt; code, a watch link, youtu.be or /shorts/</span>
        </label>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={3}
          required
          className={`${INPUT} resize-y`}
          placeholder={'<iframe width="560" height="315" src="https://www.youtube.com/embed/…'}
        />
        {pasted.trim() && !parsed && (
          <p className="mt-2 font-mono text-[9px] tracking-widest text-red-400 uppercase">
            COULDN'T FIND A YOUTUBE VIDEO IN THAT
          </p>
        )}
      </div>

      {parsed && (
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className={`bg-white/5 overflow-hidden flex-shrink-0 ${aspect === "9/16" ? "w-28 aspect-[9/16]" : "w-56 aspect-video"}`}>
            <img src={`https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <p className={LABEL}>ORIENTATION</p>
            <AspectToggle value={aspect} onChange={setAspect} />
            <p className="font-mono text-[8px] tracking-widest text-white/30 uppercase">
              AUTO-DETECTED — SWITCH IF IT LOOKS WRONG
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={LABEL}>TITLE</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={INPUT} placeholder="Two Door Cinema Club" />
        </div>
        <div>
          <label className={LABEL}>SECTION</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={SELECT}>
            {VIDEO_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label.replace("\n", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {status && (
        <p className={`font-mono text-[9px] tracking-widest uppercase ${status.ok ? "text-green-400" : "text-red-400"}`}>{status.msg}</p>
      )}
      <button type="submit" disabled={saving || !parsed || !title.trim()} className={PRIMARY_BTN}>
        {saving ? "SAVING…" : "ADD VIDEO"}
      </button>
    </form>
  );
}

function AddPhotosForm({ onAdded }: { onAdded: (category: string) => void }) {
  const [pasted, setPasted] = useState("");
  const [category, setCategory] = useState<string>(PHOTO_CATEGORIES[0].key);
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const urls = useMemo(() => parseImageUrls(pasted), [pasted]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (urls.length === 0) return;
    setSaving(true);
    setStatus(null);
    const fallback = `${artist.trim() || labelFor("photo", category)} photo by Luca Mariani`;
    const items = urls.map((src) => ({
      kind: "photo",
      category,
      src,
      title: description.trim() || fallback,
      artist: artist.trim() ? artist.trim().toUpperCase() : null,
      featured,
    }));
    const { ok, data } = await api("/portal/media", { method: "POST", body: JSON.stringify({ items }) });
    setSaving(false);
    if (ok) {
      setStatus({ ok: true, msg: `ADDED ${urls.length} PHOTO${urls.length === 1 ? "" : "S"} TO ${labelFor("photo", category)} — LIVE` });
      setPasted("");
      onAdded(category);
    } else {
      setStatus({ ok: false, msg: data?.error || "FAILED TO SAVE" });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className={LABEL}>
          IMAGE LINKS <span className="text-white/20">— paste one or many (one per line). Cloudinary links get auto-optimized.</span>
        </label>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={4}
          required
          className={`${INPUT} resize-y`}
          placeholder={"https://res.cloudinary.com/…/photo1.jpg\nhttps://res.cloudinary.com/…/photo2.jpg"}
        />
        {pasted.trim() && urls.length === 0 && (
          <p className="mt-2 font-mono text-[9px] tracking-widest text-red-400 uppercase">NO https:// IMAGE LINKS FOUND</p>
        )}
      </div>

      {urls.length > 0 && (
        <div>
          <p className={LABEL}>{urls.length} PHOTO{urls.length === 1 ? "" : "S"} READY</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {urls.slice(0, 24).map((u) => (
              <div key={u} className="aspect-square bg-white/5 overflow-hidden">
                <img src={optimizeImage(u, 300)} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={LABEL}>SECTION</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={SELECT}>
            {PHOTO_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>
            ARTIST / TAG <span className="text-white/20">— optional, shown on the photo</span>
          </label>
          <input value={artist} onChange={(e) => setArtist(e.target.value)} className={INPUT} placeholder="LORD HURON" />
        </div>
      </div>
      <div>
        <label className={LABEL}>
          DESCRIPTION <span className="text-white/20">— optional, for Google/accessibility</span>
        </label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className={INPUT} placeholder="Lord Huron live at The Salt Shed" />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-white" />
        <span className="font-mono text-[9px] tracking-widest text-white/60 uppercase">ALSO SHOW IN HOMEPAGE GALLERY <span className="text-white/30">— NEWEST 8 SHOW</span></span>
      </label>

      {status && (
        <p className={`font-mono text-[9px] tracking-widest uppercase ${status.ok ? "text-green-400" : "text-red-400"}`}>{status.msg}</p>
      )}
      <button type="submit" disabled={saving || urls.length === 0} className={PRIMARY_BTN}>
        {saving ? "SAVING…" : `ADD ${urls.length || ""} PHOTO${urls.length === 1 ? "" : "S"}`}
      </button>
    </form>
  );
}

// ── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  isFirst,
  isLast,
  onMove,
  onChanged,
}: {
  item: MediaItem;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ ...item });
  const categories = item.kind === "video" ? VIDEO_CATEGORIES : PHOTO_CATEGORIES;

  async function patch(body: Partial<MediaItem>) {
    setBusy(true);
    setError("");
    const { ok, data } = await api(`/portal/media/${item.id}`, { method: "PATCH", body: JSON.stringify(body) });
    setBusy(false);
    if (!ok) {
      setError(data?.error || "FAILED TO SAVE");
      return false;
    }
    onChanged();
    return true;
  }

  async function saveEdit() {
    let src = draft.src.trim();
    if (item.kind === "video") {
      const parsed = parseYouTube(src);
      if (!parsed) {
        setError("COULDN'T FIND A YOUTUBE VIDEO IN THAT LINK");
        return;
      }
      // Keep the existing embed URL if it's the same video, otherwise use the clean one.
      src = youTubeId(item.src) === parsed.id ? item.src : parsed.embedSrc;
    }
    const ok = await patch({
      title: draft.title,
      category: draft.category,
      src,
      aspect: draft.aspect,
      artist: draft.artist,
      featured: draft.featured,
    });
    if (ok) setEditing(false);
  }

  async function remove() {
    setBusy(true);
    const { ok } = await api(`/portal/media/${item.id}`, { method: "DELETE" });
    setBusy(false);
    if (ok) onChanged();
  }

  const thumb = thumbFor(item);

  return (
    <div className={`border p-3 transition-colors ${item.active ? "border-white/10 hover:border-white/20" : "border-white/5 opacity-60"}`}>
      <div className="flex gap-3 items-center">
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button onClick={() => onMove(-1)} disabled={isFirst || busy} className={SMALL_BTN} aria-label="Move up">↑</button>
          <button onClick={() => onMove(1)} disabled={isLast || busy} className={SMALL_BTN} aria-label="Move down">↓</button>
        </div>
        <div className={`flex-shrink-0 bg-white/5 overflow-hidden ${item.kind === "video" && item.aspect === "9/16" ? "w-9 h-16" : "w-24 h-16"}`}>
          {thumb && <img src={thumb} alt="" loading="lazy" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {!item.active && <span className="font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 border border-white/20 text-white/40">HIDDEN</span>}
            {item.kind === "video" && item.aspect === "9/16" && (
              <span className="font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 border border-white/20 text-white/40">VERTICAL</span>
            )}
            {item.featured && <span className="font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 border border-green-500/40 text-green-400">HOMEPAGE</span>}
            {item.artist && <span className="font-mono text-[8px] tracking-widest uppercase text-white/30">{item.artist}</span>}
          </div>
          <p className="font-sans font-bold text-white text-sm uppercase tracking-wide truncate">{item.title || "(untitled)"}</p>
        </div>
        <div className="flex flex-wrap justify-end items-center gap-1.5 flex-shrink-0 max-w-[45%]">
          <button onClick={() => patch({ active: !item.active })} disabled={busy} className={SMALL_BTN}>
            {item.active ? "HIDE" : "SHOW"}
          </button>
          <button onClick={() => { setDraft({ ...item }); setEditing(!editing); setError(""); }} className={SMALL_BTN}>
            {editing ? "CLOSE" : "EDIT"}
          </button>
          {confirmDelete ? (
            <>
              <button onClick={remove} disabled={busy} className={`${SMALL_BTN} !border-red-500/60 !text-red-400`}>{busy ? "…" : "CONFIRM"}</button>
              <button onClick={() => setConfirmDelete(false)} className={SMALL_BTN}>NO</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className={`${SMALL_BTN} hover:!text-red-400 hover:!border-red-500/40`}>DELETE</button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>{item.kind === "video" ? "TITLE" : "DESCRIPTION"}</label>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>SECTION</label>
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={SELECT}>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{c.label.replace("\n", " ")}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>{item.kind === "video" ? "YOUTUBE LINK OR EMBED CODE" : "IMAGE LINK"}</label>
            <input value={draft.src} onChange={(e) => setDraft({ ...draft, src: e.target.value })} className={INPUT} />
          </div>
          {item.kind === "video" ? (
            <div>
              <p className={LABEL}>ORIENTATION</p>
              <AspectToggle value={draft.aspect} onChange={(a) => setDraft({ ...draft, aspect: a })} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className={LABEL}>ARTIST / TAG</label>
                <input value={draft.artist ?? ""} onChange={(e) => setDraft({ ...draft, artist: e.target.value.toUpperCase() || null })} className={INPUT} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer pb-3">
                <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} className="w-4 h-4 accent-white" />
                <span className="font-mono text-[9px] tracking-widest text-white/60 uppercase">SHOW IN HOMEPAGE GALLERY</span>
              </label>
            </div>
          )}
          <button onClick={saveEdit} disabled={busy} className={PRIMARY_BTN}>{busy ? "SAVING…" : "SAVE CHANGES"}</button>
        </div>
      )}
      {error && <p className="mt-2 font-mono text-[9px] tracking-widest text-red-400 uppercase">{error}</p>}
    </div>
  );
}

// ── Manager ──────────────────────────────────────────────────────────────────

export default function MediaManager({ kind }: { kind: MediaKind }) {
  const queryClient = useQueryClient();
  const categories = kind === "video" ? VIDEO_CATEGORIES : PHOTO_CATEGORIES;
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeCat, setActiveCat] = useState<string>(categories[0].key);

  async function load() {
    const { ok, data } = await api("/portal/media");
    if (ok && Array.isArray(data)) {
      setItems((data as MediaItem[]).filter((m) => m.kind === kind));
      setLoadError(false);
    } else {
      setLoadError(true);
    }
    setLoading(false);
    // Make the public pages refetch so changes show immediately in this browser.
    queryClient.invalidateQueries({ queryKey: ["media"] });
  }

  useEffect(() => {
    setLoading(true);
    setActiveCat(categories[0].key);
    load();
  }, [kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const inCat = items
    .filter((m) => m.category === activeCat)
    .sort((a, b) => a.position - b.position || a.id - b.id);

  async function move(index: number, dir: -1 | 1) {
    const next = [...inCat];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    // Optimistic: update positions locally, then persist.
    const positions = new Map(next.map((m, i) => [m.id, i]));
    setItems((all) => all.map((m) => (positions.has(m.id) ? { ...m, position: positions.get(m.id)! } : m)));
    const { ok } = await api("/portal/media/reorder", { method: "POST", body: JSON.stringify({ ids: next.map((m) => m.id) }) });
    if (!ok) load();
    else queryClient.invalidateQueries({ queryKey: ["media"] });
  }

  const sitePath = kind === "video" ? "/videography" : "/photography";

  return (
    <div className="space-y-16">
      <section>
        <h2 className="font-sans text-2xl font-black tracking-widest uppercase mb-8">
          {kind === "video" ? "ADD VIDEO" : "ADD PHOTOS"}
        </h2>
        {kind === "video" ? (
          <AddVideoForm onAdded={(c) => { setActiveCat(c); load(); }} />
        ) : (
          <AddPhotosForm onAdded={(c) => { setActiveCat(c); load(); }} />
        )}
      </section>

      <section>
        <div className="flex items-end justify-between mb-6 gap-4">
          <h2 className="font-sans text-2xl font-black tracking-widest uppercase">
            {kind === "video" ? "YOUR VIDEOS" : "YOUR PHOTOS"}
          </h2>
          <a href={`${BASE}${sitePath}`} target="_blank" rel="noreferrer" className="font-mono text-[9px] tracking-widest text-white/40 uppercase hover:text-white transition-colors">
            VIEW ON SITE ↗
          </a>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => {
            const count = items.filter((m) => m.category === c.key).length;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={`font-mono text-[9px] tracking-widest uppercase px-3 py-2 border transition-colors ${
                  activeCat === c.key ? "border-white text-white bg-white/10" : "border-white/20 text-white/40 hover:border-white/50"
                }`}
              >
                {c.label.replace("\n", " ")} · {count}
              </button>
            );
          })}
        </div>

        <p className="font-mono text-[8px] tracking-widest text-white/30 uppercase mb-4">
          TOP OF THE LIST = FIRST ON THE SITE · CHANGES GO LIVE IN UNDER A MINUTE
        </p>

        {loading ? (
          <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase">LOADING…</p>
        ) : loadError ? (
          <p className="font-mono text-[10px] tracking-widest text-red-400 uppercase">COULDN'T LOAD — REFRESH THE PAGE</p>
        ) : inCat.length === 0 ? (
          <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
            NOTHING HERE YET — THIS SECTION IS HIDDEN ON THE SITE UNTIL YOU ADD SOMETHING
          </p>
        ) : (
          <div className="space-y-2">
            {inCat.map((item, i) => (
              <ItemRow key={item.id} item={item} isFirst={i === 0} isLast={i === inCat.length - 1} onMove={(d) => move(i, d)} onChanged={load} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
