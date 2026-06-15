import { createContext, useContext, useReducer } from 'react';

const InterviewContext = createContext(null);
const InterviewDispatch = createContext(null);

const initialState = {
  screen: 'gate',        // 'gate' | 'interview' | 'report'
  password: '',
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
      return { ...initialState };
    }

    default:
      return state;
  }
}

export function InterviewProvider({ children }) {
  const [{ screen, password, phase, questionCount, messages, status, reportMarkdown, error, stats }, dispatch] =
    useReducer(reducer, initialState);

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
