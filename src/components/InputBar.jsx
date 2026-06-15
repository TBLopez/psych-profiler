import { useRef, useCallback, useState } from 'react';
import SendButton from './SendButton';

export default function InputBar({ value, onChange, onSend, onEnd, disabled, status }) {
  const textareaRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  const handleChange = (e) => {
    onChange(e.target.value);
    adjustHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  return (
    <div className="border-t border-border-light bg-surface shrink-0 px-3 py-2 pb-[calc(8px+env(safe-area-inset-bottom,0px))]">
      <div className={`flex gap-2 items-end bg-surface-raised rounded-2xl px-3 py-1.5 transition-shadow
        ${focused ? 'ring-2 ring-accent-primary/20' : ''}`}
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
          className="flex-1 resize-none bg-transparent border-none outline-none text-[16px] text-ink leading-relaxed placeholder:text-ink-muted py-2 min-h-[24px] max-h-[120px] font-sans"
          aria-label="Your response"
        />
        <SendButton disabled={disabled || !value.trim()} status={status} onClick={handleSend} />
      </div>
      <div className="flex justify-between items-center mt-1.5 px-1">
        <span className="text-[10px] text-ink-muted">Enter to send · Shift+Enter for new line</span>
        <button
          type="button"
          className="text-[10px] text-ink-muted hover:text-danger bg-transparent border-none cursor-pointer px-1.5 py-0.5 transition-colors"
          onClick={onEnd}
          aria-label="End interview"
        >
          End
        </button>
      </div>
    </div>
  );
}
