const playerSandbox = 'allow-scripts allow-same-origin allow-presentation';

function restrictExternalPlayers() {
  for (const frame of document.querySelectorAll('#player iframe[src]')) {
    const url = new URL(frame.src);
    if (url.protocol === 'https:' && url.origin !== location.origin &&
        frame.getAttribute('sandbox') !== playerSandbox) {
      frame.setAttribute('sandbox', playerSandbox);
      // Sandbox restrictions take effect on navigation.
      frame.src = url.href;
    }
  }
}

const playerContainer = document.getElementById('player');
if (playerContainer) {
  new MutationObserver(restrictExternalPlayers).observe(playerContainer, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['src']
  });
  restrictExternalPlayers();
}

// Keep the scheduled events and the continuous channel player independent.
let directChannel = null;
const renderEventList = lista;
const clearFinishedEvents = limpiarSiTerminaron;

lista = function () {
  const activeEvent = sel;
  const selectedOption = opcion;
  renderEventList();
  if (directChannel) {
    sel = activeEvent;
    canal = directChannel;
    opcion = selectedOption;
  }
};

limpiarSiTerminaron = function () {
  return !directChannel && clearFinishedEvents();
};

LICENCIAS.ESPN.unshift({
  name: 'TVF90',
  url: 'https://tvf90.com/online.php?stream=espn',
  embed: true
});


const preferredOptions = {
  ESPN: 'Opción 2',
  'FOX Sports': 'Opción 4',
  DSports: 'Opción 3'
};
for (const [channel, label] of Object.entries(preferredOptions)) {
  const sources = LICENCIAS[channel];
  const index = sources?.findIndex(source => source.name === label);
  if (index > 0) sources.unshift(sources.splice(index, 1)[0]);
}

const feedChannels = {
  espn: 'ESPN', espn2: 'ESPN 2', espn3: 'ESPN 3', espn4: 'ESPN 4',
  espn5: 'ESPN 5', espn6: 'ESPN 6', espn7: 'ESPN 7',
  espnpremium: 'ESPN Premium', fox1ar: 'FOX Sports', fox2ar: 'FOX Sports 2',
  fox3ar: 'FOX Sports 3', dsports: 'DSports', dsports2: 'DSports 2',
  dsportsplus: 'DSports Plus', winplus: 'WIN Sports+', winsports: 'WIN Sports',
  tntsports: 'TNT Sports', tntar: 'TNT Sports', tntsportscl: 'TNT Sports Chile', tntsportschile: 'TNT Sports Chile',
  premiere1: 'Premiere 1 BR', premiere2: 'Premiere 2 BR', tudn_usa: 'TUDN USA',
  liga1max: 'Liga 1 Max'
};

function refreshSchedule() {
  const payload = document.getElementById('datasaotv-events');
  const feed = payload ? JSON.parse(payload.textContent) : null;
  if (!Array.isArray(feed) || !feed.length) return;

  const schedule = new Map();
  const now = new Date();
  const today = now.toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' });
  const feedDay = now.toLocaleDateString('sv-SE', { timeZone: 'America/Panama' });
  for (const event of feed) {
    if (!event || !['live', 'next'].includes(event.status) ||
        typeof event.title !== 'string' || typeof event.category !== 'string' ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time)) continue;

    const signal = new URLSearchParams(event.url?.split('?')[1] ?? '').get('stream') ?? '';
    const channel = feedChannels[signal] ??
      (/^disney\d*$/.test(signal) ? 'Disney+' : /^mls\d*$/.test(signal) ? 'MLS' : null);
    const kickoff = new Date(feedDay + 'T' + event.time + ':00-05:00');
    const localDay = kickoff.toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' });
    if (localDay < today) continue;
    const time = kickoff.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    });
    const key = kickoff.getTime() + ':' + event.title;
    if (!schedule.has(key)) {
      schedule.set(key, { entry: [time, event.title, event.category, [], localDay > today], live: false });
    }
    const item = schedule.get(key);
    item.live ||= event.status === 'live';
    if (channel && !item.entry[3].includes(channel)) item.entry[3].push(channel);
  }

  const matches = [...schedule.values()];
  for (const { entry } of matches) {
    if (!entry[3].length) entry[3].push('Sin señal configurada');
  }
  if (!matches.length) return;
  DIA = today;
  E.splice(0, E.length, ...matches.map(({ entry }) => entry));
  document.getElementById('date').textContent = new Date(today + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  const riverIndex = E.findIndex(entry =>
    /\bRiver Plate\s+vs\.?\s+Lanús\b/i.test(entry[1]) && vigente(entry)
  );
  const riverMatch = E[riverIndex];
  if (riverMatch) PARTIDO_PRINCIPAL = riverMatch[1];

  sel = riverMatch ? riverIndex : matches.findIndex(({ live, entry }) =>
    live && vigente(entry) && entry[3].some(channel => LICENCIAS[channel]?.length)
  );
  if (sel < 0) sel = Math.max(0, E.findIndex(vigente));
  canal = riverMatch?.[3].includes('TNT Sports') ? 'TNT Sports' : null;
  opcion = 0;
  todo();
}

refreshSchedule();

const channelBar = document.getElementById('chips');
channelBar.setAttribute('aria-label', 'Canales y programación');

const extraChannels = [
  'ESPN Premium', 'ESPN 2', 'ESPN 3', 'ESPN 4', 'ESPN 5', 'ESPN 6', 'ESPN 7',
  'FOX Sports 2', 'FOX Sports 3', 'DSports 2', 'DSports Plus',
  'TNT Sports Chile', 'WIN Sports', 'WIN Sports+', 'Liga 1 Max', 'Premiere 1 BR'
];
FILTROS.push(...extraChannels.filter(channel =>
  !FILTROS.includes(channel) && LICENCIAS[channel]?.some(source => source.url)
));
chips();

channelBar.addEventListener('click', event => {
  const channel = event.target.closest('button[data-f]')?.dataset.f;
  if (!channel) return;

  event.stopPropagation();
  directChannel = null;
  fil = channel;
  chips();
  if (!LICENCIAS[channel]?.some(source => source.url)) {
    todo();
    return;
  }

  renderEventList();
  directChannel = channel;
  mostrarCanal(channel);
}, true);

document.getElementById('list').addEventListener('click', event => {
  if (event.target.closest('button[data-i]')) directChannel = null;
}, true);

document.getElementById('options').addEventListener('click', event => {
  const option = event.target.closest('button[data-o]');
  if (!directChannel || !option) return;

  opcion = Number(option.dataset.o);
  for (const button of event.currentTarget.querySelectorAll('button[data-o]')) {
    button.setAttribute('aria-pressed', String(button === option));
  }
  reproductor();
});

const androidDownload = document.createElement('a');
androidDownload.href = 'https://github.com/datasao/data-sao/releases/download/DataAndroid/data-sao-v2.apk';
androidDownload.textContent = 'Descargar para Android';
androidDownload.style.cssText = 'display:inline-block;background:#08734f;color:#fff;padding:10px 16px;border-radius:8px;font:600 14px system-ui,sans-serif;text-decoration:none;margin:12px 16px';
const calendar = document.querySelector('main');
if (calendar) calendar.before(androidDownload);
else document.body.prepend(androidDownload);
