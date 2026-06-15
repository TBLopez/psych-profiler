import { motion } from 'framer-motion';

const dot = {
  animate: { scale: [0.6, 1, 0.6], opacity: [0.3, 1, 0.3] },
  transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
};

export default function TypingIndicator() {
  return (
    <motion.div
      className="flex items-center gap-2.5 py-2 px-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="status"
      aria-label="Interviewer is formulating"
    >
      <div className="flex gap-1">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.span
            key={i}
            className="inline-block w-1.5 h-1.5 rounded-full bg-ink-muted"
            animate={dot.animate}
            transition={{ ...dot.transition, delay }}
          />
        ))}
      </div>
      <span className="text-xs text-ink-muted italic">Formulating...</span>
    </motion.div>
  );
}
