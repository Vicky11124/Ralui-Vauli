// Remembers the most recent server-side error so server.ts can log it when
// the framework swallows an exception into a generic 500 response.
let lastCapturedError: unknown;

export function captureError(error: unknown) {
  lastCapturedError = error;
}

export function consumeLastCapturedError(): unknown {
  const error = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}

const g = globalThis as {
  addEventListener?: (type: string, listener: (event: any) => void) => void;
};

if (typeof g.addEventListener === "function") {
  g.addEventListener("error", (event) => captureError(event?.error ?? event));
  g.addEventListener("unhandledrejection", (event) => captureError(event?.reason ?? event));
}
