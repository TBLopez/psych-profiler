import { useCallback, useRef } from 'react';
import { chat as chatApi, generateReport as generateReportApi } from '../lib/api';

export function useApi(password) {
  const passwordRef = useRef(password);
  passwordRef.current = password;

  const doChat = useCallback(async (messages, systemPrompt) => {
    return chatApi(messages, systemPrompt, passwordRef.current);
  }, []);

  const doGenerateReport = useCallback(async (conversation) => {
    return generateReportApi(conversation, passwordRef.current);
  }, []);

  return { doChat, doGenerateReport };
}
