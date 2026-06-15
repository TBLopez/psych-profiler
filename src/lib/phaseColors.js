// Phase color configurations for ambient environment
export const PHASE_COLORS = {
  1: {
    name: 'Baseline',
    orb: 'rgba(79, 70, 229, 0.04)',      // indigo, very subtle
    accent: '#4F46E5',
    gradient: 'radial-gradient(circle, rgba(79,70,229,0.06), transparent 70%)',
  },
  2: {
    name: 'Cognitive & Emotional',
    orb: 'rgba(79, 70, 229, 0.05)',
    accent: '#6366F1',
    gradient: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
  },
  3: {
    name: 'Relational & Social',
    orb: 'rgba(124, 58, 237, 0.05)',     // violet shift
    accent: '#7C3AED',
    gradient: 'radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)',
  },
  4: {
    name: 'Vulnerability Probe',
    orb: 'rgba(124, 58, 237, 0.06)',     // deeper violet
    accent: '#8B5CF6',
    gradient: 'radial-gradient(circle, rgba(139,92,246,0.07), transparent 70%)',
  },
  5: {
    name: 'Profile Delivery',
    orb: 'rgba(5, 150, 105, 0.05)',      // emerald resolution
    accent: '#059669',
    gradient: 'radial-gradient(circle, rgba(5,150,105,0.06), transparent 70%)',
  },
};

// Phase badge gradient classes (Tailwind)
export const PHASE_GRADIENTS = {
  1: 'from-accent-primary to-accent-primary-light',
  2: 'from-accent-primary to-accent-primary-light',
  3: 'from-accent-deep to-accent-deep-light',
  4: 'from-accent-deep to-accent-deep-light',
  5: 'from-accent-positive to-accent-positive-light',
};

// Phase names for display
export const PHASE_NAMES = {
  1: 'Baseline',
  2: 'Cognitive & Emotional',
  3: 'Relational & Social',
  4: 'Vulnerability Probe',
  5: 'Profile Delivery',
};

// Interpolate between two phase colors (for ambient transitions)
export function interpolatePhaseColor(fromPhase, toPhase, progress) {
  const fromColor = PHASE_COLORS[fromPhase]?.orb || PHASE_COLORS[1].orb;
  const toColor = PHASE_COLORS[toPhase]?.orb || PHASE_COLORS[5].orb;
  if (progress >= 1) return toColor;
  if (progress <= 0) return fromColor;
  return toColor;
}
