import { useEffect } from 'react';

/**
 * Custom hook for keyboard navigation in chatbot options
 * Provides arrow key navigation, Enter/Space selection, and accessibility features
 */
const useKeyboardNavigation = () => {
  useEffect(() => {
    console.log('useKeyboardNavigation hook initialized');
    const handleKeyboardNavigation = (event) => {
      // Only handle arrow keys and Enter/Space
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Home', 'End'].includes(event.key)) {
        return;
      }


      const chatWindow = document.querySelector('.rcb-chat-window');
      if (!chatWindow) return;
      
      // Check if chat window is visible and if there are options available
      const optionsContainers = Array.from(chatWindow.querySelectorAll('.rcb-options-container'))
        .filter(el => el.offsetParent !== null);
      
      if (optionsContainers.length === 0) return;

      // Get the last (most recent) options container that we already found above
      let options = [];
      if (optionsContainers.length > 0) {
        // Get the last (most recent) options container
        const lastContainer = optionsContainers[optionsContainers.length - 1];
        options = Array.from(lastContainer.querySelectorAll('.rcb-options'));
      }
      
      if (options.length === 0) return;

      const currentIndex = options.findIndex(option => option === document.activeElement);
      
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          let nextIndex;
          if (currentIndex < options.length - 1) {
            nextIndex = currentIndex + 1;
          } else {
            // Wrap to first option
            nextIndex = 0;
          }
          
          // Make sure the element is focusable
          options[nextIndex].setAttribute('tabindex', '0');
          options.forEach((opt, i) => {
            if (i !== nextIndex) {
              opt.setAttribute('tabindex', '-1');
              opt.classList.remove('keyboard-focused');
            }
          });
          
          options[nextIndex].classList.add('keyboard-focused');
          options[nextIndex].focus();
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          let prevIndex;
          if (currentIndex > 0) {
            prevIndex = currentIndex - 1;
          } else {
            // Wrap to last option
            prevIndex = options.length - 1;
          }
          
          // Make sure the element is focusable
          options[prevIndex].setAttribute('tabindex', '0');
          options.forEach((opt, i) => {
            if (i !== prevIndex) {
              opt.setAttribute('tabindex', '-1');
              opt.classList.remove('keyboard-focused');
            }
          });
          
          options[prevIndex].classList.add('keyboard-focused');
          options[prevIndex].focus();
          break;

        case 'Enter':
        case ' ': // Space key
          event.preventDefault();
          if (document.activeElement && options.includes(document.activeElement)) {
            // React ChatBotify responds to mousedown events
            const mouseDownEvent = new MouseEvent('mousedown', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            document.activeElement.dispatchEvent(mouseDownEvent);
            
            // Announce selection to screen readers
            const selectedText = document.activeElement.textContent || document.activeElement.innerText;
            announceToScreenReader(`Selected: ${selectedText}`);
          }
          break;

        case 'Home':
          event.preventDefault();
          if (options.length > 0) {
            options[0].setAttribute('tabindex', '0');
            options.forEach((opt, i) => {
              if (i !== 0) {
                opt.setAttribute('tabindex', '-1');
                opt.classList.remove('keyboard-focused');
              }
            });
            options[0].classList.add('keyboard-focused');
            options[0].focus();
          }
          break;

        case 'End':
          event.preventDefault();
          if (options.length > 0) {
            const lastIndex = options.length - 1;
            options[lastIndex].setAttribute('tabindex', '0');
            options.forEach((opt, i) => {
              if (i !== lastIndex) {
                opt.setAttribute('tabindex', '-1');
                opt.classList.remove('keyboard-focused');
              }
            });
            options[lastIndex].classList.add('keyboard-focused');
            options[lastIndex].focus();
          }
          break;
        default:
          // No action needed for other keys
          break;
      }
    };

    // Screen reader announcement helper
    const announceToScreenReader = (message) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    };

    // Auto-focus first option when new options appear
    const handleNewOptions = () => {
      // Try multiple selectors for the chat window
      let chatWindow = document.querySelector('.rcb-chat-window');
      if (!chatWindow) {
        chatWindow = document.querySelector('[class*="rcb-chat"]');
      }
      if (!chatWindow) {
        chatWindow = document.querySelector('.qa-bot');
      }
      
      // Get the most recent options container - search in chat window or document
      let optionsContainers;
      if (chatWindow) {
        const allContainers = Array.from(chatWindow.querySelectorAll('.rcb-options-container'));
        console.log('Total .rcb-options-container elements in chat window:', allContainers.length);
        optionsContainers = allContainers.filter(el => el.offsetParent !== null);
        console.log('Visible .rcb-options-container elements:', optionsContainers.length);
      } else {
        const allContainers = Array.from(document.querySelectorAll('.rcb-options-container'));
        console.log('Total .rcb-options-container elements in document:', allContainers.length);
        optionsContainers = allContainers.filter(el => el.offsetParent !== null);
        console.log('Visible .rcb-options-container elements:', optionsContainers.length);
      }
      
      // Also check for any element with "options" in the class name
      const anyOptionsElements = chatWindow ? 
        chatWindow.querySelectorAll('[class*="options"]') : 
        document.querySelectorAll('[class*="options"]');
      console.log('Any elements with "options" in class name:', anyOptionsElements.length);
      if (anyOptionsElements.length > 0) {
        console.log('Options elements found:', Array.from(anyOptionsElements).map(el => el.className));
      }
      
      console.log('Final count of visible options containers:', optionsContainers.length);
      if (optionsContainers.length === 0) return;
      
      const lastContainer = optionsContainers[optionsContainers.length - 1];
      const options = Array.from(lastContainer.querySelectorAll('.rcb-options'));
      
      console.log('Found', options.length, 'options in last container');
      if (options.length > 0) {
        // Set tabindex and ARIA attributes for keyboard navigation
        options.forEach((option, index) => {
          const tabindex = index === 0 ? '0' : '-1';
          option.setAttribute('tabindex', tabindex);
          option.setAttribute('role', 'option');
          option.setAttribute('aria-posinset', index + 1);
          option.setAttribute('aria-setsize', options.length);
          // Add visual focus class to first option
          if (index === 0) {
            option.classList.add('keyboard-focused');
          } else {
            option.classList.remove('keyboard-focused');
          }
        });

        // Add keyboard navigation hint only for multiple options
        if (options.length > 1) {
          // Remove any existing hint first
          const existingHints = lastContainer.querySelectorAll('.keyboard-nav-hint');
          existingHints.forEach(hint => hint.remove());
          
          // Add new hint
          const hintElement = document.createElement('div');
          hintElement.className = 'keyboard-nav-hint';
          hintElement.textContent = 'Use arrow keys ↕ to navigate, Enter to select, or click any option';
          hintElement.style.cssText = 'font-size: 12px !important; color: #666 !important; margin-bottom: 8px !important; font-style: italic !important; display: block !important;';
          lastContainer.insertBefore(hintElement, lastContainer.firstChild);
        } else {
          // Remove hints for single options
          const existingHints = lastContainer.querySelectorAll('.keyboard-nav-hint');
          existingHints.forEach(hint => hint.remove());
        }

        // Focus first option after a short delay to allow rendering
        setTimeout(() => {
          if (options[0] && options[0].offsetParent !== null) {
            options[0].focus();
            if (options.length > 1) {
              announceToScreenReader(`${options.length} options available. Use arrow keys to navigate.`);
            }
          }
        }, 200);
      }
    };

    // Set up mutation observer to watch for new options
    const observer = new MutationObserver((mutations) => {
      console.log('Mutation detected, checking for options...');
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          const hasNewOptions = addedNodes.some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node.classList?.contains('rcb-options-container') || 
             node.classList?.contains('rcb-options') ||
             node.querySelector?.('.rcb-options-container') ||
             node.querySelector?.('.rcb-options'))
          );
          
          console.log('Has new options:', hasNewOptions);
          if (hasNewOptions) {
            console.log('Calling handleNewOptions due to mutation');
            // Small delay to ensure all options are rendered
            setTimeout(handleNewOptions, 50);
          }
        }
      });
    });

    // Start observing
    const chatWindow = document.querySelector('.rcb-chat-window');
    if (chatWindow) {
      observer.observe(chatWindow, {
        childList: true,
        subtree: true
      });
    }

    // Add keyboard event listener to document only
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Check for existing options on mount
    handleNewOptions();

    // Periodic check as backup to catch any missed options
    const periodicCheck = setInterval(() => {
      const hasVisibleOptions = document.querySelectorAll('.rcb-options-container .rcb-options').length > 0;
      if (hasVisibleOptions) {
        const lastProcessedOptions = document.querySelectorAll('.rcb-options[tabindex]').length;
        const currentOptions = document.querySelectorAll('.rcb-options').length;
        
        // If we have options that haven't been processed for keyboard navigation
        if (currentOptions > lastProcessedOptions) {
          console.log('Periodic check found unprocessed options');
          handleNewOptions();
        }
      }
    }, 1000);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
      observer.disconnect();
      clearInterval(periodicCheck);
    };
  }, []);

  return null; // This hook doesn't return anything, just sets up event handlers
};

export default useKeyboardNavigation;