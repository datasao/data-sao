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
