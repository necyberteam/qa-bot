/**
 * Custom hook to get the last user query ID from localStorage history
 * @returns {string|null} The ID of the most recent USER message
 */
const useGetLastUserQuery = () => {
  const getLastUserQueryId = () => {
    try {
      const historyString = localStorage.getItem('rcb-history');
      if (!historyString) return null;

      const history = JSON.parse(historyString);
      if (!Array.isArray(history)) return null;

      // Find the most recent USER message (latest timestamp)
      let latestUserMessage = null;
      let latestTimestamp = null;

      for (const message of history) {
        if (message.sender === 'USER') {
          const messageTime = new Date(message.timestamp).getTime();
          if (!latestTimestamp || messageTime > latestTimestamp) {
            latestTimestamp = messageTime;
            latestUserMessage = message;
          }
        }
      }

      return latestUserMessage ? latestUserMessage.id : null;
    } catch (error) {
      console.warn('Error parsing chat history:', error);
      return null;
    }
  };

  return getLastUserQueryId;
};

export default useGetLastUserQuery;