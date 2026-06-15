import { motion } from 'framer-motion';
import { ArrowUp, Loader2, Check } from 'lucide-react';

export default function SendButton({ disabled, status, onClick }) {
  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed bg-accent-primary text-white"
      whileTap={{ scale: 0.92 }}
      aria-label={isProcessing ? 'Sending...' : isComplete ? 'Sent' : 'Send message'}
    >
      {isProcessing ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isComplete ? (
        <Check size={14} />
      ) : (
        <ArrowUp size={14} />
      )}
    </motion.button>
  );
}
