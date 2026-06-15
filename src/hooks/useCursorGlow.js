import { useState, useCallback, useEffect } from 'react';

export function useCursorGlow() {
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(hasCoarsePointer);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isTouchDevice) return;
    setPosition({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, [isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0.5, y: 0.5 });
  }, []);

  return { position, isTouchDevice, handleMouseMove, handleMouseLeave };
}
