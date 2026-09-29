import { useState } from 'react';
import { THEMES, applyTheme, getSavedTheme } from '../theme';

export default function Settings() {
  const [selected, setSelected] = useState(getSavedTheme());

  function handleSelect(key) {
    applyTheme(key);
    setSelected(key);
  }

  return (
    <div>
      <h1>Configurações</h1>

      <div className="panel" style={{ marginTop: 20 }}>
        <h2>Cor do sistema</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13.5, marginBottom: 16 }}>
          Escolha a cor de destaque usada em botões, links e menu lateral.
        </p>

        <div className="theme-options">
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key}
              type="button"
              className={`theme-swatch ${selected === key ? 'selected' : ''}`}
              style={{ background: theme['--color-primary'] }}
              onClick={() => handleSelect(key)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}