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

let step = 0;

function selectInitialBroadcast() {
  const event = [...document.querySelectorAll('aside button')].find(button =>
    /Fórmula 1: GP Las Vegas, carrera/i.test(button.textContent)
  );
  if (step === 0 && event) {
    step = 1;
    event.click();
  }

  const channels = document.querySelector('[aria-label="Canales de este partido"]');
  const fox = [...(channels?.querySelectorAll('button') ?? [])].find(button =>
    button.textContent.trim() === 'FOX Sports'
  );
  if (step === 1 && fox) {
    step = 2;
    if (fox.getAttribute('aria-pressed') !== 'true') fox.click();
  }

  const option = document.querySelector('.option-list button[data-o="3"]');
  if (step === 2 && fox?.getAttribute('aria-pressed') === 'true' &&
      option?.textContent.trim() === 'Opción 4') {
    observer.disconnect();
    option.click();
  }
}

const observer = new MutationObserver(selectInitialBroadcast);
observer.observe(document.body, { childList: true, subtree: true });
setTimeout(() => observer.disconnect(), 5000);
selectInitialBroadcast();

const espnUrl = 'https://tvf90.com/online.php?stream=espn';

document.addEventListener('click', event => {
  const button = event.target.closest('#chips button, #chans button');
  if (button?.textContent.trim() !== 'ESPN') return;

  // Let the calendar finish updating its selection before loading ESPN.
  requestAnimationFrame(() => {
    const media = document.querySelector('#player iframe, #player video');
    if (!media) return;

    if (media instanceof HTMLIFrameElement) {
      if (media.src !== espnUrl) media.src = espnUrl;
      return;
    }

    const player = document.createElement('iframe');
    player.title = 'ESPN';
    player.allow = 'autoplay; fullscreen; picture-in-picture';
    player.allowFullscreen = true;
    player.setAttribute('sandbox', playerSandbox);
    player.src = espnUrl;
    media.replaceWith(player);
  });
}, true);
