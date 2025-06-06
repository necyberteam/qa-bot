import { useEffect } from 'react';

/**
 * Custom hook to apply ring effect to the chatbot tooltip
 * This hook fires once when the bot is instantiated and applies the phone-ring class
 * to the .rcb-tooltip-show element if ringEffect is enabled
 * The react-chatbotify tooltip is set in config to only show on the first load
 * Once a user opens the chatbot, it won't show the tool tip when closed
 * (Unless you change the tooltip setting in the react-chatbotify settings object)
 *
 * @param {boolean} ringEffect - Whether to apply the ring effect
 * @param {React.RefObject} containerRef - Reference to the chatbot container
 */
const useRingEffect = (ringEffect, containerRef) => {
  useEffect(() => {
    if (!ringEffect || !containerRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const tooltipElement = containerRef.current?.querySelector('.rcb-tooltip-show');
      if (tooltipElement) {
        tooltipElement.classList.add('phone-ring');
      }
    }, 500); // 500ms delay to make sure its rendered and gain user attention

    return () => {
      clearTimeout(timeoutId);
    };
  }, [ringEffect, containerRef]);
};

export default useRingEffect;