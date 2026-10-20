// The friends of Ravenhollow and everything they've posted so far.
// Seeded when the database is first created (bump SCHEMA_VERSION in db.js to re-seed).
// These passwords are for the CTF author only — never expose this file to players.
// All seeded accounts are read-only (see `protected` in db.js) so players can't vandalise them.
//
// THE CASE: On 18 Oct the friends go ghost hunting at the abandoned Hallow Manor. Heather makes
// lattes; Maryum insists on picking them up. James — who will NOT stop talking about Ben's birthday
// party — wanders into the east wing with his latte and never comes back. Maryum laced it with
// deadly nightshade (belladonna) berries she foraged behind the manor.
// Red herrings: Connor owed James money; Heather made the drink; Shim was hiding in the east wing to prank
// James (but Jonathan alibis him from 11:30).

import { FLAGS } from './flags.js'

export const seedUsers = [
  {
    username: 'james',
    displayName: 'James',
    password: 'B3ns-P4rty-0r-Bust!',
    avatar: '🎃',
    bio: '🕯️ Gone, but never quiet. Loved Halloween, vampires, and telling everyone about Ben\'s birthday party.',
    memorial: true,
    createdAt: '2025-10-01T21:13:00.000Z',
  },
  {
    username: 'maryum',
    displayName: 'Maryum',
    password: 'B3ll4-D0nn4-Bl00m',
    avatar: '🥀',
    bio: 'Foraging, herbalism and quiet evenings. Very, very quiet evenings. 🌿🖤',
    createdAt: '2025-10-03T23:31:00.000Z',
  },
  {
    username: 'connor',
    displayName: 'Connor',
    password: 'Gh0st-Hunt3r-1031',
    avatar: '🧛',
    bio: 'Paranormal investigator (amateur). Poker player (worse). Organiser of ill-advised ghost hunts. 🔦',
    createdAt: '2025-10-05T08:00:00.000Z',
  },
  {
    username: 'heather',
    displayName: 'Heather',
    password: 'Gr1nd-R34p3r-L4tt3',
    avatar: '🧙',
    bio: 'Head barista at The Grind Reaper ☕💀 Ask me about the Pumpkin Spice Scream.',
    createdAt: '2025-10-07T04:44:00.000Z',
  },
  {
    username: 'jonathan',
    displayName: 'Jonathan',
    // CHALLENGE (weak credentials): password == username. Hinted in the 'jonathan_lifehack' post.
    password: 'jonathan',
    note: `What I saw at Hallow Manor — 18 Oct. I haven't told anyone.
- 11:58pm: Maryum walked out of the east wing ALONE
- She was carrying James's latte cup. Empty.
- She saw me. She smiled. She didn't say a word.
- ${FLAGS.weakPassword}`,
    avatar: '👻',
    bio: 'I notice things. Probably too many things. 👀',
    createdAt: '2025-10-13T13:13:00.000Z',
  },
  {
    username: 'ben',
    displayName: 'Ben',
    password: 'B1rthd4y-0n-H4ll0w33n',
    avatar: '🎂',
    bio: 'Born on Halloween 🎃🎂 Yes, the party is at the Old Mill. Yes, costumes are mandatory. No, there will not be speeches.',
    createdAt: '2025-10-15T12:00:00.000Z',
  },
  {
    // Red herring: planned a prank on James in the east wing, but Jonathan gives him an alibi.
    username: 'shim',
    displayName: 'Shim',
    password: 'Pr4nk-0r-Tr34t-666',
    avatar: '🕷️',
    bio: 'Professional prankster. Amateur ghost. If you got scared this Halloween, it was probably me. 🕷️😈',
    createdAt: '2025-10-17T18:30:00.000Z',
  },
]

