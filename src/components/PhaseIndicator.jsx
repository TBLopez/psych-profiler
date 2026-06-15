import { motion } from 'framer-motion';
import { PHASE_NAMES, PHASE_GRADIENTS } from '../lib/phaseColors';

const TOTAL_PHASES = 5;

export default function PhaseIndicator({ phase, questionCount }) {
  if (!phase) return null;

  const gradientClass = PHASE_GRADIENTS[phase] || PHASE_GRADIENTS[1];
  const phaseName = PHASE_NAMES[phase] || 'Interview';

  return (
    <div
      className="flex items-center gap-2.5"
      aria-live="polite"
      aria-label={`Phase ${phase}: ${phaseName}, question ${questionCount}`}
    >
      {/* Progress dots */}
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: TOTAL_PHASES }, (_, i) => i + 1).map(p => (
          <motion.div
            key={p}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
              p < phase ? 'bg-accent-primary/30' :
              p === phase ? `bg-gradient-to-br ${gradientClass}` :
              'bg-border'
            }`}
            animate={p === phase ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Phase name + question count */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className={`font-medium bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
          {phaseName}
        </span>
        <span className="text-ink-muted">Q{questionCount}</span>
      </div>
    </div>
  );
}
