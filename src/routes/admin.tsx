import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import logoOlive from "@/assets/logo-olive.png";
import { LeadsManager } from "@/components/admin/leads-manager";
import { LookbookManager } from "@/components/admin/lookbook-manager";
import {
  adminSignIn,
  adminSignOut,
  deletePiece,
  getAdminSession,
  getLeads,
  getSiteData,
  movePiece,
  savePiece,
  saveSettings,
  setPieceCategory,
} from "@/lib/api";
import { formatBytes, optimiseImage, type OptimisedImage } from "@/lib/optimize-image";
import { CATEGORIES, categoryLabel, whatsappLink, type CategoryId, type Piece, type SiteData } from "@/lib/site-data";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — RALUI VALUI" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  loader: async () => {
    const session = await getAdminSession();
    const site = session.signedIn ? await getSiteData() : null;
    return { session, site };
  },
  staleTime: 0,
  component: AdminPage,
});

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong. Please try again.");

function AdminPage() {
  const { session, site } = Route.useLoaderData();
  return (
    <div className="admin">
      {session.signedIn && site ? <Dashboard initial={site} storage={session.storage} /> : <SignIn configured={session.configured} />}
    </div>
  );
}

/* ---------------------------------------------------------------- sign in --------------------- */

function SignIn({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminSignIn({ data: { password } });
      await router.invalidate();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-signin">
      <form className="admin-signin__card" onSubmit={submit}>
        <img src={logoOlive} alt="RALUI VALUI" width={976} height={109} />
        <h1>Site admin</h1>
        {configured ? (
          <>
            <label className="admin-field">
              <span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus required />
            </label>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="admin-button admin-button--primary" type="submit" disabled={busy}>
              {busy ? <Loader2 className="spin" aria-hidden="true" /> : null} Sign in
            </button>
          </>
        ) : (
          <p className="admin-error">
            The admin password isn't set yet. Add <code>ADMIN_PASSWORD</code> (at least 8 characters) to the environment
            variables, then reload this page.
          </p>
        )}
        <Link className="admin-signin__back" to="/">
          <ArrowLeft aria-hidden="true" /> Back to the website
        </Link>
      </form>
    </main>
  );
}

/* ---------------------------------------------------------------- dashboard ------------------- */

type Notice = { kind: "ok" | "error"; text: string } | null;

