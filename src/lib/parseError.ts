export function parseError(err: unknown): string {
  const msg = (err as Error).message ?? String(err);
  const match = msg.match(/Uncaught Error: (.+?)(?:\n|$)/) || msg.match(/Server Error (.+?)(?:\n|$)/);
  return match ? match[1] : msg.replace(/\[CONVEX.*?\]/g, "").trim();
}
