import React from 'react';

/**
 * LoginButton Component
 *
 * A standalone component for the login button that can be styled independently
 *
 * @param {Object} props - Component props
 * @param {string} props.loginUrl - URL to navigate to for login
 * @param {string} [props.className] - Optional CSS class for styling
 * @param {Object} [props.style] - Optional inline styles
 * @returns {JSX.Element} Rendered login button
 */
const LoginButton = ({ loginUrl, className = '', style, isHeaderButton = false }) => {
  const headerStyle = {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'normal',
    textAlign: 'center',
    margin: '8px',
    fontSize: '12px',
    opacity: '0.8',
    transition: 'all 0.2s ease'
  };

  const defaultStyle = {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '1px solid #107180',
    color: '#107180',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '18px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  };

  const finalStyle = isHeaderButton ? headerStyle : defaultStyle;

  return (
    <>
      {isHeaderButton && (
        <style>
          {`
            .rcb-chat-header-container .qa-bot-header-login-button:hover {
              background-color: #0000001a !important;
              opacity: 1 !important;
            }
          `}
        </style>
      )}
      <a
        href={loginUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`qa-bot-login-button ${isHeaderButton ? 'qa-bot-header-login-button' : ''} ${className}`}
        style={{ ...finalStyle, ...style }}
      >
        Log In
      </a>
    </>
  );
};

export default LoginButton;