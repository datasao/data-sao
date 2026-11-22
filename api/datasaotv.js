const calendarUrl = 'https://data-sao-futbol.fransilver.chatgpt.site/datasaotv-calendario';

module.exports = async (req, res) => {
  try {
    const upstream = await fetch(calendarUrl, { signal: AbortSignal.timeout(7000) });
    if (!upstream.ok || !upstream.headers.get('content-type')?.includes('text/html')) {
      return res.redirect(302, calendarUrl);
    }
    const html = await upstream.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(html.replace(/<\/body\s*>/i, '<script src="/datasaotv-default.js" defer></script>$&'));
  } catch {
    return res.redirect(302, calendarUrl);
  }
};
