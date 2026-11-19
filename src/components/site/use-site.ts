import { useLoaderData } from "@tanstack/react-router";

import { logLead } from "@/lib/api";
import { whatsappLink } from "@/lib/site-data";

/** Collection pieces and settings loaded once by the root route. */
export function useSiteData() {
  return useLoaderData({ from: "__root__" });
}

/** WhatsApp chat link for the configured number, or null if none is set yet. */
export function useWhatsApp(message?: string) {
  const { settings } = useSiteData();
  return whatsappLink(settings, message);
}

/**
 * Records a website enquiry for /admin → Leads as a visitor heads to WhatsApp. Fire-and-forget:
 * it never delays or blocks opening WhatsApp.
 */
export function trackLead(input: Omit<Parameters<typeof logLead>[0]["data"], "page">) {
  if (typeof window === "undefined") return;
  void logLead({ data: { ...input, page: window.location.pathname } }).catch(() => undefined);
}
