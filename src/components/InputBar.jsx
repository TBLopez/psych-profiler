import { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import SendButton from './SendButton';

export default function InputBar({ value, onChange, onSend, onEnd, disabled, status }) {
  const textareaRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  const handleChange = (e) => {
    onChange(e.target.value);
    adjustHeight();
    if (e.target.value && !hasTyped) setHasTyped(true);
    if (!e.target.value) setHasTyped(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        setHasTyped(false);
        onSend();
      }
    }
    if (e.key === 'Escape') {
      e.target.blur();
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      setHasTyped(false);
      onSend();
    }
  };

  const isProcessing = status === 'processing';

  return (
    <div className="border-t border-border-light bg-surface/90 backdrop-blur-md px-3 sm:px-4 md:px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] shrink-0">
      <motion.div
        className={`flex gap-2 items-end bg-white/90 backdrop-blur-sm border rounded-2xl px-4 py-2.5 transition-colors
          ${focused ? 'border-accent-primary shadow-[0_0_0_3px_var(--color-accent-glow-primary)]' : 'border-border'}`}
        animate={{
          y: focused ? -2 : 0,
          scale: hasTyped ? 1.005 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type your response..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent border-none outline-none text-[15px] text-ink leading-relaxed placeholder:text-ink-muted py-1.5 min-h-[24px] max-h-[120px] font-sans"
          aria-label="Your response"
        />
        <SendButton disabled={disabled || !value.trim()} status={status} onClick={handleSend} />
      </motion.div>
      <div className="flex justify-between items-center mt-1.5 px-1">
        <span className="text-[11px] text-ink-muted">Enter to send · Shift+Enter for new line</span>
        <button
          type="button"
          className="text-[11px] text-ink-muted hover:text-danger bg-transparent border-none cursor-pointer px-2 py-1 rounded transition-colors"
          onClick={onEnd}
          aria-label="End interview"
        >
          End interview
        </button>
      </div>
    </div>
  );
}
