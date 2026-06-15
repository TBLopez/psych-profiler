import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useInterviewState } from '../context/InterviewContext';
import { useInterview } from '../hooks/useInterview';
import { downloadReport, printReport } from '../lib/downloadReport';
import StatusMessage from '../components/StatusMessage';
import StatsCounter from '../components/StatsCounter';
import ReportPreview from '../components/ReportPreview';
import SparkleBurst from '../components/SparkleBurst';
import { CheckCircle } from 'lucide-react';

export default function ReportView() {
  const reduced = useReducedMotion();
  const { messages, reportMarkdown, status, error, stats } = useInterviewState();
  const { generateReport, reset } = useInterview();
  const isProcessing = status === 'processing';
  const hasReport = !!reportMarkdown;
  const [showSparkles, setShowSparkles] = useState(false);

  const handleGenerate = async () => {
    await generateReport();
  };

  const handleDownload = () => {
    if (reportMarkdown) {
      downloadReport(reportMarkdown);
    }
  };

  const handlePrint = () => {
    if (reportMarkdown) {
      printReport(reportMarkdown);
    }
  };

  const handleReset = () => {
    reset();
  };

  // Sparkle celebration when report is ready
  const prevReportRef = useRef(null);
  useEffect(() => {
    if (reportMarkdown && reportMarkdown !== prevReportRef.current) {
      prevReportRef.current = reportMarkdown;
      setShowSparkles(true);
    }
  }, [reportMarkdown]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-canvas">
      <motion.div
        className="max-w-[440px] w-full text-center"
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      >
        {/* Completion icon */}
        <motion.div
          className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center shadow-[0_8px_32px_rgba(5,150,105,0.2)]"
          style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
          initial={reduced ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <CheckCircle size={32} className="text-white" />
        </motion.div>

        <h2 className="text-[28px] font-[200] tracking-[-0.5px] text-ink mb-2">
          Interview Complete
        </h2>
        <p className="text-[14px] text-ink-secondary leading-relaxed mb-8 max-w-[340px] mx-auto">
          Your psychological profile has been synthesized from your conversation across 5 phases of assessment.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-10 mb-8">
          <StatsCounter value={stats.phasesCompleted} label="Phases explored" delay={200} />
          <StatsCounter value={stats.questionsAnswered} label="Questions answered" delay={500} />
          <StatsCounter value={stats.domainsAnalyzed} label="Domains analyzed" delay={800} />
        </div>

        {/* Report preview */}
        {!hasReport && (
          <motion.div
            className="mb-8"
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-3">
              Report Contents
            </div>
            <ReportPreview />
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 items-center">
          {!hasReport ? (
            <motion.button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-accent-primary to-accent-deep text-white rounded-2xl text-[15px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90 shadow-[0_4px_16px_rgba(79,70,229,0.2)]"
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? 'Generating...' : 'Generate Full Report'}
            </motion.button>
          ) : (
            <>
              <motion.button
                onClick={handlePrint}
                className="w-full py-3.5 bg-gradient-to-r from-accent-primary to-accent-deep text-white rounded-2xl text-[15px] font-medium transition-opacity hover:opacity-90 shadow-[0_4px_16px_rgba(79,70,229,0.2)]"
                whileTap={{ scale: 0.98 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Save as PDF
              </motion.button>
              <motion.button
                onClick={handleDownload}
                className="w-full py-3.5 bg-white text-ink-secondary border border-border rounded-2xl text-[14px] font-medium transition-colors hover:bg-surface-raised hover:text-ink"
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Download HTML
              </motion.button>
            </>
          )}
          <button
            onClick={handleReset}
            className="w-full py-3.5 bg-surface text-ink-secondary border border-border rounded-2xl text-[15px] font-medium transition-colors hover:bg-surface-raised hover:text-ink"
          >
            New Session
          </button>
        </div>

        {error && <StatusMessage type="error">{error}</StatusMessage>}

        <p className="text-[11px] text-ink-muted mt-6">
          Save as PDF opens a print dialog. Download HTML saves a self-contained file you can open in any browser.
        </p>
      </motion.div>

      <SparkleBurst trigger={showSparkles} onComplete={() => setShowSparkles(false)} />
    </div>
  );
}
