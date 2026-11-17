import { useLoaderData } from "@tanstack/react-router";

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
