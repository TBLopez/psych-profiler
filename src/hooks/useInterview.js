import { useCallback, useRef } from 'react';
import { useInterviewState, useInterviewDispatch } from '../context/InterviewContext';
import { useApi } from './useApi';
import { detectPhase } from '../lib/detectPhase';
import { SYSTEM_PROMPT } from '../lib/systemPrompt';

export function useInterview() {
  const { password, messages, phase, questionCount, status } = useInterviewState();
  const dispatch = useInterviewDispatch();
  const { doChat, doGenerateReport } = useApi(password);
  const abortRef = useRef(null);

  const startInterview = useCallback(async () => {
    dispatch({ type: 'SET_STATUS', status: 'processing' });
    try {
      const result = await doChat([], SYSTEM_PROMPT);
      const content = result.content;
      dispatch({ type: 'ADD_MESSAGE', role: 'assistant', content });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', error: e.message });
    } finally {
      dispatch({ type: 'SET_STATUS', status: 'idle' });
    }
  }, [doChat, dispatch]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || status === 'processing') return;
    dispatch({ type: 'ADD_MESSAGE', role: 'user', content: text.trim() });
    dispatch({ type: 'SET_STATUS', status: 'processing' });

    try {
      const currentMessages = [...messages, { role: 'user', content: text.trim() }];
      const apiMessages = currentMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const result = await doChat(apiMessages, SYSTEM_PROMPT);
      const content = result.content;
      dispatch({ type: 'ADD_MESSAGE', role: 'assistant', content });

      const newPhase = detectPhase(content);
      if (newPhase) {
        dispatch({ type: 'SET_PHASE', phase: newPhase });
      }

      if (newPhase === 5 && content.includes('--- 1. EXECUTIVE SUMMARY ---')) {
        dispatch({ type: 'SET_STATUS', status: 'complete' });
      } else {
        dispatch({ type: 'SET_STATUS', status: 'idle' });
      }
    } catch (e) {
      dispatch({ type: 'SET_ERROR', error: e.message });
      dispatch({ type: 'SET_STATUS', status: 'idle' });
    }
  }, [messages, status, doChat, dispatch]);

  const endInterview = useCallback(() => {
    if (messages.length < 4) {
      dispatch({ type: 'SET_ERROR', error: 'Not enough conversation for a report.' });
      dispatch({ type: 'SET_STATUS', status: 'complete' });
      return;
    }
    dispatch({ type: 'SET_STATUS', status: 'complete' });
  }, [messages.length, dispatch]);

  const generateReportRequest = useCallback(async () => {
    if (messages.length < 4) {
      dispatch({ type: 'SET_ERROR', error: 'Not enough data for a report.' });
      return;
    }
    dispatch({ type: 'SET_STATUS', status: 'processing' });
    try {
      const conversation = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));
      const result = await doGenerateReport(conversation);
      dispatch({ type: 'SET_REPORT', report: result.report });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', error: e.message });
      dispatch({ type: 'SET_STATUS', status: 'idle' });
    }
  }, [messages, doGenerateReport, dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    startInterview,
    sendMessage,
    endInterview,
    generateReport: generateReportRequest,
    reset,
    status,
  };
}