export const seedPosts = [
  {
    key: 'james_party',
    author: 'james',
    content:
      'BEN\'S BIRTHDAY PARTY IS ON HALLOWEEN!!! 🎂🎃 Costume party at the Old Mill. Who\'s coming?? I\'m going as a vampire 🧛',
    createdAt: '2026-10-03T19:00:00.000Z',
  },
  {
    key: 'heather_latte',
    author: 'heather',
    content:
      'NEW at The Grind Reaper ☕ the Pumpkin Spice Scream — so much cinnamon you won\'t taste a thing 🎃 Come try it!',
    createdAt: '2026-10-05T10:20:00.000Z',
  },
  {
    key: 'james_countdown',
    author: 'james',
    content:
      'Only 23 days until Ben\'s birthday party 🎉 I\'ve planned my costume, my playlist AND a speech. Will be sharing updates daily!!',
    createdAt: '2026-10-08T18:45:00.000Z',
  },
  {
    key: 'maryum_mute',
    author: 'maryum',
    content: 'Does anyone know how to mute a person in real life? Asking for a friend. 🙂',
    createdAt: '2026-10-10T22:13:00.000Z',
  },
  {
    key: 'jonathan_lifehack',
    author: 'jonathan',
    content:
      "Life hack 🧠 I made my password the same as my username so I can NEVER forget it. You're welcome 👻",
    createdAt: '2026-10-11T14:22:00.000Z',
  },
  {
    key: 'connor_hunt',
    author: 'connor',
    content:
      'Who\'s up for a ghost hunt at the abandoned Hallow Manor on the 18th? 👻🔦 Bring torches. Bring snacks. Bring courage.',
    createdAt: '2026-10-13T09:30:00.000Z',
  },
  {
    key: 'maryum_foraging',
    author: 'maryum',
    content:
      'Went foraging in the woods behind Hallow Manor today 🌿 Found the most beautiful glossy black berries. Saving them for something special. 🖤',
    createdAt: '2026-10-15T16:02:00.000Z',
  },
  {
    // CHALLENGE (IDOR): private, so it never appears in the feed, but /api/posts/:id serves it anyway.
    key: 'maryum_diary',
    author: 'maryum',
    private: true,
    content: `Diary. He mentioned Ben's birthday party ELEVEN times today. Eleven. If I hear the words "Ben's party" one more time I will make sure he never gets there. The berries are drying on the windowsill. ${FLAGS.idor}`,
    createdAt: '2026-10-16T23:47:00.000Z',
  },
  {
    // Red herring — also reachable via IDOR.
    key: 'connor_private',
    author: 'connor',
    private: true,
    content:
      'Note to self: I still owe James £50 from poker night. Deleted our messages about it. Nobody needs to know. Especially not now.',
    createdAt: '2026-10-17T11:40:00.000Z',
  },
  {
    key: 'heather_order',
    author: 'heather',
    content:
      'Five Pumpkin Spice Screams made to order for tonight\'s ghost hunt ☕🎃 Maryum\'s collecting them — she insisted on carrying James\'s herself. So sweet!',
    createdAt: '2026-10-18T19:15:00.000Z',
  },
  {
    key: 'james_last',
    author: 'james',
    content:
      'At Hallow Manor for the ghost hunt 👻 Got my latte ☕ tastes kinda bitter lol. Off to explore the east wing! ONLY 13 DAYS UNTIL BEN\'S PARTY 🎂🎂🎂',
    createdAt: '2026-10-18T22:47:00.000Z',
  },
  {
    key: 'connor_missing',
    author: 'connor',
    content:
      'Has anyone seen James?? He went off towards the east wing and never came back. Not answering his phone. We searched for an hour. 😟',
    createdAt: '2026-10-19T01:10:00.000Z',
  },
  {
    key: 'jonathan_cantsleep',
    author: 'jonathan',
    content: 'Didn\'t sleep. Can\'t stop thinking about what I saw last night. I don\'t know who to tell. 👻',
    createdAt: '2026-10-19T08:11:00.000Z',
  },
  {
    key: 'heather_found',
    author: 'heather',
    content: 'The police are at Hallow Manor. They found James. 💔 I can\'t believe he\'s gone.',
    createdAt: '2026-10-19T15:00:00.000Z',
  },
  {
    key: 'connor_tribute',
    author: 'connor',
    content: 'Ben says the party is still going ahead on Halloween — in James\'s honour. He\'d have wanted that. 🕯️🎂',
    createdAt: '2026-10-20T09:00:00.000Z',
  },
  // Ben's posts are appended (not in date order) so the private posts above keep IDs 8 and 9.
  {
    key: 'ben_invite',
    author: 'ben',
    content:
      'It\'s official 🎂🎃 My birthday party is on HALLOWEEN at the Old Mill, 8pm. Costumes mandatory. Everyone\'s invited!',
    createdAt: '2026-10-02T17:00:00.000Z',
  },
  {
    key: 'ben_messages',
    author: 'ben',
    content:
      'James has messaged me 47 times about my party this week. Love the enthusiasm mate but it\'s MY birthday 😂🎂',
    createdAt: '2026-10-09T20:30:00.000Z',
  },
  {
    key: 'ben_tribute',
    author: 'ben',
    content:
      'I can\'t believe James is gone. He was more excited about my birthday than I was. The party will go ahead — we\'ll raise a glass to him. 🕯️',
    createdAt: '2026-10-19T21:00:00.000Z',
  },
  {
    key: 'shim_prank',
    author: 'shim',
    content:
      'Got the PERFECT prank planned for the ghost hunt 😈 James won\'t know what hit him. Hallow Manor is about to get a lot more haunted. 🕷️',
    createdAt: '2026-10-14T20:10:00.000Z',
  },
  {
    key: 'shim_position',
    author: 'shim',
    content: 'In position in the east wing. White sheet ✅ Bluetooth speaker ✅ Ghost noises ✅ Waiting for my victim… 👻',
    createdAt: '2026-10-18T22:55:00.000Z',
  },
  {
    key: 'shim_innocent',
    author: 'shim',
    content:
      'I KNOW how my posts look. It was a SHEET and a SPEAKER. James never even showed up — I got bored and left the east wing at 11:30. I didn\'t touch him. 😰',
    createdAt: '2026-10-19T16:45:00.000Z',
  },
]

