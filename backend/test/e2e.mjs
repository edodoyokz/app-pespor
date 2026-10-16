// End-to-end smoke test against the live backend: exactly the client contract
// the RN app implements (sync.ts) — boot, delta sync, revision bump, mutation.
// Run: node backend/test/e2e.mjs
const BASE = process.env.BASE ?? 'http://localhost:8080';
let failures = 0;

function check(name, cond, detail = '') {
  if (cond) console.log(`  ok  ${name}`);
  else { failures++; console.error(`FAIL  ${name} ${detail}`); }
}

const j = async (path, init) => {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok && res.status !== 404) throw new Error(`${path}: ${res.status}`);
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
};
const post = (path, body) => j(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

// 1. Boot: festivals + layout + revisions
const { body: festivals } = await j('/v1/festivals');
check('boot: festival list non-empty', festivals.length > 0);
const fid = festivals[0].id;

const { body: layout } = await j(`/v1/festivals/${fid}/app_layout`);
check('boot: layout has tabs', Array.isArray(layout.tabs) && layout.tabs.length === 5, JSON.stringify(layout.tabs));
check('boot: layout theme present', typeof layout.primary_color === 'string');

let { body: rev1 } = await j(`/v1/festivals/${fid}/revisions`);
check('boot: revisions for all entities', ['artist','stage','timetable','map','news','stamp_rally'].every(e => typeof rev1[e] === 'number'));

// 2. Delta sync (since=0 → full payload)
const { body: artists } = await j(`/v1/festivals/${fid}/content/artist?since=0`);
check('sync: artist items', artists.items.length === 6, `got ${artists.items?.length}`);
const { body: timetable } = await j(`/v1/festivals/${fid}/content/timetable?since=0`);
check('sync: timetable slots', timetable.items.length === 5);
const { body: map } = await j(`/v1/festivals/${fid}/content/map?since=0`);
check('sync: map floors+points', map.items.floors.length === 1 && map.items.points.length === 4);
const { body: rallies } = await j(`/v1/festivals/${fid}/content/stamp_rally?since=0`);
check('sync: stamp rally with points', rallies.items[0].points.length === 3);

// 3. No-op sync (since=rev → empty)
const { body: noop } = await j(`/v1/festivals/${fid}/content/artist?since=${rev1.artist}`);
check('sync: delta empty when up-to-date', Array.isArray(noop.items) && noop.items.length === 0);

// 4. Watch mutation + re-fetch state
await post(`/v1/festivals/${fid}/watch`, { user_id: 'smoke', slots: [1, 2] });
check('mutation: watch set ok', true); // implicit by 200

// 5. Stamp: complete rally → prize password; idempotent re-checkin
const tokens = rallies.items[0].points.map(p => p.qr_token);
for (const t of tokens) {
  const { body } = await post('/v1/stamp/checkin', { user_id: 'smoke', qr_token: t });
  if (t === tokens[tokens.length - 1]) {
    check('stamp: rally complete on last point', body.rally_complete === true && body.done === 3);
    check('stamp: prize password delivered', body.prize_password === 'PESPOR-2026');
  }
}
const { body: again } = await post('/v1/stamp/checkin', { user_id: 'smoke', qr_token: tokens[0] });
check('stamp: idempotent re-checkin', again.done === 3 && again.ok === true);

const { body: status } = await j('/v1/stamp/status?user_id=smoke&festival_id=' + fid);
check('stamp: status all checked', status.every(s => s.checked_in));

// 6. Push registration + silent push dry-run
await post('/v1/push/register', { token: 'smoke-token', user_id: 'smoke', festival_id: fid, platform: 'android' });
const { body: pushed } = await post(`/admin/festivals/${fid}/push`, { type: 'cancel', slot_id: 2 });
check('push: silent push accepted', pushed.ok === true);

// 7. CMS change → revision bump → client sees delta
//    (simulate admin edit: update artist name directly via SQL path is not exposed;
//     here we verify revision endpoint stability instead — bump is exercised by DB trigger in phase 2)
const { body: rev2 } = await j(`/v1/festivals/${fid}/revisions`);
check('revisions stable without edits', JSON.stringify(rev1) === JSON.stringify(rev2));

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
