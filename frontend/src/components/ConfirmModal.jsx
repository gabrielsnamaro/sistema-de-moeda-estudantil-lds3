import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Mail, X } from 'lucide-react';
import BotAvatar from './BotAvatar';

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, loading, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => !loading && onClose?.()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="confirm-modal-title" className="modal-title">
                {title}
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={onClose}
                disabled={loading}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">{description}</div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`btn ${variant === 'danger' ? 'btn-danger-solid' : 'btn-coin'}`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Processando...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CupomModal({ resultado, onClose }) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setCopiado(false);
    if (!resultado) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resultado, onClose]);

  async function copiarCodigo() {
    if (!resultado?.cupom?.codigoGerado) return;
    try {
      await navigator.clipboard.writeText(resultado.cupom.codigoGerado);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2200);
    } catch {
      // fallback silently
    }
  }

  return (
    <AnimatePresence>
      {resultado && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cupom-modal-title"
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
              <BotAvatar
                size={92}
                state="done"
                mood="happy"
                material="fluffy"
                followPointer
                color="#f59e0b"
              />
              <div>
                <h3 id="cupom-modal-title" className="modal-title">
                  Vantagem resgatada!
                </h3>
                <p className="card-subtitle" style={{ marginTop: 4 }}>
                  {resultado.cupom.vantagemTitulo} · {resultado.cupom.empresaNome}
                </p>
              </div>

              <div className="cupom-ticket-code-row" style={{ width: '100%' }}>
                <span className="cupom-codigo cupom-codigo-lg">
                  {resultado.cupom.codigoGerado}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={copiarCodigo}
                >
                  {copiado ? <Check size={15} /> : <Copy size={15} />}
                  {copiado ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <div style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {resultado.emails.map((email, idx) => (
                  <div
                    key={idx}
                    className={`alert ${email.enviado ? 'alert-success' : 'alert-warning'}`}
                    style={{ marginBottom: 0, padding: '0.6rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <Mail size={15} />
                    <span>{email.mensagem}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.35rem' }}
                onClick={onClose}
              >
                Concluir
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
