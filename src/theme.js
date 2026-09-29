export const THEMES = {
  laranja: {
    label: 'Laranja',
    '--color-primary': '#f97316',
    '--color-primary-hover': '#ea580c',
    '--color-primary-light': '#fff7ed',
    '--color-primary-soft': '#ffedd5',
  },
  azul: {
    label: 'Azul',
    '--color-primary': '#2563eb',
    '--color-primary-hover': '#1d4ed8',
    '--color-primary-light': '#eff6ff',
    '--color-primary-soft': '#dbeafe',
  },
  verde: {
    label: 'Verde',
    '--color-primary': '#16a34a',
    '--color-primary-hover': '#15803d',
    '--color-primary-light': '#f0fdf4',
    '--color-primary-soft': '#dcfce7',
  },
  roxo: {
    label: 'Roxo',
    '--color-primary': '#7c3aed',
    '--color-primary-hover': '#6d28d9',
    '--color-primary-light': '#f5f3ff',
    '--color-primary-soft': '#ede9fe',
  },
  rosa: {
    label: 'Rosa',
    '--color-primary': '#db2777',
    '--color-primary-hover': '#be185d',
    '--color-primary-light': '#fdf2f8',
    '--color-primary-soft': '#fce7f3',
  },
};

const STORAGE_KEY = 'theme';

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.laranja;
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    if (key.startsWith('--')) root.style.setProperty(key, value);
  });
  localStorage.setItem(STORAGE_KEY, themeKey);
}

export function getSavedTheme() {
  return localStorage.getItem(STORAGE_KEY) || 'laranja';
}