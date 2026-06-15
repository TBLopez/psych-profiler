import { describe, it, expect } from 'vitest';
import { detectPhase } from '../src/lib/detectPhase';

describe('detectPhase', () => {
  it('returns null for empty input', () => {
    expect(detectPhase('')).toBeNull();
    expect(detectPhase(null)).toBeNull();
    expect(detectPhase(undefined)).toBeNull();
  });

  it('detects Phase 1 (Baseline)', () => {
    expect(detectPhase('Let me start with baseline questions to understand who you are.')).toBe(1);
    expect(detectPhase('Establishing rapport...')).toBe(1);
  });

  it('detects Phase 2 (Cognitive & Emotional)', () => {
    expect(detectPhase('Let explore your cognitive patterns and emotional regulation.')).toBe(2);
    expect(detectPhase('Your decision-making style indicates...')).toBe(2);
  });

  it('detects Phase 3 (Relational & Social)', () => {
    expect(detectPhase('Now examining attachment and relational dynamics...')).toBe(3);
    expect(detectPhase('Your conflict communication style...')).toBe(3);
  });

  it('detects Phase 4 (Shadow / Vulnerability)', () => {
    expect(detectPhase('Let us examine the Shadow aspects you might keep hidden')).toBe(4);
    expect(detectPhase('What blind spots do you recognize? I see a Shadow aspect here')).toBe(4);
  });

  it('detects Phase 5 (Profile)', () => {
    expect(detectPhase('--- EXECUTIVE SUMMARY ---')).toBe(5);
    expect(detectPhase('PSYCHOLOGICAL PROFILE')).toBe(5);
  });
});
