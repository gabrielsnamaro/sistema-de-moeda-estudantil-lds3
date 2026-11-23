import { useEffect, useRef } from 'react';
import { mountAvatar } from 'open-bot-avatar/dom';
import { CAPELO_DEFINITION } from '../mascot/capeloAvatar';

export default function BotAvatar({
  size = 96,
  definition = CAPELO_DEFINITION,
  color = '#f59e0b',
  eyeColor = '#18181b',
  state = 'idle',
  mood = 'neutral',
  material = 'fluffy',
  followPointer = true,
  lookAt,
  depth = 7,
  still = false,
  label = 'Capelo, mascote da Moeda Estudantil',
  className = '',
  style,
}) {
  const hostRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;

    avatarRef.current = mountAvatar(el, {
      definition,
      color,
      eyeColor,
      state,
      mood,
      material,
      followPointer,
      ...(lookAt ? { lookAt } : {}),
      depth,
      still,
      label,
    });

    return () => {
      avatarRef.current?.destroy();
      avatarRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definition]);

  useEffect(() => {
    if (!avatarRef.current) return;
    avatarRef.current.update({
      color,
      eyeColor,
      state,
      mood,
      material,
      followPointer,
      lookAt: lookAt ?? null,
      depth,
      still,
      label,
    });
  }, [color, eyeColor, state, mood, material, followPointer, lookAt, depth, still, label]);

  return (
    <div
      ref={hostRef}
      className={`bot-avatar-host ${className}`.trim()}
      style={{
        width: size,
        height: size,
        aspectRatio: '1',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
