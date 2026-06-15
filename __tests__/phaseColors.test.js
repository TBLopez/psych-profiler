import { describe, it, expect } from 'vitest';
import { PHASE_COLORS, PHASE_GRADIENTS, PHASE_NAMES, interpolatePhaseColor } from '../src/lib/phaseColors';

describe('phaseColors', () => {
  it('has color config for all 5 phases', () => {
    for (let i = 1; i <= 5; i++) {
      expect(PHASE_COLORS[i]).toBeDefined();
      expect(PHASE_COLORS[i].name).toBeDefined();
      expect(PHASE_COLORS[i].accent).toBeDefined();
    }
  });

  it('has gradient classes for all 5 phases', () => {
    for (let i = 1; i <= 5; i++) {
      expect(PHASE_GRADIENTS[i]).toBeDefined();
    }
  });

  it('has display names for all 5 phases', () => {
    for (let i = 1; i <= 5; i++) {
      expect(PHASE_NAMES[i]).toBeDefined();
    }
  });

  it('interpolatePhaseColor returns target at progress >= 1', () => {
    const result = interpolatePhaseColor(1, 5, 1);
    expect(result).toBe(PHASE_COLORS[5].orb);
  });

  it('interpolatePhaseColor returns source at progress <= 0', () => {
    const result = interpolatePhaseColor(1, 5, 0);
    expect(result).toBe(PHASE_COLORS[1].orb);
  });

  it('handles invalid phase numbers gracefully', () => {
    expect(interpolatePhaseColor(0, 6, 0.5)).toBeDefined();
  });
});