export const seedComments = [
  { post: 'james_party', author: 'heather', content: 'I\'m in! 🧙', createdAt: '2026-10-03T19:20:00.000Z' },
  { post: 'james_party', author: 'maryum', content: 'Yes, James. You\'ve mentioned it. 🙂', createdAt: '2026-10-03T19:31:00.000Z' },
  {
    post: 'heather_latte',
    author: 'james',
    content: 'Perfect fuel for Ben\'s party!! 🎂',
    createdAt: '2026-10-05T10:41:00.000Z',
  },
  { post: 'james_countdown', author: 'connor', content: 'A SPEECH?? It\'s not your birthday mate', createdAt: '2026-10-08T19:02:00.000Z' },
  { post: 'james_countdown', author: 'maryum', content: 'Please. Stop.', createdAt: '2026-10-08T19:05:00.000Z' },
  {
    post: 'maryum_mute',
    author: 'heather',
    content: 'lol is this about James and Ben\'s party',
    createdAt: '2026-10-10T22:20:00.000Z',
  },
  { post: 'maryum_mute', author: 'maryum', content: 'I\'m not saying it isn\'t.', createdAt: '2026-10-10T22:21:00.000Z' },
  { post: 'jonathan_lifehack', author: 'connor', content: 'Jonathan. No.', createdAt: '2026-10-11T14:40:00.000Z' },
  {
    post: 'connor_hunt',
    author: 'james',
    content: 'YES!! I can tell you all about Ben\'s party on the drive 🎂',
    createdAt: '2026-10-13T09:41:00.000Z',
  },
  { post: 'connor_hunt', author: 'heather', content: 'I\'ll make lattes for everyone ☕', createdAt: '2026-10-13T10:02:00.000Z' },
  {
    post: 'connor_hunt',
    author: 'maryum',
    content: '…I\'ll come. I\'ll pick up the drinks. ☕',
    createdAt: '2026-10-13T10:15:00.000Z',
  },
  {
    post: 'maryum_foraging',
    author: 'jonathan',
    content: 'Are those safe to eat?',
    createdAt: '2026-10-15T16:30:00.000Z',
  },
  { post: 'maryum_foraging', author: 'maryum', content: 'Not for me. 🖤', createdAt: '2026-10-15T16:34:00.000Z' },
  {
    post: 'james_last',
    author: 'maryum',
    content: 'Drink up, James. 🥀',
    createdAt: '2026-10-18T22:50:00.000Z',
  },
  {
    post: 'connor_missing',
    author: 'maryum',
    content: 'He probably went home to rehearse his speech for Ben\'s party.',
    createdAt: '2026-10-19T01:22:00.000Z',
  },
  { post: 'connor_missing', author: 'jonathan', content: '…', createdAt: '2026-10-19T01:30:00.000Z' },
  { post: 'heather_found', author: 'connor', content: 'No… 💔', createdAt: '2026-10-19T15:10:00.000Z' },
  { post: 'heather_found', author: 'maryum', content: 'Tragic. 🥀', createdAt: '2026-10-19T15:12:00.000Z' },
  {
    post: 'connor_tribute',
    author: 'maryum',
    content: 'Wonderful. I can\'t wait to never hear about it again.',
    createdAt: '2026-10-20T09:30:00.000Z',
  },
  { post: 'ben_invite', author: 'james', content: 'I\'M COMING!!!!! 🧛🎂🎉', createdAt: '2026-10-02T17:01:00.000Z' },
  { post: 'ben_invite', author: 'connor', content: 'Count me in 🔦', createdAt: '2026-10-02T17:30:00.000Z' },
  { post: 'ben_invite', author: 'maryum', content: 'Lovely. I\'m sure James will keep us all updated. 🙂', createdAt: '2026-10-02T18:05:00.000Z' },
  { post: 'ben_messages', author: 'james', content: '48 now 😁', createdAt: '2026-10-09T20:31:00.000Z' },
  { post: 'ben_messages', author: 'maryum', content: 'Someone should really do something about that.', createdAt: '2026-10-09T20:45:00.000Z' },
  { post: 'ben_tribute', author: 'heather', content: 'He would have loved that. 💔', createdAt: '2026-10-19T21:15:00.000Z' },
  { post: 'ben_tribute', author: 'maryum', content: 'Will there be speeches?', createdAt: '2026-10-19T21:20:00.000Z' },
  { post: 'ben_tribute', author: 'ben', content: 'No speeches.', createdAt: '2026-10-19T21:22:00.000Z' },
  { post: 'ben_tribute', author: 'maryum', content: 'Good. 🥀', createdAt: '2026-10-19T21:23:00.000Z' },
  { post: 'connor_hunt', author: 'shim', content: 'I\'m in. I\'ll bring… surprises 😈', createdAt: '2026-10-13T11:00:00.000Z' },
  { post: 'shim_prank', author: 'heather', content: 'Shim, be nice.', createdAt: '2026-10-14T20:30:00.000Z' },
  { post: 'shim_prank', author: 'maryum', content: 'Oh, do go ahead. Someone should give James a shock.', createdAt: '2026-10-14T20:41:00.000Z' },
  { post: 'shim_position', author: 'connor', content: 'Mate he\'s literally just walked in that direction 😂', createdAt: '2026-10-18T22:58:00.000Z' },
  { post: 'shim_innocent', author: 'connor', content: 'Shim… what did you do', createdAt: '2026-10-19T16:50:00.000Z' },
  { post: 'shim_innocent', author: 'jonathan', content: 'He\'s telling the truth. Shim was outside by the cars with me from 11:30 onwards. He wasn\'t the one in the east wing at midnight.', createdAt: '2026-10-19T17:02:00.000Z' },
  { post: 'shim_innocent', author: 'maryum', content: 'How convenient for you, Shim. 🙂', createdAt: '2026-10-19T17:10:00.000Z' },
]

// CHALLENGE (SQL injection): nothing in the app reads this table — it's only reachable via /api/search.
export const seedEvidence = [
  {
    item: 'Latte cup, recovered from the east wing',
    notes: 'The Grind Reaper — Pumpkin Spice Scream. Dark berry residue at the bottom. Plum lipstick on the lid.',
  },
  {
    item: 'Invitation, found in victim\'s pocket',
    notes: 'Ben\'s Birthday Bash — 31 Oct, The Old Mill. Covered in annotations for "the speech".',
  },
  {
    item: 'Foraging basket, recovered from a porch on Hollow Lane',
    notes: `Half-empty jar of glossy black berries. Positively identified as Atropa belladonna. ${FLAGS.sqli}`,
  },
]
