import { head, put } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";
import { BLOB_PATH } from "./election-config.js";

const LOCAL_STATE = path.join(process.cwd(), ".data", "election-state.json");

function defaultState() {
  return {
    electionId: "2027-board",
    tallies: {},
    voters: {},
  };
}

async function readLocalState() {
  try {
    const raw = await fs.readFile(LOCAL_STATE, "utf8");
    return JSON.parse(raw);
  } catch {
    return defaultState();
  }
}

async function writeLocalState(state) {
  await fs.mkdir(path.dirname(LOCAL_STATE), { recursive: true });
  await fs.writeFile(LOCAL_STATE, JSON.stringify(state, null, 2));
}

async function readBlobState() {
  try {
    const meta = await head(BLOB_PATH);
    const res = await fetch(meta.downloadUrl);
    if (!res.ok) return defaultState();
    const text = await res.text();
    return JSON.parse(text);
  } catch {
    return defaultState();
  }
}

async function writeBlobState(state) {
  await put(BLOB_PATH, JSON.stringify(state), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

function useLocalStore() {
  return !process.env.BLOB_READ_WRITE_TOKEN;
}

export async function loadState() {
  const state = useLocalStore() ? await readLocalState() : await readBlobState();
  if (!state.tallies) state.tallies = {};
  if (!state.voters) state.voters = {};
  return state;
}

export async function saveState(state) {
  if (useLocalStore()) {
    await writeLocalState(state);
  } else {
    await writeBlobState(state);
  }
}

/** @returns {{ ok: true, state } | { ok: false, error: string }} */
export async function recordVote(email, candidateIds) {
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const state = await loadState();
    if (state.voters[email]) {
      return { ok: false, error: "already_voted" };
    }
    state.voters[email] = { votedAt: new Date().toISOString() };
    for (const id of candidateIds) {
      state.tallies[id] = (state.tallies[id] || 0) + 1;
    }
    await saveState(state);
    const verify = await loadState();
    if (verify.voters[email]) {
      return { ok: true, state: verify };
    }
  }
  return { ok: false, error: "conflict" };
}

export function publicResults(state) {
  const voters = Object.entries(state.voters || {})
    .map(([email, meta]) => ({ email, votedAt: meta.votedAt }))
    .sort((a, b) => a.email.localeCompare(b.email));
  return {
    electionId: state.electionId,
    totalBallots: voters.length,
    tallies: state.tallies || {},
    voters,
  };
}
