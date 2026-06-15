import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const SPARKLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 300,
  y: (Math.random() - 0.5) * 300,
  scale: Math.random() * 0.5 + 0.5,
  rotation: Math.random() * 360,
  color: ['#4F46E5', '#7C3AED', '#EC4899', '#059669', '#10B981', '#F59E0B'][i % 6],
  delay: Math.random() * 0.3,
}));

export default function SparkleBurst({ trigger, onComplete }) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {trigger && !reduced && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          aria-hidden="true"
          exit={{ opacity: 0 }}
        >
          {SPARKLES.map(s => (
            <motion.div
              key={s.id}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: s.color }}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [1, 0],
                scale: [0, s.scale],
                x: s.x,
                y: s.y,
                rotate: s.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: s.delay, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
