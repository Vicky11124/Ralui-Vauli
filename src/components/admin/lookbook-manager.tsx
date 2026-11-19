import { useMemo, useRef, useState, type DragEvent } from "react";
import { ArrowLeft, ArrowRight, Loader2, Trash2, Upload } from "lucide-react";

import { addLookbookPhoto, deleteLookbookPhoto, setLookbookPhotoSet } from "@/lib/api";
import { formatBytes, optimiseImage } from "@/lib/optimize-image";
import { LOOKBOOK_SETS, lookbookSetTitle, type LookbookSetId, type SiteData } from "@/lib/site-data";

const PAGE_SIZE = 16;

type Handlers = { onApplied: (site: SiteData, text: string) => void; onFailed: (error: unknown) => void };
type Row = { name: string; state: "waiting" | "working" | "done" | "error"; detail?: string };

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong. Please try again.");

/**
 * Admin → Runway lookbook: upload photos into a set, move photos between sets, delete.
 * The sets are the tabs visitors see on the Runway page.
 */
export function LookbookManager({ site, onApplied, onFailed }: { site: SiteData } & Handlers) {
  const [filter, setFilter] = useState<LookbookSetId | "all">("all");
  const [page, setPage] = useState(1);
  const [uploadSet, setUploadSet] = useState<LookbookSetId>(LOOKBOOK_SETS[0]!.id);
  const [rows, setRows] = useState<Row[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => (filter === "all" ? site.lookbook : site.lookbook.filter((p) => p.set === filter)),
    [site.lookbook, filter],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setRows(list.map((f) => ({ name: f.name, state: "waiting" })));
    let latest: SiteData | null = null;
    for (const [index, file] of list.entries()) {
      setRows((r) => r.map((row, i) => (i === index ? { ...row, state: "working" } : row)));
      try {
        const optimised = await optimiseImage(file);
        const form = new FormData();
        form.set("set", uploadSet);
        form.set("alt", `Runway look — ${lookbookSetTitle(uploadSet)}`);
        form.set("image", optimised.file);
        form.set("width", String(optimised.width));
        form.set("height", String(optimised.height));
        latest = await addLookbookPhoto({ data: form });
        URL.revokeObjectURL(optimised.previewUrl);
        setRows((r) =>
          r.map((row, i) => (i === index ? { ...row, state: "done", detail: `${formatBytes(file.size)} → ${formatBytes(optimised.file.size)}` } : row)),
        );
      } catch (error) {
        setRows((r) => r.map((row, i) => (i === index ? { ...row, state: "error", detail: errorMessage(error) } : row)));
      }
    }
    if (latest) onApplied(latest, `Added to “${lookbookSetTitle(uploadSet)}”.`);
    setFilter(uploadSet);
    setPage(1);
  };

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

  return (
    <section aria-labelledby="lookbook-title">
      <div className="admin-head">
        <div>
          <h1 id="lookbook-title">Runway lookbook</h1>
          <p>
            The photo gallery on the Runway page. Choose a set for each photo — sets appear as tabs for visitors, and a set
            with no photos is hidden.
          </p>
        </div>
      </div>

      <div
        className="admin-dropzone admin-dropzone--bulk"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          void upload(e.dataTransfer.files);
        }}
      >
        <Upload aria-hidden="true" />
        <div>
          <strong>Add runway photos</strong>
          <span>Drop photos here, or choose them. Each one is optimised and added to</span>
        </div>
        <select value={uploadSet} onChange={(e) => setUploadSet(e.target.value as LookbookSetId)} aria-label="Set for new photos">
          {LOOKBOOK_SETS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <button type="button" className="admin-button" onClick={() => input.current?.click()}>
          Choose photos
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {rows.length > 0 && (
        <ul className="admin-bulk">
          {rows.map((row, i) => (
            <li key={`${row.name}-${i}`} className={`is-${row.state}`}>
              {row.state === "working" && <Loader2 className="spin" aria-hidden="true" />}
              <span>{row.name}</span>
              <em>{row.state === "waiting" ? "Waiting" : row.state === "working" ? "Optimising & uploading…" : row.detail}</em>
            </li>
          ))}
          {rows.every((r) => r.state === "done" || r.state === "error") && (
            <li className="admin-bulk__close">
              <button type="button" onClick={() => setRows([])}>
                Clear list
              </button>
            </li>
          )}
        </ul>
      )}

      <div className="admin-filters" role="toolbar" aria-label="Filter by set">
        {[{ id: "all" as const, title: "All" }, ...LOOKBOOK_SETS].map((s) => (
          <button
            type="button"
            key={s.id}
            className={filter === s.id ? "is-active" : ""}
            onClick={() => {
              setFilter(s.id);
              setPage(1);
            }}
          >
            {s.title} <span>{s.id === "all" ? site.lookbook.length : site.lookbook.filter((p) => p.set === s.id).length}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="admin-empty">No photos in this set yet.</p>
      ) : (
        <ul className="admin-grid admin-grid--photos">
          {visible.map((item) => {
            const busy = busyId === item.id;
            return (
              <li key={item.id} className={`admin-card${busy ? " is-busy" : ""}`}>
                <div className="admin-card__image admin-card__image--tall">
                  <img src={item.image} alt="" loading="lazy" />
                  {busy && (
                    <span className="admin-card__busy">
                      <Loader2 className="spin" aria-hidden="true" />
                    </span>
                  )}
                </div>
                <div className="admin-card__body">
                  <label className="admin-inline-select">
                    <span>Set</span>
                    <select
                      value={item.set}
                      disabled={busy}
                      onChange={(e) => {
                        const set = e.target.value as LookbookSetId;
                        void run(item.id, () => setLookbookPhotoSet({ data: { id: item.id, set } }), `Moved to “${lookbookSetTitle(set)}”.`);
                      }}
                    >
                      {LOOKBOOK_SETS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="admin-card__actions">
                  <button
                    type="button"
                    className="danger"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm("Remove this photo from the runway lookbook? This can't be undone.")) {
                        void run(item.id, () => deleteLookbookPhoto({ data: { id: item.id } }), "Photo removed.");
                      }
                    }}
                  >
                    <Trash2 aria-hidden="true" /> Remove
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
    </section>
  );
}
