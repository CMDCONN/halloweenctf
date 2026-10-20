// Every server-side flag lives here. (Two client-side flags live in index.html and src/main.tsx —
// see the Flags table in README.md.) After changing a seeded flag, bump SCHEMA_VERSION in db.js.
//
// The case: James was poisoned by Maryum because he would not stop talking about Ben's birthday party.
// Each flag is one clue towards solving it.

export const FLAGS = {
  eastWing: 'HALLOW{f0und_d34d_1n_th3_e4st_w1ng}', // WHERE — robots.txt → /east-wing
  header: 'HALLOW{t1m3_0f_d34th_m1dn1ght}', // WHEN — X-Spirit-Whisper response header on login
  cookie: 'HALLOW{b3ll4d0nn4_1n_h1s_bl00d}', // WHAT POISON — cryptbook_role cookie → /coroners-office
  idor: 'HALLOW{sh3_w4s_s1ck_0f_b3ns_p4rty}', // WHY — Maryum's private diary post via /api/posts/:id (seeded)
  sqli: 'HALLOW{m4ryum_p1ck3d_th3_n1ghtsh4d3}', // WHO — /api/search injection → evidence_locker table (seeded)
  weakPassword: 'HALLOW{j0n4th4n_s4w_h3r_l34v3}', // WITNESS — jonathan's private note (seeded)
  accusation: 'HALLOW{c4s3_cl0s3d_m4ryum_d1d_1t}', // FINAL — correct accusation on /accuse
}

// The answer to the final accusation. Values must match the option ids in src/pages/Accuse.tsx.
export const SOLUTION = {
  killer: 'maryum',
  method: 'nightshade_latte',
  motive: 'bens_party',
}
