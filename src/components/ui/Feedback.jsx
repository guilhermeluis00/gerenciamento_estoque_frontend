import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import Modal from '../Modal';

const FeedbackContext = createContext(null);

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

/**
 * Avisos rápidos (toasts) e diálogo de confirmação no lugar do window.confirm,
 * que fica feio e pouco claro no celular.
 */
export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback((message, type = 'success') => {
    const id = ++nextId.current;
    setToasts((list) => [...list.slice(-2), { id, message, type }]);
    setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
  }, [dismiss]);

  const confirm = useCallback((options) => new Promise((resolve) => {
    setDialog({ ...options, resolve });
  }), []);

  function closeDialog(result) {
    dialog?.resolve(result);
    setDialog(null);
  }

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="toast-region" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} className={`toast toast-${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
              <Icon size={18} />
              <span>{t.message}</span>
              <button className="icon-btn toast-close" onClick={() => dismiss(t.id)} aria-label="Fechar aviso">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {dialog && (
        <Modal onClose={() => closeDialog(false)} size="sm">
          <div className="confirm-dialog">
            <h2>{dialog.title}</h2>
            {dialog.message && <p>{dialog.message}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => closeDialog(false)}>
                {dialog.cancelLabel || 'Cancelar'}
              </button>
              <button
                type="button"
                className={dialog.danger ? 'btn-danger-solid' : ''}
                onClick={() => closeDialog(true)}
                autoFocus
              >
                {dialog.confirmLabel || 'Confirmar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </FeedbackContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback precisa estar dentro de <FeedbackProvider>');
  return ctx;
}
