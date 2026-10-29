/** 2027 RPFC board election — pick exactly 7 of these 8 candidates. */
export const ELECTION_ID = "2027-board";
export const REQUIRED_SELECTIONS = 7;

export const CANDIDATES = [
  { id: "bob-pring", name: "Bob Pring" },
  { id: "chris-marasco", name: "Chris Marasco" },
  { id: "mike-david", name: "Mike David" },
  { id: "troy-durbin", name: "Troy Durbin" },
  { id: "larry-hopkins", name: "Larry Hopkins" },
  { id: "ron-becker", name: "Ron Becker" },
  { id: "brett-hyder", name: "Brett Hyder" },
  { id: "kai-madison", name: "Kai Madison" },
];

export const CANDIDATE_IDS = new Set(CANDIDATES.map((c) => c.id));

export const VOTED_COOKIE = "rpfc_2027_ballot_voted";
export const BLOB_PATH = "rpfc-election-2027/state.json";
