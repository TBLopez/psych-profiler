import { motion } from 'framer-motion';
import { ArrowUp, Loader2, Check } from 'lucide-react';

export default function SendButton({ disabled, status, onClick }) {
  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ background: isComplete ? 'linear-gradient(135deg, #059669, #10B981)' : 'linear-gradient(135deg, #4F46E5, #6366F1)' }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      aria-label={isProcessing ? 'Sending...' : isComplete ? 'Sent' : 'Send message'}
    >
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-white flex items-center justify-center"
      >
        {isProcessing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isComplete ? (
          <Check size={16} />
        ) : (
          <ArrowUp size={16} />
        )}
      </motion.span>
    </motion.button>
  );
}
