import { useRef, useEffect, useState } from 'react';
import { PHASE_COLORS } from '../lib/phaseColors';

export function usePhaseAmbience(phase) {
  const [ambientColors, setAmbientColors] = useState(PHASE_COLORS[phase]);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase;
      setAmbientColors(PHASE_COLORS[phase]);
    }
  }, [phase]);

  return ambientColors;
}
