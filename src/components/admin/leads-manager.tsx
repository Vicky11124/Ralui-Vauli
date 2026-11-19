import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Download, Loader2, MessageCircle, Phone, RefreshCw, RotateCcw, Trash2 } from "lucide-react";

import { getLeads, removeLead, updateLeadStatus } from "@/lib/api";
import { LEAD_SOURCES, type Lead, type LeadSource } from "@/lib/site-data";

const PAGE_SIZE = 15;

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong. Please try again.");

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** wa.me link to reply to a visitor who left a phone number (Indian numbers without a code get +91). */
function replyLink(lead: Lead) {
  let digits = (lead.phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 10) return null;
  const hello = `Hello${lead.name ? ` ${lead.name}` : ""}, thank you for contacting RALUI VALUI${lead.piece ? ` about "${lead.piece.title}"` : ""}.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(hello)}`;
}

function toCsv(leads: Lead[]) {
  const cell = (v: string | undefined) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Date", "Status", "Source", "Name", "Phone", "Topic", "Piece", "Message", "Page"];
  const rows = leads.map((l) =>
    [formatDate(l.createdAt), l.status, LEAD_SOURCES[l.source], l.name, l.phone, l.topic, l.piece?.title, l.message, l.page].map(cell).join(","),
  );
  return [head.join(","), ...rows].join("\r\n");
}

/**
 * Admin → Leads: every enquiry started on the website before the visitor continued in WhatsApp
 * (Contact-form notes, "Enquire on WhatsApp" on a piece, and WhatsApp button taps).
 */
export function LeadsManager({ onCountChange, onFailed }: { onCountChange: (newLeads: number) => void; onFailed: (error: unknown) => void }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"all" | Lead["status"]>("all");
  const [source, setSource] = useState<"all" | LeadSource>("all");
  const [page, setPage] = useState(1);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setLeads(await getLeads());
    } catch (error) {
      onFailed(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (leads) onCountChange(leads.filter((l) => l.status === "new").length);
  }, [leads, onCountChange]);

  const filtered = useMemo(
    () => (leads ?? []).filter((l) => (status === "all" || l.status === status) && (source === "all" || l.source === source)),
    [leads, status, source],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const key = (l: Lead) => `${l.createdAt}-${l.id}`;

  const act = async (lead: Lead, action: () => Promise<Lead[]>) => {
    setBusyKey(key(lead));
    try {
      setLeads(await action());
    } catch (error) {
      onFailed(error);
    } finally {
      setBusyKey(null);
    }
  };

  const download = () => {
    const blob = new Blob([`﻿${toCsv(filtered)}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ralui-valui-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = (leads ?? []).reduce(
    (acc, l) => ({ ...acc, [l.source]: (acc[l.source] ?? 0) + 1 }),
    {} as Partial<Record<LeadSource, number>>,
  );

  return (
    <section aria-labelledby="leads-title">
      <div className="admin-head">
        <div>
          <h1 id="leads-title">WhatsApp leads</h1>
          <p>
            Enquiries started on the website, newest first. WhatsApp doesn't share chats with websites, so this shows what
            visitors wrote or tapped here — reply to them from WhatsApp itself.
          </p>
        </div>
        <div className="admin-head__actions">
          <button type="button" className="admin-button" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />} Refresh
          </button>
          <button type="button" className="admin-button" onClick={download} disabled={!filtered.length}>
            <Download aria-hidden="true" /> Download CSV
          </button>
        </div>
      </div>

      <div className="admin-filters" role="toolbar" aria-label="Filter leads">
        {(["all", "new", "contacted"] as const).map((s) => (
          <button
            type="button"
            key={s}
            className={status === s ? "is-active" : ""}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
          >
            {s === "all" ? "All" : s === "new" ? "New" : "Contacted"}{" "}
            <span>{s === "all" ? (leads ?? []).length : (leads ?? []).filter((l) => l.status === s).length}</span>
          </button>
        ))}
        <span className="admin-filters__divider" aria-hidden="true" />
        {(["all", ...Object.keys(LEAD_SOURCES)] as ("all" | LeadSource)[]).map((s) => (
          <button
            type="button"
            key={s}
            className={source === s ? "is-active" : ""}
            onClick={() => {
              setSource(s);
              setPage(1);
            }}
          >
            {s === "all" ? "Every source" : LEAD_SOURCES[s]} {s !== "all" && <span>{counts[s] ?? 0}</span>}
          </button>
        ))}
      </div>

      {leads === null ? (
        <p className="admin-empty">
          <Loader2 className="spin" aria-hidden="true" /> Loading leads…
        </p>
      ) : visible.length === 0 ? (
        <p className="admin-empty">
          {leads.length === 0
            ? "No leads yet. They'll appear here as soon as visitors contact you through the website."
            : "No leads match these filters."}
        </p>
      ) : (
        <ul className="admin-leads">
          {visible.map((lead) => {
            const busy = busyKey === key(lead);
            const reply = replyLink(lead);
            return (
              <li key={key(lead)} className={`admin-lead admin-lead--${lead.status}${busy ? " is-busy" : ""}`}>
                <div className="admin-lead__top">
                  <span className={`admin-lead__badge admin-lead__badge--${lead.source}`}>{LEAD_SOURCES[lead.source]}</span>
                  {lead.status === "new" && <span className="admin-lead__new">New</span>}
                  <time dateTime={lead.createdAt}>{formatDate(lead.createdAt)}</time>
                </div>
                <h3>
                  {lead.name || (lead.source === "button" ? "Visitor tapped WhatsApp" : "Visitor")}
                  {lead.phone && <span> · {lead.phone}</span>}
                </h3>
                {lead.piece && (
                  <p className="admin-lead__meta">
                    Asked about: <strong>{lead.piece.title}</strong>
                  </p>
                )}
                {lead.topic && (
                  <p className="admin-lead__meta">
                    Topic: <strong>{lead.topic}</strong>
                  </p>
                )}
                {lead.message && <p className="admin-lead__message">{lead.message}</p>}
                <p className="admin-lead__page">From page: {lead.page}</p>
                <div className="admin-lead__actions">
                  {reply && (
                    <a className="admin-button admin-button--whatsapp" href={reply} target="_blank" rel="noreferrer">
                      <MessageCircle aria-hidden="true" /> Reply on WhatsApp
                    </a>
                  )}
                  {lead.phone && (
                    <a className="admin-button" href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}>
                      <Phone aria-hidden="true" /> Call
                    </a>
                  )}
                  {lead.status === "new" ? (
                    <button type="button" className="admin-button" disabled={busy} onClick={() => void act(lead, () => updateLeadStatus({ data: { id: lead.id, createdAt: lead.createdAt, status: "contacted" } }))}>
                      {busy ? <Loader2 className="spin" aria-hidden="true" /> : <Check aria-hidden="true" />} Mark contacted
                    </button>
                  ) : (
                    <button type="button" className="admin-button" disabled={busy} onClick={() => void act(lead, () => updateLeadStatus({ data: { id: lead.id, createdAt: lead.createdAt, status: "new" } }))}>
                      <RotateCcw aria-hidden="true" /> Mark as new
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-button admin-button--danger"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm("Delete this lead? This can't be undone.")) {
                        void act(lead, () => removeLead({ data: { id: lead.id, createdAt: lead.createdAt } }));
                      }
                    }}
                    aria-label="Delete lead"
                  >
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
    </section>
  );
}
