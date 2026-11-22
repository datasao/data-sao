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
