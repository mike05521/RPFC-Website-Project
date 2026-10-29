import allowlist from "../data/members-allowlist.json" with { type: "json" };

const SET = new Set(allowlist.map((e) => e.trim().toLowerCase()));

/** Case-insensitive check against members@riversidepilotsflyingclub.com export. */
export function isAllowlistedEmail(raw) {
  if (typeof raw !== "string") return false;
  const email = raw.trim().toLowerCase();
  if (!email || !email.includes("@")) return false;
  return SET.has(email);
}

export function normalizeEmail(raw) {
  return String(raw).trim().toLowerCase();
}

export { allowlist };