function Dashboard({ initial, storage }: { initial: SiteData; storage: "blob" | "local" | "missing" }) {
  const router = useRouter();
  const [site, setSite] = useState(initial);
  const [tab, setTab] = useState<"pieces" | "lookbook" | "leads" | "settings">("pieces");
  const [notice, setNotice] = useState<Notice>(null);
  const [newLeads, setNewLeads] = useState<number | null>(null);

  // Count of new leads for the tab badge (the Leads tab keeps it up to date once opened).
  useEffect(() => {
    getLeads()
      .then((leads) => setNewLeads(leads.filter((l) => l.status === "new").length))
      .catch(() => setNewLeads(null));
  }, []);
  const onLeadCount = useCallback((count: number) => setNewLeads(count), []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), notice.kind === "ok" ? 3500 : 8000);
    return () => clearTimeout(timer);
  }, [notice]);

  /** Every change returns the full saved data; refresh public pages so they show it too. */
  const applied = (next: SiteData, text: string) => {
    setSite(next);
    setNotice({ kind: "ok", text });
    void router.invalidate();
  };
  const failed = (error: unknown) => setNotice({ kind: "error", text: errorMessage(error) });

  const signOut = async () => {
    await adminSignOut();
    await router.invalidate();
  };

  return (
    <>
      <header className="admin-bar">
        <img src={logoOlive} alt="RALUI VALUI" width={976} height={109} />
        <nav className="admin-tabs" aria-label="Admin sections">
          <button type="button" className={tab === "pieces" ? "is-active" : ""} onClick={() => setTab("pieces")}>
            Collection <span>{site.pieces.length}</span>
          </button>
          <button type="button" className={tab === "lookbook" ? "is-active" : ""} onClick={() => setTab("lookbook")}>
            Runway lookbook <span>{site.lookbook.length}</span>
          </button>
          <button type="button" className={tab === "leads" ? "is-active" : ""} onClick={() => setTab("leads")}>
            Leads {newLeads ? <span className="admin-tabs__alert">{newLeads} new</span> : null}
          </button>
          <button type="button" className={tab === "settings" ? "is-active" : ""} onClick={() => setTab("settings")}>
            Settings
          </button>
        </nav>
        <div className="admin-bar__actions">
          <a className="admin-button" href="/collections" target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" /> View site
          </a>
          <button type="button" className="admin-button" onClick={signOut}>
            <LogOut aria-hidden="true" /> Sign out
          </button>
        </div>
      </header>

      {storage === "local" && (
        <p className="admin-banner">
          Development mode: uploads are saved on this computer (<code>public/uploads</code>, <code>.data/site.json</code>). On
          Vercel they're saved to Vercel Blob.
        </p>
      )}
      {storage === "missing" && (
        <p className="admin-banner admin-banner--error">
          Image storage isn't connected, so changes can't be saved. In Vercel: Storage → Create → Blob → connect to this
          project, then redeploy.
        </p>
      )}

      <main className="admin-main">
        {tab === "pieces" && <PiecesManager site={site} onApplied={applied} onFailed={failed} />}
        {tab === "lookbook" && <LookbookManager site={site} onApplied={applied} onFailed={failed} />}
        {tab === "leads" && <LeadsManager onCountChange={onLeadCount} onFailed={failed} />}
        {tab === "settings" && <SettingsForm site={site} onApplied={applied} onFailed={failed} />}
      </main>

      {notice && (
        <div className={`admin-toast admin-toast--${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
          {notice.text}
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
            <X aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}

type Handlers = { onApplied: (site: SiteData, text: string) => void; onFailed: (error: unknown) => void };

/* ---------------------------------------------------------------- pieces ---------------------- */

function PiecesManager({ site, onApplied, onFailed }: { site: SiteData } & Handlers) {
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Piece | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkCategory, setBulkCategory] = useState<CategoryId>("clothing");
  const [bulk, setBulk] = useState<{ name: string; state: "waiting" | "working" | "done" | "error"; detail?: string }[]>([]);
  const bulkInput = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => (filter === "all" ? site.pieces : site.pieces.filter((p) => p.category === filter)),
    [site.pieces, filter],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const featuredCount = site.pieces.filter((p) => p.featured).length;

  const run = async (id: string, action: () => Promise<SiteData>, text: string) => {
    setBusyId(id);
    try {
      onApplied(await action(), text);
    } catch (error) {
      onFailed(error);
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = (piece: Piece) => {
    const form = pieceForm(piece);
    form.set("featured", String(!piece.featured));
    return run(piece.id, () => savePiece({ data: form }), piece.featured ? "Removed from the home page." : "Shown on the home page.");
  };

  const remove = (piece: Piece) => {
    if (!window.confirm(`Delete "${piece.title}"? Its image will be removed too. This can't be undone.`)) return;
    return run(piece.id, () => deletePiece({ data: { id: piece.id } }), "Piece deleted.");
  };

  /** Add several photos at once: each becomes a piece named after its file, ready to edit. */
  const bulkAdd = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setBulk(list.map((f) => ({ name: f.name, state: "waiting" })));
    let latest: SiteData | null = null;
    for (const [index, file] of list.entries()) {
      setBulk((rows) => rows.map((r, i) => (i === index ? { ...r, state: "working" } : r)));
      try {
        const optimised = await optimiseImage(file);
        const form = new FormData();
        form.set("title", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "New piece");
        form.set("category", bulkCategory);
        form.set("fabric", "");
        form.set("description", "");
        form.set("featured", "false");
        form.set("image", optimised.file);
        form.set("width", String(optimised.width));
        form.set("height", String(optimised.height));
        latest = await savePiece({ data: form });
        URL.revokeObjectURL(optimised.previewUrl);
        setBulk((rows) =>
          rows.map((r, i) => (i === index ? { ...r, state: "done", detail: `${formatBytes(file.size)} → ${formatBytes(optimised.file.size)}` } : r)),
        );
      } catch (error) {
        setBulk((rows) => rows.map((r, i) => (i === index ? { ...r, state: "error", detail: errorMessage(error) } : r)));
      }
    }
    if (latest) onApplied(latest, "Photos added. Give each piece a name and details with Edit.");
    setFilter("all");
    setPage(1);
  };

  return (
    <section aria-labelledby="pieces-title">
      <div className="admin-head">
        <div>
          <h1 id="pieces-title">Collection pieces</h1>
          <p>
            These appear on the Collections page, newest first. Star up to three to show them in the home page collection
            panel ({featuredCount} starred).
          </p>
        </div>
        <div className="admin-head__actions">
          <button type="button" className="admin-button admin-button--primary" onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" /> Add a piece
          </button>
        </div>
      </div>

      <div
        className="admin-dropzone admin-dropzone--bulk"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          void bulkAdd(e.dataTransfer.files);
        }}
      >
        <Upload aria-hidden="true" />
        <div>
          <strong>Quick upload</strong>
          <span>Drop several photos here, or choose them. Each one is optimised and added as a new piece in</span>
        </div>
        <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value as CategoryId)} aria-label="Category for quick upload">
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <button type="button" className="admin-button" onClick={() => bulkInput.current?.click()}>
          Choose photos
        </button>
        <input
          ref={bulkInput}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void bulkAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {bulk.length > 0 && (
        <ul className="admin-bulk">
          {bulk.map((row, i) => (
            <li key={`${row.name}-${i}`} className={`is-${row.state}`}>
              {row.state === "working" && <Loader2 className="spin" aria-hidden="true" />}
              <span>{row.name}</span>
              <em>{row.state === "waiting" ? "Waiting" : row.state === "working" ? "Optimising & uploading…" : row.detail}</em>
            </li>
          ))}
          {bulk.every((r) => r.state === "done" || r.state === "error") && (
            <li className="admin-bulk__close">
              <button type="button" onClick={() => setBulk([])}>
                Clear list
              </button>
            </li>
          )}
        </ul>
      )}

      <div className="admin-filters" role="toolbar" aria-label="Filter pieces">
        {[{ id: "all" as const, short: "All" }, ...CATEGORIES].map((c) => (
          <button
            type="button"
            key={c.id}
            className={filter === c.id ? "is-active" : ""}
            onClick={() => {
              setFilter(c.id);
              setPage(1);
            }}
          >
            {c.short} <span>{c.id === "all" ? site.pieces.length : site.pieces.filter((p) => p.category === c.id).length}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="admin-empty">No pieces here yet. Use “Add a piece” or Quick upload.</p>
      ) : (
        <ul className="admin-grid">
          {visible.map((piece) => {
            const index = site.pieces.indexOf(piece);
            const busy = busyId === piece.id;
            return (
              <li key={piece.id} className={`admin-card${busy ? " is-busy" : ""}`}>
                <div className="admin-card__image">
                  <img src={piece.image} alt="" loading="lazy" />
                  <button
                    type="button"
                    className={`admin-card__star${piece.featured ? " is-on" : ""}`}
                    onClick={() => toggleFeatured(piece)}
                    disabled={busy}
                    aria-label={piece.featured ? "Remove from home page" : "Show on home page"}
                    title={piece.featured ? "Shown on home page" : "Show on home page"}
                  >
                    <Star aria-hidden="true" />
                  </button>
                  {busy && (
                    <span className="admin-card__busy">
                      <Loader2 className="spin" aria-hidden="true" />
                    </span>
                  )}
                </div>
                <div className="admin-card__body">
                  <h3>{piece.title}</h3>
                  <label className="admin-inline-select">
                    <span>Category</span>
                    <select
                      value={piece.category}
                      disabled={busy}
                      onChange={(e) => {
                        const category = e.target.value as CategoryId;
                        void run(piece.id, () => setPieceCategory({ data: { id: piece.id, category } }), `Moved to “${categoryLabel(category)}”.`);
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="admin-card__actions">
                  <button type="button" onClick={() => setEditing(piece)} disabled={busy}>
                    <Pencil aria-hidden="true" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => run(piece.id, () => movePiece({ data: { id: piece.id, direction: "up" } }), "Moved earlier.")}
                    disabled={busy || index === 0}
                    aria-label="Move earlier"
                    title="Move earlier"
                  >
                    <ArrowUp aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => run(piece.id, () => movePiece({ data: { id: piece.id, direction: "down" } }), "Moved later.")}
                    disabled={busy || index === site.pieces.length - 1}
                    aria-label="Move later"
                    title="Move later"
                  >
                    <ArrowDown aria-hidden="true" />
                  </button>
                  <button type="button" className="danger" onClick={() => remove(piece)} disabled={busy} aria-label="Delete" title="Delete">
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pageCount > 1 && (
        <nav className="admin-pagination" aria-label="Pages">
          <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page">
            <ArrowLeft aria-hidden="true" />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button type="button" key={n} className={n === current ? "is-active" : ""} aria-current={n === current ? "page" : undefined} onClick={() => setPage(n)}>
              {n}
            </button>
          ))}
          <button type="button" onClick={() => setPage(current + 1)} disabled={current === pageCount} aria-label="Next page">
            <ArrowRight aria-hidden="true" />
          </button>
          <span>
            {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
        </nav>
      )}

      {editing && (
        <PieceEditor
          piece={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(next, created) => {
            onApplied(next, created ? "Piece added to the collection." : "Changes saved.");
            setEditing(null);
            if (created) {
              setFilter("all");
              setPage(1);
            }
          }}
          onFailed={onFailed}
        />
      )}
    </section>
  );
}

function pieceForm(piece: Piece) {
  const form = new FormData();
  form.set("id", piece.id);
  form.set("title", piece.title);
  form.set("category", piece.category);
  form.set("fabric", piece.fabric);
  form.set("description", piece.description);
  form.set("featured", String(piece.featured));
  return form;
}

function PieceEditor({
  piece,
  onClose,
  onSaved,
  onFailed,
}: {
  piece: Piece | null;
  onClose: () => void;
  onSaved: (site: SiteData, created: boolean) => void;
  onFailed: (error: unknown) => void;
}) {
  const [title, setTitle] = useState(piece?.title ?? "");
  const [category, setCategory] = useState<CategoryId>(piece?.category ?? "clothing");
  const [fabric, setFabric] = useState(piece?.fabric ?? "");
  const [description, setDescription] = useState(piece?.description ?? "");
  const [featured, setFeatured] = useState(piece?.featured ?? false);
  const [image, setImage] = useState<OptimisedImage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => (image ? URL.revokeObjectURL(image.previewUrl) : undefined), [image]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setProcessing(true);
    setImageError("");
    try {
      setImage(await optimiseImage(file));
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim());
    } catch (error) {
      setImageError(errorMessage(error));
    } finally {
      setProcessing(false);
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!piece && !image) {
      setImageError("Add a photo for this piece.");
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      if (piece) form.set("id", piece.id);
      form.set("title", title);
      form.set("category", category);
      form.set("fabric", fabric);
      form.set("description", description);
      form.set("featured", String(featured));
      if (image) {
        form.set("image", image.file);
        form.set("width", String(image.width));
        form.set("height", String(image.height));
      }
      onSaved(await savePiece({ data: form }), !piece);
    } catch (error) {
      onFailed(error);
    } finally {
      setSaving(false);
    }
  };

  const preview = image?.previewUrl ?? piece?.image;

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title" onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <form className="admin-modal__panel" onSubmit={save}>
        <header>
          <h2 id="editor-title">{piece ? "Edit piece" : "Add a piece"}</h2>
          <button type="button" className="admin-icon" onClick={onClose} disabled={saving} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="admin-modal__body">
          <div
            className={`admin-dropzone${dragging ? " is-dragging" : ""}${preview ? " has-image" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void pick(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInput.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInput.current?.click()}
            aria-label={preview ? "Replace photo" : "Choose a photo"}
          >
            {preview && <img src={preview} alt="" />}
            <span className="admin-dropzone__hint">
              {processing ? (
                <>
                  <Loader2 className="spin" aria-hidden="true" /> Optimising…
                </>
              ) : (
                <>
                  <ImagePlus aria-hidden="true" /> {preview ? "Replace photo" : "Drop a photo or click to choose"}
                </>
              )}
            </span>
            <input ref={fileInput} type="file" accept="image/*,.heic,.heif" hidden onChange={(e) => void pick(e.target.files?.[0])} />
          </div>
          {image && (
            <p className="admin-optimised">
              Optimised: {formatBytes(image.originalBytes)} → <strong>{formatBytes(image.file.size)}</strong> · {image.width}×
              {image.height} · {image.file.type === "image/webp" ? "WebP" : "JPEG"}
            </p>
          )}
          {imageError && <p className="admin-error" role="alert">{imageError}</p>}

          <div className="admin-fields">
            <label className="admin-field">
              <span>Name</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required placeholder="e.g. Fern silk scarf" />
            </label>
            <label className="admin-field">
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Fabric</span>
              <input value={fabric} onChange={(e) => setFabric(e.target.value)} maxLength={60} placeholder="e.g. Silk, Cotton, Linen" list="fabric-options" />
              <datalist id="fabric-options">
                {["Silk", "Cotton", "Linen", "Silk blend", "Natural fibre"].map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </label>
            <label className="admin-field admin-field--wide">
              <span>Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} placeholder="A sentence or two about the piece." />
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Show on the home page collection panel
            </label>
          </div>
        </div>

        <footer>
          <button type="button" className="admin-button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="admin-button admin-button--primary" disabled={saving || processing}>
            {saving && <Loader2 className="spin" aria-hidden="true" />} {piece ? "Save changes" : "Add piece"}
          </button>
        </footer>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- settings -------------------- */

function SettingsForm({ site, onApplied, onFailed }: { site: SiteData } & Handlers) {
  const [number, setNumber] = useState(site.settings.whatsappNumber);
  const [message, setMessage] = useState(site.settings.whatsappMessage);
  const [saving, setSaving] = useState(false);
  const preview = whatsappLink({ whatsappNumber: number, whatsappMessage: message });

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      onApplied(await saveSettings({ data: { whatsappNumber: number, whatsappMessage: message } }), number ? "WhatsApp settings saved." : "WhatsApp turned off.");
    } catch (error) {
      onFailed(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="settings-title" className="admin-settings">
      <div className="admin-head">
        <div>
          <h1 id="settings-title">WhatsApp chat</h1>
          <p>
            Adds a WhatsApp button to every page, “Enquire on WhatsApp” on each piece, and sends Contact-page notes to
            WhatsApp. Leave the number empty to hide it.
          </p>
        </div>
      </div>
      <form className="admin-panel" onSubmit={save}>
        <label className="admin-field">
          <span>WhatsApp number (with country code)</span>
          <input value={number} onChange={(e) => setNumber(e.target.value)} inputMode="tel" placeholder="e.g. 91 70459 67404" />
        </label>
        <label className="admin-field">
          <span>Greeting visitors start with</span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={300} />
        </label>
        <div className="admin-panel__footer">
          {preview ? (
            <a className="admin-button" href={preview} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" /> Test this link
            </a>
          ) : (
            <span className="admin-muted">WhatsApp is currently hidden on the site.</span>
          )}
          <button type="submit" className="admin-button admin-button--primary" disabled={saving}>
            {saving && <Loader2 className="spin" aria-hidden="true" />} Save settings
          </button>
        </div>
      </form>
    </section>
  );
}
