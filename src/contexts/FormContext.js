import React, { createContext, useContext, useState } from 'react';

// Create the Form Context
const FormContext = createContext();

// Form Provider component
export const FormProvider = ({ children }) => {
  const [ticketForm, setTicketForm] = useState({});
  const [feedbackForm, setFeedbackForm] = useState({});

  const updateTicketForm = (updates) => {
    setTicketForm(prevForm => ({
      ...prevForm,
      ...updates
    }));
  };

  const updateFeedbackForm = (updates) => {
    setFeedbackForm(prevForm => ({
      ...prevForm,
      ...updates
    }));
  };

  const resetTicketForm = () => {
    setTicketForm({});
  };

  const resetFeedbackForm = () => {
    setFeedbackForm({});
  };

  const value = {
    // Form state
    ticketForm,
    feedbackForm,
    // Update functions
    updateTicketForm,
    updateFeedbackForm,
    // Reset functions
    resetTicketForm,
    resetFeedbackForm,
    // Legacy setters for compatibility
    setTicketForm,
    setFeedbackForm
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook to use the Form Context
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

// Higher-order component for flows that need form context
export const withFormContext = (Component) => {
  const WrappedComponent = (props) => {
    const formContext = useFormContext();
    return <Component {...props} formContext={formContext} />;
  };
  WrappedComponent.displayName = `withFormContext(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
};