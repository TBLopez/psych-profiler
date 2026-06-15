import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { verifyPassword } from '../lib/api';
import { useInterviewDispatch } from '../context/InterviewContext';

export default function PasswordGate() {
  const dispatch = useInterviewDispatch();
  const reduced = useReducedMotion();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const pw = password.trim();
    if (!pw) {
      setError('Please enter the access code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await verifyPassword(pw);
      if (result.valid) {
        dispatch({ type: 'UNLOCK', password: pw });
      } else {
        setError('Incorrect code. Please try again.');
      }
    } catch {
      setError('Cannot reach server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-canvas">
      <motion.div
        className="max-w-[380px] w-full text-center"
        initial={reduced ? {} : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        {/* Brand mark */}
        <motion.div
          className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-2xl shadow-[0_8px_32px_rgba(79,70,229,0.15)]"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)' }}
          animate={reduced ? {} : { scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ◆
        </motion.div>

        <h1 className="text-[32px] font-[200] tracking-[-1px] text-ink mb-2 leading-tight">
          Psychological<br />Profile
        </h1>
        <p className="text-[14px] text-ink-secondary leading-relaxed mb-8 max-w-[300px] mx-auto">
          A confidential behavioral interview. Enter the access code you received to begin.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Access code"
            autoFocus
            autoComplete="off"
            className={`w-full px-5 py-3.5 bg-white border rounded-2xl text-[15px] text-ink text-center tracking-[3px] outline-none transition-all
              ${error ? 'border-danger ring-2 ring-danger/20' : 'border-border focus:border-accent-primary focus:ring-2 focus:ring-accent-glow-primary'}`}
            aria-label="Access code"
            aria-invalid={!!error}
            aria-describedby={error ? 'gate-error' : undefined}
          />

          {error && (
            <motion.p
              id="gate-error"
              className="text-xs text-danger mt-2.5"
              role="alert"
              initial={reduced ? {} : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-accent-primary to-accent-deep text-white rounded-2xl text-[15px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90 shadow-[0_4px_16px_rgba(79,70,229,0.2)]"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Verifying...' : 'Continue →'}
          </motion.button>
        </form>

        <p className="text-[11px] text-ink-muted mt-5">
          All responses are confidential. Nothing is stored.
        </p>
      </motion.div>
    </div>
  );
}
