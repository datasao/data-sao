const calendarUrl = 'https://data-sao-futbol.fransilver.chatgpt.site/datasaotv-calendario';

const eventsUrl = 'https://streamtp99a.sbs/events.json';

async function loadEvents() {
  try {
    const response = await fetch(eventsUrl, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    const events = await response.json();
    return Array.isArray(events) ? events : null;
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  try {
    const [upstream, events] = await Promise.all([
      fetch(calendarUrl, { signal: AbortSignal.timeout(7000) }),
      loadEvents()
    ]);
    if (!upstream.ok || !upstream.headers.get('content-type')?.includes('text/html')) {
      return res.redirect(302, calendarUrl);
    }
    const html = await upstream.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const feed = JSON.stringify(events).replace(/</g, '\\u003c');
    const scripts = '<script id="datasaotv-events" type="application/json">' + feed +
      '</script><script src="/datasaotv-default.js" defer></script>';
    res.send(html.replace(/<\/body\s*>/i, () => scripts + '</body>'));
  } catch {
    return res.redirect(302, calendarUrl);
  }
};
