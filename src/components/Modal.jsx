import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/** Modal com fechamento por Esc / clique fora e scroll do fundo travado. No celular vira "bottom sheet". */
export default function Modal({ onClose, children, size = 'md' }) {
  // Ref para não re-registrar o listener a cada render do pai (onClose costuma ser inline)
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-card modal-${size}`} role="dialog" aria-modal="true">
        <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
