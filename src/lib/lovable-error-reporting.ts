// Error reporting hook used by the root error boundary.
// In the original Lovable project this forwarded errors to Lovable's dashboard.
// Here it simply logs to the console; wire it to Sentry or similar if you like.
export function reportLovableError(error: unknown, context?: Record<string, unknown>) {
  console.error("[error-report]", error, context);
}
