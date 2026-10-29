# Riverside Pilots Flying Club — Website

Member-facing club site (`index.html`) plus an **unpublished** 2027 board election ballot (not linked from the public homepage).

## Public site

Open `index.html` locally or deploy as static files. The main site uses club colors (navy `#0a2540`, blue `#0b6bcb`, sun `#ff7a33`, sky `#eaf3fe`) and **Instrument Sans** / **Sora** fonts.

## 2027 board election (unpublished)

| URL | Purpose |
|-----|---------|
| `/ballot/` or `/ballot/index.html` | Member ballot (email gate, pick **7 of 8** candidates) |
| `/ballot/results.html` | Board-only results (password protected) |

These pages are **not** in the public nav or footer on `index.html`. They use `noindex` meta tags and `X-Robots-Tag` headers.

### Candidates (exactly 7 of 8)

Bob Pring, Chris Marasco, Mike David, Troy Durbin, Larry Hopkins, Ron Becker, Brett Hyder, Kai Madison.

Rubin/Ruben Olvera is **not** on the ballot.

### Member allowlist

Voter emails are checked against `data/members-allowlist.json` (lowercase, case-insensitive match). The list is the Google Group export for `members@riversidepilotsflyingclub.com` (36 addresses), including:

- Role aliases: `secretary@`, `vp@`, `president@`, and `safety@riversidepilotsflyingclub.com`
- `michael@davidengineering.com`

**Do not link to the allowlist file from public pages.** On Vercel, `/data/*` is rewritten to 404 so the JSON is not served as a static download; verification runs only in serverless API routes.

### One vote per email

- Votes are recorded **server-side** (email → timestamp in `voters`; per-candidate counts in `tallies`).
- Individual candidate choices are **not** stored (secret ballot).
- After a successful vote, the API sets an HttpOnly cookie `rpfc_2027_ballot_voted` for browser UX.
- The same email **cannot** vote again even if cookies are cleared (`409 already_voted`).

### Board results

- `POST /api/election/results` with JSON `{ "password": "…" }` returns aggregate tallies and the list of voter emails (not their choices).
- Set environment variable **`RPFC_BOARD_ELECTION_PASSWORD`** on the host to the shared board password.
- Use `/ballot/results.html` to view results in the browser after entering that password.

### API routes (Vercel serverless)

| Route | Method | Body | Response |
|-------|--------|------|----------|
| `/api/election/verify` | POST | `{ "email" }` | `{ ok, alreadyVoted? }` |
| `/api/election/vote` | POST | `{ "email", "candidates": [7 ids] }` | `{ ok }` or error |
| `/api/election/results` | POST | `{ "password" }` | tallies + voters |

Candidate ids: `bob-pring`, `chris-marasco`, `mike-david`, `troy-durbin`, `larry-hopkins`, `ron-becker`, `brett-hyder`, `kai-madison`.

## Deployment (recommended: Vercel)

The ballot requires serverless functions and persistent storage.

1. Import this repo in [Vercel](https://vercel.com/) (or connect GitHub).
2. Add environment variable **`RPFC_BOARD_ELECTION_PASSWORD`** (Production and Preview as needed).
3. Deploy. Vercel provides **`BLOB_READ_WRITE_TOKEN`** automatically; election state is stored in a private Vercel Blob at `rpfc-election-2027/state.json`.

### Local development

```bash
npm install
npx vercel dev
```

Without `BLOB_READ_WRITE_TOKEN`, state is written to `.data/election-state.json` (gitignored).

Share the ballot URL directly with members, e.g. `https://www.riversidepilotsflyingclub.com/ballot/`.

## Images

Aircraft and gallery photos live under `images/`.
