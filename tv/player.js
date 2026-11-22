const streamBase = 'https://streamtp99a.sbs/global1.php?stream=';

const channels = [
  ['FOX Sports 1 Argentina', 'fox1ar'],
  ['Movistar Deportes', 'https://la18hd.su/vivo/canales.php?stream=movistar'],
  ['ESPN 1', 'espn'],
  ['ESPN 2', 'espn2'],
  ['ESPN 3', 'espn3'],
  ['ESPN 4', 'espn4'],
  ['ESPN 5', 'espn5'],
  ['ESPN 6', 'espn6'],
  ['ESPN 7', 'espn7'],
  ['ESPN Premium Argentina', 'espnpremium'],
  ['ESPN Deportes USA', 'espndeportes'],
  ['ESPN México', 'espnmx'],
  ['Win Sports', 'winsports'],
  ['Win Sports+', 'winplus'],
  ['FOX Sports 2 Argentina', 'fox2ar'],
  ['DSports', 'dsports'],
  ['DSports 2', 'dsports2'],
  ['DSports+', 'dsportsplus'],
  ['TNT Sports Chile', 'tntsportschile'],
  ['TNT Sports Argentina', 'tntsports'],
  ['Liga 1 Max', 'liga1max'],
  ['TUDN USA', 'tudn_usa'],
  ['TUDN México', 'tudnmx'],
  ['Sport TV Brasil', 'sporttvbr1'],
  ['Premiere Brasil', 'premiere1'],
  ['Premiere Brasil 2', 'premiere2'],
  ['Premiere Brasil 3', 'premiere3'],
  ['FOX One México 1', 'foxone1'],
];

const guide = document.querySelector('.channels');
const player = document.querySelector('#player');
const current = document.querySelector('#current');
let activeIndex = -1;

const buttons = channels.map(([name], index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = name;
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => tune(index));
  return button;
});

const disney = document.createElement('a');
disney.href = 'https://www.disneyplus.com/';
disney.target = '_blank';
disney.rel = 'noopener noreferrer';
disney.textContent = 'Disney+ ↗';
guide.append(...buttons.slice(0, 2), disney, ...buttons.slice(2));

function tune(index) {
  const nextIndex = (index + channels.length) % channels.length;
  if (nextIndex === activeIndex) return;

  const [name, stream] = channels[nextIndex];
  const url = stream.startsWith('https://') ? stream : streamBase + stream;

  buttons[activeIndex]?.setAttribute('aria-pressed', 'false');
  activeIndex = nextIndex;
  buttons[activeIndex].setAttribute('aria-pressed', 'true');
  buttons[activeIndex].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  current.textContent = name;
  player.title = name;
  player.src = url;
}

document.querySelector('#previous').addEventListener('click', () => tune(activeIndex - 1));
document.querySelector('#next').addEventListener('click', () => tune(activeIndex + 1));
tune(0);
