import React from 'react';
import { useMessages } from 'react-chatbotify';
import { DEFAULT_CONFIG } from '../config/constants';

/**
 * ThumbsUpThumbsDown Component
 *
 * A component for collecting feedback on bot responses
 *
 * @param {Object} props - Component props
 * @param {string} props.sessionId - Session ID for tracking feedback
 * @param {string} props.currentQueryId - Current query ID for tracking feedback
 * @param {string} [props.className] - Optional CSS class for styling
 * @param {Object} [props.style] - Optional inline styles
 * @param {Function} [props.onAskAnother] - Callback for "Ask another question"
 * @param {Function} [props.onOpenTicket] - Callback for "Open a ticket for assistance"
 * @returns {JSX.Element} Rendered thumbs up/down component
 */
const ThumbsUpThumbsDown = ({ sessionId, currentQueryId, className = '', style, onFeedbackChange }) => {
  const [feedbackGiven, setFeedbackGiven] = React.useState(null); // null, 'positive', 'negative'
  const [hoveredButton, setHoveredButton] = React.useState(null); // 'up', 'down', or null
  const { injectMessage } = useMessages();
  const defaultStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    margin: '18px',
    fontFamily: 'Arial, sans-serif'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '4px'
  };

  const getButtonStyle = (buttonType) => {
    const isHovered = hoveredButton === buttonType;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 8px',
      backgroundColor: isHovered ? '#f8f9fa' : 'transparent',
      border: 'none',
      color: isHovered ? '#107180' : '#666666',
      textDecoration: 'none',
      borderRadius: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      boxShadow: isHovered ? '0 2px 8px rgba(16, 113, 128, 0.15)' : 'none',
      fontSize: '20px',
      minWidth: '44px',
      minHeight: '44px',
      transition: 'all 0.2s ease-in-out',
    };
  };

  const getIconStyle = (buttonType) => {
    const isHovered = hoveredButton === buttonType;
    return {
      display: 'inline-block',
      transform: isHovered ? 'scale(1.2)' : 'scale(1)',
      transition: 'transform 0.2s ease-in-out',
    };
  };

  /**
   * Send feedback to the API
   * @param {boolean} isPositive - true for thumbs up, false for thumbs down
   */
  const sendFeedback = async (isPositive) => {
    const apiKey = process.env.REACT_APP_API_KEY;

    if (!apiKey || !sessionId) {
      console.warn('Missing apiKey or sessionId for feedback');
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      'X-Origin': 'access',
      'X-API-KEY': apiKey,
      'X-Session-ID': sessionId,
      'X-Query-ID': currentQueryId,
      'X-Feedback': isPositive ? 1 : 0
    };

    try {
      const requestOptions = {
        method: 'POST',
        headers
      };

      const response = await fetch(`${DEFAULT_CONFIG.API_ENDPOINT}/rating`, requestOptions);

      if (response.ok) {
        // Feedback sent successfully
      } else {
        console.error('Failed to send feedback:', response.status);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const handleThumbsUp = async () => {
    await sendFeedback(true);
    setFeedbackGiven('positive');
    
    // Inject feedback and follow-up message
    if (injectMessage) {
      injectMessage("Thank you for your feedback!", 'bot');
      // Add a brief delay before the next message
      setTimeout(() => {
        injectMessage("Ask another question, but remember that each question must stand alone.", 'bot');
      }, 500);
    }
    
    if (onFeedbackChange) {
      onFeedbackChange('positive');
    }
  };

  const handleThumbsDown = async () => {
    await sendFeedback(false);
    setFeedbackGiven('negative');
    
    if (onFeedbackChange) {
      onFeedbackChange('negative');
    }
  };


  if (feedbackGiven === 'positive' || feedbackGiven === 'negative') {
    return null;
  }

  // Initial state - show thumbs up/down with prompt
  return (
    <div
      className={`qa-bot-thumbs-feedback ${className}`}
      style={{ ...defaultStyle, ...style }}
    >
      <div>Was this helpful?</div>
      <div style={buttonContainerStyle}>
        <button
          onClick={handleThumbsUp}
          onMouseEnter={() => setHoveredButton('up')}
          onMouseLeave={() => setHoveredButton(null)}
          style={getButtonStyle('up')}
          className="qa-bot-thumbs-up"
          aria-label="This was helpful"
        >
          <span style={getIconStyle('up')}>👍</span>
        </button>
        <button
          onClick={handleThumbsDown}
          onMouseEnter={() => setHoveredButton('down')}
          onMouseLeave={() => setHoveredButton(null)}
          style={getButtonStyle('down')}
          className="qa-bot-thumbs-down"
          aria-label="This was not helpful"
        >
          <span style={getIconStyle('down')}>👎</span>
        </button>
      </div>
    </div>
  );
};

export default ThumbsUpThumbsDown;