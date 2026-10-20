# 🎃 Cryptbook — a Halloween murder-mystery CTF

A spooky social network for a group of friends in **Ravenhollow**. On 18 October they went ghost hunting at
the abandoned Hallow Manor. James wandered off into the east wing… and never came back.

Players dig through Cryptbook to work out **how James died, and who killed him**.

## Running it

```sh
npm install
npm run dev        # API on :3001 + Vite on :5173 (proxied), with live reload
```

Open http://localhost:5173.

For a single-process deployment (what players should hit):

```sh
npm run build
npm start          # serves the built site + API on http://localhost:3001 (PORT env to change)
```

`npm run reset-db` wipes the database; it's re-seeded with the Ravenhollow residents on the next start
(stop the server first — Windows won't delete the file while it's open). The database also rebuilds itself
automatically whenever `SCHEMA_VERSION` in `server/db.js` is bumped, so bump it after changing the schema or seed data.

## Stack

| Piece    | Where                    | Notes                                                       |
| -------- | ------------------------ | ----------------------------------------------------------- |
| API      | `server/index.js`        | Express 5, all routes under `/api`                          |
| Database | `server/db.js`           | Node's built-in `node:sqlite`, file at `data/cryptbook.db`  |
| Auth     | `server/auth.js`         | scrypt password hashes, random session token in an httpOnly cookie |
| Story    | `server/seed.js`         | Characters, posts and comments (and their passwords — keep private) |
| Frontend | `src/`                   | React 19 + React Router 7                                   |

## API

| Method | Path                       | Auth | Purpose                                 |
| ------ | -------------------------- | ---- | --------------------------------------- |
| GET    | `/api/auth/me`             |      | Current user (or `null`)                |
| POST   | `/api/auth/register`       |      | Create account + log in                 |
| POST   | `/api/auth/login`          |      | Log in                                  |
| POST   | `/api/auth/logout`         |      | Log out                                 |
| PATCH  | `/api/account`             | ✔    | Update display name / bio / avatar      |
| DELETE | `/api/account`             | ✔    | Delete account (requires password)      |
| GET    | `/api/users`               | ✔    | All residents                           |
| GET    | `/api/users/:username`     | ✔    | Profile + their posts                   |
| GET    | `/api/search?q=`           | ✔    | Search users (⚠️ SQLi challenge)         |
| GET    | `/api/coroners-report`     | ✔    | Coroner's report (⚠️ cookie challenge)   |
| POST   | `/api/accuse`              | ✔    | Final accusation (killer/method/motive) |
| GET    | `/api/posts`               | ✔    | Feed                                    |
| GET    | `/api/posts/:id`           | ✔    | Single post (⚠️ IDOR challenge)          |
| POST   | `/api/posts`               | ✔    | New post                                |
| DELETE | `/api/posts/:id`           | ✔    | Delete your own post                    |
| POST   | `/api/posts/:id/like`      | ✔    | Toggle like                             |
| POST   | `/api/posts/:id/comments`  | ✔    | Comment                                 |

## The solution

> ⚠️ Organiser-only from here down — strip it (and `server/`) from anything you hand to players.

**Maryum poisoned James** with deadly nightshade (belladonna) berries in his pumpkin spice latte, because he
would not stop talking about Ben's birthday party.

| Character | Role | What's going on |
| --- | --- | --- |
| **James** | Victim | Obsessed with Ben's Halloween birthday party; won't stop talking about it. Account memorialised. |
| **Maryum** | Murderer | Increasingly fed up ("how do I mute a person in real life?"). Forages "glossy black berries" behind the manor, insists on carrying James's latte, comments "Drink up, James. 🥀" |
| **Heather** | Red herring | Barista who made the lattes — but Maryum collected them. |
| **Connor** | Red herring | Organised the ghost hunt; secretly owed James £50 (private post 9). |
| **Jonathan** | Witness | Saw Maryum leave the east wing alone with James's empty cup. Has a terrible password. |
| **Shim** | Red herring | Prankster who hid in the east wing with a sheet and a speaker to scare James. Looks guilty, but Jonathan alibis him from 11:30 — before the midnight time of death (flag 3). |
| **Ben** | Birthday boy | His Halloween party is the motive. Mildly overwhelmed by James's enthusiasm. Party goes ahead — "no speeches". |

## Flags

Flag format: `HALLOW{...}`. Server-side flags live in `server/flags.js`; client-side ones are noted below.
After changing a seeded flag (6, 7, 8), bump `SCHEMA_VERSION` in `server/db.js` so the database rebuilds.
Each flag is one piece of the case:

