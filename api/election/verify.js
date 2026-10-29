import { isAllowlistedEmail, normalizeEmail } from "../../lib/allowlist.js";
import { loadState } from "../../lib/election-store.js";
import { json, readJsonBody } from "../../lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }
  try {
    const body = await readJsonBody(req);
    const email = normalizeEmail(body.email);
    if (!isAllowlistedEmail(email)) {
      return json(res, 403, { ok: false, error: "not_allowlisted" });
    }
    const state = await loadState();
    const alreadyVoted = Boolean(state.voters[email]);
    return json(res, 200, { ok: true, alreadyVoted });
  } catch {
    return json(res, 400, { ok: false, error: "invalid_request" });
  }
}
