import { isAllowlistedEmail, normalizeEmail } from "../../lib/allowlist.js";
import { recordVote } from "../../lib/election-store.js";
import {
  CANDIDATE_IDS,
  REQUIRED_SELECTIONS,
} from "../../lib/election-config.js";
import { json, readJsonBody, setVotedCookie } from "../../lib/http.js";

function validateChoices(raw) {
  if (!Array.isArray(raw)) return null;
  const ids = [...new Set(raw.map(String))];
  if (ids.length !== REQUIRED_SELECTIONS) return null;
  if (!ids.every((id) => CANDIDATE_IDS.has(id))) return null;
  return ids;
}

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
    const choices = validateChoices(body.candidates);
    if (!choices) {
      return json(res, 400, {
        ok: false,
        error: "invalid_selection",
        message: `Select exactly ${REQUIRED_SELECTIONS} candidates.`,
      });
    }
    const result = await recordVote(email, choices);
    if (!result.ok) {
      const status = result.error === "already_voted" ? 409 : 503;
      return json(res, status, { ok: false, error: result.error });
    }
    setVotedCookie(res);
    return json(res, 200, { ok: true });
  } catch {
    return json(res, 400, { ok: false, error: "invalid_request" });
  }
}
