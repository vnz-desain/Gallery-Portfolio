/* ── supabase.js ─────────────────────────────────────────
   Lightweight Supabase REST client untuk Gallery Frontend
   Tidak pakai SDK — pure fetch aja cukup untuk read-only
──────────────────────────────────────────────────────── */

const SB_URL    = 'https://ocedszxukzrnmvrecrnx.supabase.co';
const SB_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZWRzenhla3pubXZyZWNybngiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0MDkyMDU4NiwiZXhwIjoyMDU2NDk2NTg2fQ.Y4lEGLYlmmtN37gPAhE-YFbJfJi8r_aBpzLrdVAWDjg';

async function sbGet(table, params) {
  const qs  = params ? '?' + params : '';
  const res = await fetch(`${SB_URL}/rest/v1/${table}${qs}`, {
    headers: {
      'apikey':        SB_ANON,
      'Authorization': 'Bearer ' + SB_ANON,
      'Content-Type':  'application/json'
    }
  });
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status}`);
  return res.json();
}
