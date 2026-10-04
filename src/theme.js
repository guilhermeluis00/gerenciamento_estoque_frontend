// Cor de destaque: só a cor principal e a de hover. Os tons claros (fundo de item
// ativo, foco etc.) são derivados no CSS com color-mix, e funcionam no modo escuro.
export const THEMES = {
  laranja: { label: 'Laranja', '--color-primary': '#f97316', '--color-primary-hover': '#ea580c' },
  azul: { label: 'Azul', '--color-primary': '#2563eb', '--color-primary-hover': '#1d4ed8' },
  verde: { label: 'Verde', '--color-primary': '#16a34a', '--color-primary-hover': '#15803d' },
  roxo: { label: 'Roxo', '--color-primary': '#7c3aed', '--color-primary-hover': '#6d28d9' },
  rosa: { label: 'Rosa', '--color-primary': '#db2777', '--color-primary-hover': '#be185d' },
};

export const MODES = {
  light: 'Claro',
  dark: 'Escuro',
  system: 'Automático',
};

const STORAGE_KEY = 'theme';
const MODE_KEY = 'theme-mode';

function save(key, value) {
  try { localStorage.setItem(key, value); } catch { /* modo privado */ }
}
function load(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function applyTheme(themeKey) {
  const key = THEMES[themeKey] ? themeKey : 'laranja';
  const theme = THEMES[key];
  const root = document.documentElement;
  Object.entries(theme).forEach(([prop, value]) => {
    if (prop.startsWith('--')) root.style.setProperty(prop, value);
  });
  // Cor da barra do navegador no celular acompanha o tema
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme['--color-primary']);
  save(STORAGE_KEY, key);
}

export function getSavedTheme() {
  const saved = load(STORAGE_KEY);
  return THEMES[saved] ? saved : 'laranja';
}

/** light/dark força o modo; system segue a preferência do aparelho (via CSS). */
export function applyMode(mode) {
  const key = MODES[mode] ? mode : 'system';
  const root = document.documentElement;
  if (key === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', key);
  save(MODE_KEY, key);
}

export function getSavedMode() {
  const saved = load(MODE_KEY);
  return MODES[saved] ? saved : 'system';
}
