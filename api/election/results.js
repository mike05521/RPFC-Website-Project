import { loadState, publicResults } from "../../lib/election-store.js";
import { CANDIDATES } from "../../lib/election-config.js";
import { json, readJsonBody } from "../../lib/http.js";

function checkPassword(provided) {
  const expected = process.env.RPFC_BOARD_ELECTION_PASSWORD;
  if (!expected) return false;
  return String(provided) === expected;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }
  try {
    const body = await readJsonBody(req);
    if (!checkPassword(body.password)) {
      return json(res, 401, { ok: false, error: "unauthorized" });
    }
    const state = await loadState();
    const results = publicResults(state);
    const talliesWithNames = CANDIDATES.map((c) => ({
      id: c.id,
      name: c.name,
      votes: results.tallies[c.id] || 0,
    })).sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));
    return json(res, 200, {
      ok: true,
      electionId: results.electionId,
      totalBallots: results.totalBallots,
      tallies: talliesWithNames,
      voters: results.voters,
      note: "Individual ballot choices are not stored; only aggregate tallies and voter email addresses.",
    });
  } catch {
    return json(res, 400, { ok: false, error: "invalid_request" });
  }
}
