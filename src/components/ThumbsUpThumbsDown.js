import React from 'react';
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
 * @returns {JSX.Element} Rendered thumbs up/down component
 */
const ThumbsUpThumbsDown = ({ sessionId, currentQueryId, className = '', style }) => {
  const defaultStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    margin: '18px',
    fontFamily: 'Arial, sans-serif'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '15px'
  };

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    backgroundColor: 'white',
    border: '1px solid #107180',
    color: '#107180',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    fontSize: '14px',
    minWidth: '60px'
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
  };

  const handleThumbsDown = async () => {
    await sendFeedback(false);
  };

  return (
    <div
      className={`qa-bot-thumbs-feedback ${className}`}
      style={{ ...defaultStyle, ...style }}
    >
      <div style={buttonContainerStyle}>
        <button
          onClick={handleThumbsUp}
          style={buttonStyle}
          className="qa-bot-thumbs-up"
        >
          👍
        </button>
        <button
          onClick={handleThumbsDown}
          style={buttonStyle}
          className="qa-bot-thumbs-down"
        >
          👎
        </button>
      </div>
    </div>
  );
};

export default ThumbsUpThumbsDown;