| # | Clue | Challenge | Difficulty | Flag | Defined in |
| --- | --- | --- | --- | --- | --- |
| 1 | **What** happened | View source | Easy | `HALLOW{j4m3s_w4s_p01s0n3d}` | `index.html` |
| 2 | **Where** | robots.txt | Easy | `HALLOW{f0und_d34d_1n_th3_e4st_w1ng}` | `server/flags.js` |
| 3 | **When** | HTTP headers | Easy | `HALLOW{t1m3_0f_d34th_m1dn1ght}` | `server/flags.js` |
| 4 | **How** | Base64 in console | Easy | `HALLOW{th3_l4tt3_w4s_l4c3d}` | `src/main.tsx` |
| 5 | **What poison** | Cookie tampering | Medium | `HALLOW{b3ll4d0nn4_1n_h1s_bl00d}` | `server/flags.js` |
| 6 | **Why** (motive) | IDOR | Medium | `HALLOW{sh3_w4s_s1ck_0f_b3ns_p4rty}` | `server/flags.js` |
| 7 | **Who** (evidence) | SQL injection | Medium | `HALLOW{m4ryum_p1ck3d_th3_n1ghtsh4d3}` | `server/flags.js` |
| 8 | **Eyewitness** | Weak credentials | Medium | `HALLOW{j0n4th4n_s4w_h3r_l34v3}` | `server/flags.js` |
| 9 | **Case closed** | Final accusation | Finale | `HALLOW{c4s3_cl0s3d_m4ryum_d1d_1t}` | `server/flags.js` |

### Walkthroughs

1. **View source** — `Ctrl+U` on any page. A Cryptbook Trust & Safety comment says James's account was
   memorialised and the preliminary cause of death is poisoning.
2. **robots.txt** — `/robots.txt` disallows `/east-wing` and `/coroners-office`. `/east-wing` is the crime scene:
   chalk outline, a Grind Reaper cup with crushed berries, James's phone open on his party speech. Story hook:
   James's last post says he's off to explore the east wing.
3. **HTTP headers** — Log in with DevTools → Network open. The `POST /api/auth/login` response has an
   `X-Spirit-Whisper` header. Hint on the login page: *"The spirits whisper to those who listen closely as they enter…"*
4. **Base64** — Open the browser console: *"The spirits speak in a tongue of 64 letters"* followed by
   `SEFMTE9Xe3RoM19sNHR0M193NHNfbDRjM2R9`. Decode with `atob()` / CyberChef.
5. **Cookie tampering** — `/coroners-office` (from robots.txt) says *"This report is restricted to the coroner.
   You are merely a mortal."* The `cryptbook_role` cookie is `mortal`; change it to `coroner` (or `admin`) in
   DevTools → Application → Cookies and reload. The post-mortem report names atropine / belladonna poisoning.
6. **IDOR** — Post IDs in the feed skip 8 and 9. Clicking any post's timestamp opens `/p/<id>`; `/p/8`
   (or `GET /api/posts/8`) is Maryum's private diary: *"If I hear the words 'Ben's party' one more time…"*.
   `/p/9` is Connor's red-herring note about owing James money.
7. **SQL injection** — The header search box hits `GET /api/search?q=`, which concatenates input into SQL and
   echoes errors. `' OR 1=1--` lists every user; `x' UNION SELECT 1--` leaks the column-count error. Then:
   - `zzz' UNION SELECT 1,name,sql,4 FROM sqlite_master WHERE type='table'--` → finds `evidence_locker`
   - `zzz' UNION SELECT id,item,notes,4 FROM evidence_locker--` → the police evidence list: the latte cup,
     the party invitation, and Maryum's foraging basket of belladonna berries (flag)
8. **Weak credentials** — Jonathan posts that his password is the same as his username. Log in as
   `jonathan` / `jonathan`; his **Private notes** on the Settings page describe seeing Maryum leave the east wing
   alone at 11:58pm carrying James's empty cup.
9. **Final accusation** — The **⚖️ Accuse** page asks for the killer, the method and the motive. The answer is
   **Maryum** (out of Connor, Heather, Maryum, Jonathan, Ben and Shim), **deadly nightshade in his latte**, **he would not stop talking about Ben's birthday party**.
   It's all-or-nothing with no hint about which part was wrong, so players need the clues: flags 4 + 5 separate
   nightshade from arsenic and latte from cupcake, flag 6 gives the motive, and flags 7 + 8 name Maryum. A
   correct accusation shows an epilogue and the flag. The answer lives in `SOLUTION` in `server/flags.js`; its
   values must match the option ids in `src/pages/Accuse.tsx`.

### Notes

- All seeded characters are **read-only** (no posting, commenting, liking, editing or deleting), so a player who
  logs in as Jonathan can't wreck the challenge for everyone else.
- SQL injection can read the entire database, so it's an **alternate route** to flags 6 and 8
  (`posts.content`, `users.note`). Normal for a CTF, but worth knowing. It can't modify data: `node:sqlite`
  only runs one statement per query, so stacked queries like `; DROP TABLE` don't work.
- Players register their own accounts, which are fully writable (and deletable).
- The accusation has 6 × 5 × 4 = 120 combinations and no attempt limit, so a determined player could script
  through them. Fine for a friendly game; ask if you want an attempt limit.
- Ben's posts are appended to the end of `seedPosts` (out of date order) so the private posts keep IDs 8 and 9.
  If you add more posts, append them too, or update the IDOR walkthrough.
