const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const clean = (v, max) => String(v ?? '').replace(/[^\x20-\x7E -￿\n\t]/g, '').trim().slice(0, max);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/contact') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    let d;
    try { d = await request.json(); } catch { return json({ error: 'Bad request' }, 400); }
    if (d.website) return json({ ok: true, id: 'RB-OK' });

    const name = clean(d.name, 120); const email = clean(d.email, 200); const company = clean(d.company, 160);
    const about = clean(d.about, 4000); const budget = clean(d.budget, 40); const timeline = clean(d.timeline, 40);
    const need = Array.isArray(d.need) ? d.need.map((x) => clean(x, 40)).filter(Boolean).slice(0, 8) : [];
    if (name.length < 2 || !EMAIL.test(email) || about.length < 10) return json({ error: 'Validation failed' }, 422);

    const id = 'RB-' + Date.now().toString(36).toUpperCase();
    const text = [
      `Request ${id}`, '',
      `Need:     ${need.join(', ') || '-'}`, `Budget:   ${budget || '-'}`, `Timeline: ${timeline || '-'}`, '',
      about, '',
      `${name}${company ? ' / ' + company : ''}`, email, '',
      `Sent from ${clean(d.page, 300)} / ${request.headers.get('CF-IPCountry') || ''} / ${new Date().toISOString()}`
    ].join('\n');

    if (env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.CONTACT_FROM || 'Runbyte <noreply@runbyte.eu>',
          to: [env.CONTACT_TO || 'info@runbyte.eu'],
          reply_to: email,
          subject: `[${id}] Project request from ${name}${company ? ' (' + company + ')' : ''}`,
          text
        })
      });
      if (!r.ok) return json({ error: 'Mail delivery failed' }, 502);
      return json({ ok: true, id });
    }

    if (env.CONTACT_WEBHOOK_URL) {
      const r = await fetch(env.CONTACT_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name, email, company, need, budget, timeline, about, text }) });
      if (!r.ok) return json({ error: 'Webhook failed' }, 502);
      return json({ ok: true, id });
    }

    return json({ error: 'No mail transport configured' }, 501);
  }
};
