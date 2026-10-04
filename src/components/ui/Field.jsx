import { useId } from 'react';

/**
 * Campo de formulário com rótulo, contador de caracteres e dica.
 * Uso: <Field label="SKU" max={40} value={v} onChange={...} hint="..." />
 * `as="textarea"` ou `as="select"` (com <option>s como children).
 */
// Tipos de input em que `max` é limite de caracteres (nos demais, como number e date, é o valor máximo)
const TEXT_TYPES = [undefined, 'text', 'email', 'password', 'tel', 'search', 'url'];

export default function Field({ label, hint, max, value = '', as: Tag = 'input', optional, className = '', children, ...inputProps }) {
  const id = useId();
  const length = String(value ?? '').length;
  const isText = Tag === 'textarea' || (Tag === 'input' && TEXT_TYPES.includes(inputProps.type));
  const showCounter = Boolean(max) && isText;
  const near = showCounter && length >= max * 0.9;

  return (
    <div className={`field ${className}`}>
      <div className="field-label-row">
        <label htmlFor={id} className="field-label">
          {label}{optional && <span className="field-optional"> (opcional)</span>}
        </label>
        {showCounter && (
          <span className={`field-counter ${near ? 'near' : ''}`} aria-live="polite">
            {length}/{max}
          </span>
        )}
      </div>
      {/* children = <option>s quando as="select" */}
      <Tag
        id={id}
        value={value}
        maxLength={showCounter ? max : undefined}
        max={!isText && Tag === 'input' ? max : undefined}
        {...inputProps}
      >{children}</Tag>
      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}
