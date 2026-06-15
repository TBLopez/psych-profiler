import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { InterviewProvider, useInterviewState, useInterviewDispatch } from '../src/context/InterviewContext';

function wrapper({ children }) {
  return <InterviewProvider>{children}</InterviewProvider>;
}

describe('InterviewContext', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useInterviewState(), { wrapper });
    expect(result.current.screen).toBe('gate');
    expect(result.current.phase).toBe(1);
    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe('idle');
    expect(result.current.stats).toBeDefined();
  });

  it('UNLOCK transitions to interview screen', () => {
    const { result } = renderHook(() => ({ state: useInterviewState(), dispatch: useInterviewDispatch() }), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'UNLOCK', password: 'test123' });
    });

    expect(result.current.state.screen).toBe('interview');
    expect(result.current.state.password).toBe('test123');
  });

  it('ADD_MESSAGE appends to messages and updates stats', () => {
    const { result } = renderHook(() => ({ state: useInterviewState(), dispatch: useInterviewDispatch() }), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'ADD_MESSAGE', role: 'assistant', content: 'Hello' });
    });

    expect(result.current.state.messages).toHaveLength(1);
    expect(result.current.state.messages[0].role).toBe('assistant');
    expect(result.current.state.questionCount).toBe(1);
  });

  it('SET_PHASE updates phase and resets questionCount', () => {
    const { result } = renderHook(() => ({ state: useInterviewState(), dispatch: useInterviewDispatch() }), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'SET_PHASE', phase: 2 });
    });

    expect(result.current.state.phase).toBe(2);
    expect(result.current.state.questionCount).toBe(0);
    expect(result.current.state.stats.phasesCompleted).toBe(2);
  });

  it('SET_REPORT stores markdown and transitions to report', () => {
    const { result } = renderHook(() => ({ state: useInterviewState(), dispatch: useInterviewDispatch() }), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'SET_REPORT', report: '# Report' });
    });

    expect(result.current.state.screen).toBe('report');
    expect(result.current.state.reportMarkdown).toBe('# Report');
  });

  it('RESET returns to initial state', () => {
    const { result } = renderHook(() => ({ state: useInterviewState(), dispatch: useInterviewDispatch() }), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'UNLOCK', password: 'pw' });
      result.current.dispatch({ type: 'ADD_MESSAGE', role: 'assistant', content: 'Hi' });
      result.current.dispatch({ type: 'SET_PHASE', phase: 3 });
    });

    expect(result.current.state.screen).toBe('interview');
    expect(result.current.state.messages).toHaveLength(1);

    act(() => {
      result.current.dispatch({ type: 'RESET' });
    });

    expect(result.current.state.screen).toBe('gate');
    expect(result.current.state.messages).toEqual([]);
    expect(result.current.state.phase).toBe(1);
  });
});
