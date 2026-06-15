import { motion, useReducedMotion } from 'framer-motion';
import { usePhaseAmbience } from '../hooks/usePhaseAmbience';
import CursorGlow from './CursorGlow';

export default function AmbientEnvironment({ phase, cursorPosition, isTouchDevice }) {
  const reduced = useReducedMotion();
  const ambient = usePhaseAmbience(phase);

  if (reduced) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      {/* Cursor-responsive glow (desktop only) */}
      <CursorGlow position={cursorPosition} isTouchDevice={isTouchDevice} />

      {/* Top-right orb */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full"
        style={{
          background: ambient.gradient,
          top: '-8%',
          right: '-12%',
        }}
        animate={{
          scale: [1, 1.12, 1],
          x: [0, -20, 0],
          y: [0, 12, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Bottom-left orb */}
      <motion.div
        className="absolute w-[280px] h-[280px] rounded-full"
        style={{
          background: ambient.gradient,
          bottom: '-10%',
          left: '-8%',
        }}
        animate={{
          scale: [1, 1.18, 1],
          x: [0, 15, 0],
          y: [0, -10, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center-right orb (subtle, Phase 3+) */}
      {phase >= 3 && (
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.04), transparent 70%)',
            top: '40%',
            right: '-5%',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: [1, 1.1, 1], y: [0, -8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
          animation: 'noise 8s steps(10) infinite',
        }}
      />
    </div>
  );
}
