import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DICAS_POR_CONTEXTO } from '../mascot/capeloAvatar';

const MascotContext = createContext(null);

export function MascotProvider({ children }) {
  const [contextKey, setContextKey] = useState('login');
  const [state, setState] = useState('idle');
  const [mood, setMood] = useState('happy');
  const [material, setMaterial] = useState(() => {
    try {
      return localStorage.getItem('moedaEstudantil.mascotMaterial') || 'fluffy';
    } catch {
      return 'fluffy';
    }
  });
  const [bubbleText, setBubbleText] = useState(DICAS_POR_CONTEXTO.login[0]);
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const tipIndexRef = useRef(0);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => clearTimer(), []);

  const setContext = useCallback((nextKey) => {
    setContextKey((prev) => {
      if (prev === nextKey) return prev;
      tipIndexRef.current = 0;
      const dicas = DICAS_POR_CONTEXTO[nextKey] || DICAS_POR_CONTEXTO.login;
      setBubbleText(dicas[0]);
      return nextKey;
    });
  }, []);

  const react = useCallback(
    (
      message,
      {
        nextState = 'idle',
        nextMood = 'happy',
        durationMs = 4500,
        openBubble = true,
      } = {},
    ) => {
      clearTimer();
      setState(nextState);
      setMood(nextMood);
      if (message) {
        setBubbleText(message);
      }
      if (openBubble) {
        setBubbleOpen(true);
      }

      if (durationMs > 0) {
        timerRef.current = window.setTimeout(() => {
          setState('idle');
          setMood('neutral');
        }, durationMs);
      }
    },
    [],
  );

  const cycleTip = useCallback(() => {
    clearTimer();
    const dicas = DICAS_POR_CONTEXTO[contextKey] || DICAS_POR_CONTEXTO.login;
    tipIndexRef.current = (tipIndexRef.current + 1) % dicas.length;
    setBubbleText(dicas[tipIndexRef.current]);
    setBubbleOpen(true);
    setState('idle');
    setMood('happy');
    timerRef.current = window.setTimeout(() => {
      setMood('neutral');
    }, 3200);
  }, [contextKey]);

  const toggleMaterial = useCallback(() => {
    setMaterial((prev) => {
      const next = prev === 'fluffy' ? 'flat' : 'fluffy';
      try {
        localStorage.setItem('moedaEstudantil.mascotMaterial', next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return (
    <MascotContext.Provider
      value={{
        contextKey,
        setContext,
        state,
        mood,
        material,
        toggleMaterial,
        bubbleText,
        bubbleOpen,
        setBubbleOpen,
        react,
        cycleTip,
      }}
    >
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const ctx = useContext(MascotContext);
  if (!ctx) {
    throw new Error('useMascot deve ser usado dentro de MascotProvider.');
  }
  return ctx;
}
