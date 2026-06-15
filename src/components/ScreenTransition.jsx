import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const transitionVariants = {
  gateToInterview: {
    initial: { clipPath: 'circle(0% at 50% 85%)', opacity: 0 },
    animate: { clipPath: 'circle(150% at 50% 85%)', opacity: 1 },
    exit: { clipPath: 'circle(0% at 50% 85%)', opacity: 0 },
  },
  interviewToReport: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
  },
  reportToGate: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
};

export default function ScreenTransition({ screen, previousScreen, children }) {
  const reduced = useReducedMotion();

  const variantKey =
    previousScreen === 'gate' && screen === 'interview' ? 'gateToInterview' :
    previousScreen === 'interview' && screen === 'report' ? 'interviewToReport' :
    previousScreen === 'report' && screen === 'gate' ? 'reportToGate' :
    null;

  const variants = variantKey ? transitionVariants[variantKey] : {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (reduced) {
    return <AnimatePresence mode="wait">{children}</AnimatePresence>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ minHeight: '100vh' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
