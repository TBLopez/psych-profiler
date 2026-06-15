import { motion, useReducedMotion } from 'framer-motion';

export default function CursorGlow({ position, isTouchDevice }) {
  const reduced = useReducedMotion();

  if (isTouchDevice || reduced) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[-5]"
      aria-hidden="true"
      style={{
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.04), transparent 70%)',
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
      }}
      transition={{ type: 'spring', stiffness: 50, damping: 30 }}
    />
  );
}
