import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import BotAvatar from './BotAvatar';
import { useMascot } from '../contexts/MascotContext';

export default function MascotDock() {
  const {
    state,
    mood,
    material,
    toggleMaterial,
    bubbleText,
    bubbleOpen,
    setBubbleOpen,
    cycleTip,
  } = useMascot();

  return (
    <aside className="mascot-dock" aria-label="Assistente mascote Capelo">
      <AnimatePresence>
        {bubbleOpen && bubbleText && (
          <motion.div
            key="mascot-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mascot-bubble"
          >
            <div className="mascot-bubble-header">
              <span className="mascot-bubble-label">Capelo</span>
              <div className="mascot-bubble-actions">
                <button
                  type="button"
                  className="mascot-mini-btn"
                  onClick={toggleMaterial}
                  title="Alternar textura do mascote (Fluffy / Flat)"
                >
                  <Sparkles size={11} />
                  {material === 'fluffy' ? 'Fluffy' : 'Flat'}
                </button>
                <button
                  type="button"
                  className="mascot-mini-btn"
                  onClick={() => setBubbleOpen(false)}
                  aria-label="Minimizar balão do Capelo"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
            <div>{bubbleText}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className="mascot-trigger"
        onClick={() => {
          if (!bubbleOpen) {
            setBubbleOpen(true);
          } else {
            cycleTip();
          }
        }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 450, damping: 24 }}
        title="Clique no Capelo para uma dica"
        aria-label="Interagir com o mascote Capelo"
      >
        <span className={`mascot-status-dot ${state}`} aria-hidden="true" />
        <BotAvatar
          size={66}
          state={state}
          mood={mood}
          material={material}
          followPointer
          color="#f59e0b"
          eyeColor="#18181b"
          label=""
        />
      </motion.button>
    </aside>
  );
}
