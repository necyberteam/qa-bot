import React from 'react';

/**
 * UserIcon Component
 *
 * A standalone component for the user icon that can be styled independently
 *
 * @returns {JSX.Element} Rendered user icon
 */
const UserIcon = () => (
  <div
    className="user-login-icon"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      backgroundColor: '#1a5b6e',
      marginRight: '5px'
    }}
    title="Logged in as user"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  </div>
);

export default UserIcon;