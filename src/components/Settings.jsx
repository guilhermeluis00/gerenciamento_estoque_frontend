import { useState } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { MODES, THEMES, applyMode, applyTheme, getSavedMode, getSavedTheme } from '../theme';

const MODE_ICONS = { light: Sun, dark: Moon, system: Monitor };

export default function Settings() {
  const [selected, setSelected] = useState(getSavedTheme());
  const [mode, setMode] = useState(getSavedMode());

  function handleSelect(key) {
    applyTheme(key);
    setSelected(key);
  }

  function handleMode(key) {
    applyMode(key);
    setMode(key);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Configurações</h1>
      </div>

      <div className="panel">
        <h2>Aparência</h2>
        <p className="panel-description">“Automático” segue o modo claro/escuro do seu aparelho.</p>
        <div className="mode-options" role="radiogroup" aria-label="Aparência">
          {Object.entries(MODES).map(([key, label]) => {
            const Icon = MODE_ICONS[key];
            return (
              <button
                key={key} type="button" role="radio" aria-checked={mode === key}
                className={`mode-option ${mode === key ? 'selected' : ''}`}
                onClick={() => handleMode(key)}
              >
                <Icon size={20} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <h2>Cor de destaque</h2>
        <p className="panel-description">Usada em botões, links e no menu lateral.</p>

        <div className="theme-options" role="radiogroup" aria-label="Cor de destaque">
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected === key}
              className={`theme-swatch ${selected === key ? 'selected' : ''}`}
              style={{ background: theme['--color-primary'] }}
              onClick={() => handleSelect(key)}
            >
              {selected === key && <Check size={18} className="theme-check" />}
              {theme.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
