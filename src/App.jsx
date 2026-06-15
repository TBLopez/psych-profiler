import { lazy, Suspense, useRef } from 'react';
import { InterviewProvider, useInterviewState } from './context/InterviewContext';
import AmbientEnvironment from './components/AmbientEnvironment';
import ScreenTransition from './components/ScreenTransition';
import ErrorBoundary from './components/ErrorBoundary';
import { useCursorGlow } from './hooks/useCursorGlow';

const PasswordGate = lazy(() => import('./screens/PasswordGate'));
const InterviewChat = lazy(() => import('./screens/InterviewChat'));
const ReportView = lazy(() => import('./screens/ReportView'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas gap-3">
      <div className="w-7 h-7 border-2 border-border border-t-accent-primary rounded-full animate-spin" />
      <span className="text-xs text-ink-muted">Loading...</span>
    </div>
  );
}

function ScreenRouter() {
  const { screen, phase } = useInterviewState();
  const prevScreenRef = useRef(screen);

  const prevScreen = prevScreenRef.current;
  prevScreenRef.current = screen;

  return (
    <ScreenTransition screen={screen} previousScreen={prevScreen}>
      <Suspense fallback={<LoadingFallback />}>
        {screen === 'gate' && <PasswordGate />}
        {screen === 'interview' && <ErrorBoundary><InterviewChat /></ErrorBoundary>}
        {screen === 'report' && <ErrorBoundary><ReportView /></ErrorBoundary>}
      </Suspense>
    </ScreenTransition>
  );
}

function AppInner() {
  const { phase, screen } = useInterviewState();
  const cursorGlow = useCursorGlow();

  return (
    <div
      onMouseMove={cursorGlow.handleMouseMove}
      onMouseLeave={cursorGlow.handleMouseLeave}
    >
      <AmbientEnvironment
        phase={phase}
        cursorPosition={cursorGlow.position}
        isTouchDevice={cursorGlow.isTouchDevice}
      />
      <main>
        <ScreenRouter />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <InterviewProvider>
      <AppInner />
    </InterviewProvider>
  );
}
