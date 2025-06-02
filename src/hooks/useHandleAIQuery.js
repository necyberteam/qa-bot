import { useCallback } from 'react';
import { constants } from '../utils/strings';

/**
 * Custom hook to handle AI query processing
 * @param {string} apiKey - API key for the Q&A endpoint
 * @param {Function} setHasQueryError - Function to set query error state
 * @returns {Function} handleQuery function
 */
const useHandleAIQuery = (apiKey, setHasQueryError) => {
  const handleQuery = useCallback(async (params) => {
    // Reset error state before new query
    setHasQueryError(false);

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        },
        body: JSON.stringify({ query: params.userInput })
      };

      const response = await fetch(constants.API_ENDPOINT, requestOptions);
      const body = await response.json();
      const text = body.response;

      await params.streamMessage(text);
    } catch (error) {
      await params.injectMessage(constants.ERRORS.API_UNAVAILABLE);
      setHasQueryError(true);
    }
  }, [apiKey, setHasQueryError]);

  return handleQuery;
};

export default useHandleAIQuery;