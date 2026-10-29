export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

export function setVotedCookie(res) {
  const maxAge = 60 * 60 * 24 * 120;
  res.setHeader(
    "Set-Cookie",
    `rpfc_2027_ballot_voted=1; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure; HttpOnly`,
  );
}
