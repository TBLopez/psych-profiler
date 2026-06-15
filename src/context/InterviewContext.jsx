import { createContext, useContext, useReducer, useEffect } from 'react';

const InterviewContext = createContext(null);
const InterviewDispatch = createContext(null);

const SESSION_KEY = 'psych_profiler_session';
const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.expires && Date.now() > session.expires) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(password) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      password,
      expires: Date.now() + SESSION_TTL,
    }));
  } catch { /* storage full or unavailable */ }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

const savedSession = loadSession();

const initialState = {
  screen: savedSession ? 'interview' : 'gate',
  password: savedSession?.password || '',
  phase: 1,
  questionCount: 0,
  messages: [],
  status: 'idle',        // 'idle' | 'processing' | 'complete' | 'error'
  reportMarkdown: null,
  error: null,
  stats: {
    phasesCompleted: 1,
    questionsAnswered: 0,
    domainsAnalyzed: 8,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'UNLOCK': {
      const { password } = action;
      saveSession(password);
      return { ...state, password, screen: 'interview', error: null };
    }

    case 'ADD_MESSAGE': {
      const { role, content } = action;
      const newMessages = [...state.messages, { role, content }];
      const newQuestionCount = role === 'assistant' ? state.questionCount + 1 : state.questionCount;
      return {
        ...state,
        messages: newMessages,
        questionCount: newQuestionCount,
        stats: {
          ...state.stats,
          questionsAnswered: newQuestionCount,
          phasesCompleted: state.phase,
        },
        error: null,
      };
    }

    case 'SET_PHASE': {
      const { phase } = action;
      if (phase && phase !== state.phase) {
        return {
          ...state,
          phase,
          questionCount: 0,
          stats: {
            ...state.stats,
            phasesCompleted: phase,
          },
        };
      }
      return state;
    }

    case 'SET_STATUS': {
      const { status } = action;
      return { ...state, status, error: status !== 'error' ? state.error : state.error };
    }

    case 'SET_REPORT': {
      const { report } = action;
      return { ...state, reportMarkdown: report, screen: 'report' };
    }

    case 'SET_ERROR': {
      const { error } = action;
      return { ...state, error, status: 'idle' };
    }

    case 'RESET': {
      clearSession();
      return { ...initialState, screen: 'gate', password: '', messages: [], status: 'idle', reportMarkdown: null, error: null };
    }

    default:
      return state;
  }
}

export function InterviewProvider({ children }) {
  const [{ screen, password, phase, questionCount, messages, status, reportMarkdown, error, stats }, dispatch] =
    useReducer(reducer, initialState);

  // If there's a saved session, mark status as idle so InterviewChat can start
  useEffect(() => {
    if (savedSession && screen === 'interview') {
      // Session restored — InterviewChat will start automatically on mount
    }
  }, []);

  return (
    <InterviewContext.Provider value={{ screen, password, phase, questionCount, messages, status, reportMarkdown, error, stats }}>
      <InterviewDispatch.Provider value={dispatch}>
        {children}
      </InterviewDispatch.Provider>
    </InterviewContext.Provider>
  );
}

export function useInterviewState() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterviewState must be inside InterviewProvider');
  return ctx;
}

export function useInterviewDispatch() {
  const dispatch = useContext(InterviewDispatch);
  if (!dispatch) throw new Error('useInterviewDispatch must be inside InterviewProvider');
  return dispatch;
}
