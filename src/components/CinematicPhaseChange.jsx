import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function CinematicPhaseChange({ oldPhase, newPhase, children }) {
  const reduced = useReducedMotion();

  if (oldPhase === newPhase || !newPhase) return children;
  if (reduced) return children;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={newPhase}
        initial={{ opacity: 0, x: 30, filter: 'blur(2px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, x: -30, filter: 'blur(2px)' }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Phase change indicator */}
        <motion.div
          className="text-center py-3 my-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <span className="text-[11px] font-medium text-ink-muted bg-gradient-to-r from-accent-primary/10 to-accent-deep/10 px-4 py-1.5 rounded-full border border-accent-primary/10">
            Phase {oldPhase} → Phase {newPhase}
          </span>
        </motion.div>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
