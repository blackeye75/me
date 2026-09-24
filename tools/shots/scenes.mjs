// Every picture in public/assets/shots. `file` is the output name (without .webp).
// kinds: laptop, monitor, phone, closeup (a screen seen up close), hobby (a line picture).
const land = { w: 1600, h: 1000 };
const tall = { w: 1200, h: 1500 };

const lavender = { env: 'sun', t1: '#e6e5f7', t2: '#c6c8ec', plinth: ['#b9b3d6', '#e2def3', '#ece9f8'] };
const butter = { env: 'sun', t1: '#f7e9b9', t2: '#e8cd7c', plinth: ['#d6b56a', '#f1dea6', '#f6e8bf'] };
const warm = { env: 'warm', plinth: ['#bfa582', '#e6d3b6', '#efe2cc'] };
const stone = { env: 'stone', plinth: ['#6d6e69', '#a3a49e', '#b4b5af'] };
const night = { env: 'night', glow: '#6FE3C3', plinth: ['#1d2426', '#3a4a4a', '#46595a'] };

const project = (slug, name, cover, look, heroKind = 'laptop') => [
  { file: `${slug}-hero`, kind: heroKind, cover, name, ...look, ...land },
  { file: `${slug}-tall`, kind: 'phone', cover, name, ...look, ...tall },
  { file: `${slug}-detail`, kind: 'closeup', cover, name, ...look, ...land },
];

export const scenes = [
  ...project('ledgerline', 'Ledgerline', 'dash', lavender),
  ...project('tidepool', 'Tidepool', 'term', night, 'monitor'),
  ...project('kiln', 'Kiln', 'shop', warm),
  ...project('relay', 'Relay', 'board', butter),
  ...project('fieldnote', 'Fieldnote', 'search', stone),

  { file: 'service-frontend', kind: 'phone', cover: 'dash', name: 'Overview', ...lavender, w: 1000, h: 1400 },
  { file: 'service-backend', kind: 'laptop', cover: 'api', ...stone, lw: 86, w: 1000, h: 1400 },
  { file: 'service-performance', kind: 'closeup', cover: 'shop', ...warm, w: 1000, h: 1400 },
  { file: 'service-infrastructure', kind: 'monitor', cover: 'deploy', ...night, lw: 90, w: 1000, h: 1400 },

  { file: 'about-desk', kind: 'monitor', cover: 'dash', ...warm, lw: 84, w: 1000, h: 1300 },
  ...['climbing', 'camera', 'keyboard', 'running'].map((hobby) => ({ file: `hobby-${hobby}`, kind: 'hobby', hobby, bg: '#edeae6', w: 800, h: 1000 })),
];
