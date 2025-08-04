import { useCallback } from 'react';
import { DEFAULT_CONFIG } from '../config/constants';
import useGetLastUserQuery from './useGetLastUserQuery';

/**
 * Custom hook to handle AI query processing
 * @param {string} apiKey - API key for the Q&A endpoint
 * @param {string} sessionId - Session ID for tracking the conversation
 * @param {Function} setCurrentQueryId - Function to update the current query ID state
 * @param {string} queryType - Type of query ('q-and-a' or 'metrics')
 * @returns {Function} handleQuery function that returns true for success, false for error
 */
const useHandleAIQuery = (apiKey, sessionId, setCurrentQueryId, queryType = 'q-and-a') => {
  const getLastUserQueryId = useGetLastUserQuery();

  const handleQuery = useCallback(async (params) => {
    const { userInput } = params;

    const actualQueryId = getLastUserQueryId();

    if (actualQueryId) {
      setCurrentQueryId(actualQueryId);
    }

    // Determine endpoint and origin header based on query type
    const endpoint = queryType === 'metrics'
      ? DEFAULT_CONFIG.METRICS_API_ENDPOINT
      : DEFAULT_CONFIG.API_ENDPOINT;

    const originHeader = queryType === 'metrics' ? 'metrics' : 'access';

    const headers = {
      'Content-Type': 'application/json',
      'X-Origin': originHeader,
      'X-API-KEY': apiKey,
      'X-Session-ID': sessionId,
      'X-Query-ID': actualQueryId
    };

    try {
      const requestOptions = {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: userInput
        })
      };

      const response = await fetch(endpoint, requestOptions);
      const body = await response.json();
      const text = body.response;
      await params.streamMessage(text);
      return true; // Success
    }

    catch (error) {
      await params.injectMessage(DEFAULT_CONFIG.ERRORS.API_UNAVAILABLE);
      return false; // Error
    }
  }, [apiKey, setCurrentQueryId, getLastUserQueryId, sessionId, queryType]);

  return handleQuery;
};

export default useHandleAIQuery;