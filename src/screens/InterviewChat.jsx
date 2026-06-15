import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInterviewState } from '../context/InterviewContext';
import { useInterview } from '../hooks/useInterview';
import { useCursorGlow } from '../hooks/useCursorGlow';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import PhaseIndicator from '../components/PhaseIndicator';
import CinematicPhaseChange from '../components/CinematicPhaseChange';
import InputBar from '../components/InputBar';
import StatusMessage from '../components/StatusMessage';
import SparkleBurst from '../components/SparkleBurst';

export default function InterviewChat() {
  const { messages, phase, questionCount, status, error } = useInterviewState();
  const { startInterview, sendMessage, endInterview, retry } = useInterview();
  const [inputValue, setInputValue] = useState('');
  const [prevPhase, setPrevPhase] = useState(phase);
  const [showSparkles, setShowSparkles] = useState(false);
  const chatRef = useRef(null);
  const startedRef = useRef(false);

  // Cursor glow for desktop
  const cursorGlow = useCursorGlow();

  // Start interview on mount
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      startInterview();
    }
  }, [startInterview]);

  // Track phase changes
  useEffect(() => {
    if (phase !== prevPhase) {
      setPrevPhase(phase);
      if (phase === 5) {
        setShowSparkles(true);
      }
    }
  }, [phase, prevPhase]);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSend = useCallback(async () => {
    const text = inputValue;
    setInputValue('');
    await sendMessage(text);
  }, [inputValue, sendMessage]);

  const handleEndInterview = useCallback(() => {
    if (messages.length < 4) {
      endInterview();
      return;
    }
    if (window.confirm('End the interview? You can still generate a report.')) {
      endInterview();
    }
  }, [messages.length, endInterview]);

  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';

  return (
    <div
      className="flex flex-col h-screen h-[100dvh] max-w-[820px] mx-auto w-full relative"
      onMouseMove={cursorGlow.handleMouseMove}
      onMouseLeave={cursorGlow.handleMouseLeave}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-border-light bg-surface shrink-0 min-h-[56px]">
        <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
          <motion.span
            className="w-2 h-2 rounded-full bg-accent-primary opacity-70"
            animate={{ opacity: isProcessing ? [0.4, 1, 0.4] : 0.7 }}
            transition={{ duration: 2, repeat: isProcessing ? Infinity : 0 }}
          />
          Psychological Profile
        </div>
        <PhaseIndicator phase={phase} questionCount={questionCount} />
      </header>

      {/* Chat */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-5 py-4"
        role="log"
        aria-live="polite"
        aria-label="Interview conversation"
      >
        <CinematicPhaseChange oldPhase={prevPhase} newPhase={phase}>
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              role={msg.role}
              content={msg.content}
              isProfileDelivery={phase === 5}
            />
          ))}
        </CinematicPhaseChange>

        {isProcessing && <TypingIndicator />}

        {error && (
          <div className="flex flex-col gap-2">
            <StatusMessage type="error">{error}</StatusMessage>
            <button
              onClick={retry}
              className="text-xs text-accent-primary hover:text-accent-deep bg-accent-primary/5 hover:bg-accent-primary/10 border border-accent-primary/20 rounded-lg px-3 py-1.5 transition-colors self-start cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Sparkle celebration */}
      <SparkleBurst trigger={showSparkles} onComplete={() => setShowSparkles(false)} />

      {/* Input */}
      <InputBar
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        onEnd={handleEndInterview}
        disabled={isProcessing || isComplete}
        status={status}
      />
    </div>
  );
}
