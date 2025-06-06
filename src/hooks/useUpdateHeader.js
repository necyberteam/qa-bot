import { useEffect } from 'react';

/**
 * Custom hook to update the chatbot header
 * This avoids relying on the beta useSettings hook from react-chatbotify
 * When this hook is stable, we can refactor to use it
 *
 * @param {boolean} isLoggedIn - Whether the user is logged in
 * @param {React.RefObject} containerRef - Reference to the chatbot container
 */
const useUpdateHeader = (isLoggedIn, containerRef) => {
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    if (isLoggedIn) {
      containerRef.current.classList.add('bot-logged-in');
    } else {
      containerRef.current.classList.remove('bot-logged-in');
    }
  }, [isLoggedIn, containerRef]);
};

export default useUpdateHeader;