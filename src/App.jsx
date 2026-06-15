import { lazy, Suspense, useRef } from 'react';
import { InterviewProvider, useInterviewState } from './context/InterviewContext';
import AmbientEnvironment from './components/AmbientEnvironment';
import ScreenTransition from './components/ScreenTransition';
import { useCursorGlow } from './hooks/useCursorGlow';

const PasswordGate = lazy(() => import('./screens/PasswordGate'));
const InterviewChat = lazy(() => import('./screens/InterviewChat'));
const ReportView = lazy(() => import('./screens/ReportView'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="w-7 h-7 border-2 border-border border-t-accent-primary rounded-full animate-spin" />
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
        {screen === 'interview' && <InterviewChat />}
        {screen === 'report' && <ReportView />}
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
