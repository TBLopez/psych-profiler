import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function StatsCounter({ value, label, delay = 0 }) {
  const reduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (reduced) {
      setDisplayValue(value);
      return;
    }

    const timer = setTimeout(() => {
      const duration = 1200;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(eased * value));

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, reduced]);

  return (
    <motion.div
      className="text-center"
      initial={reduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
    >
      <div className="text-2xl font-light text-ink tabular-nums">{displayValue}</div>
      <div className="text-[11px] text-ink-muted mt-1">{label}</div>
    </motion.div>
  );
}
