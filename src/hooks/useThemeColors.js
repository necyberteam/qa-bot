import { useMemo } from 'react';
import { constants } from '../utils/strings';

/**
 * Custom hook to get theme colors from CSS variables
 * @param {React.RefObject} containerRef - Reference to the container element
 * @param {Object} defaultColors - Default color values if CSS variables are not found
 * @returns {Object} Theme colors object
 */
const useThemeColors = (containerRef, defaultColors = {}) => {
  const themeColors = useMemo(() => {
    // Get colors from CSS variables if available, fall back to defaults
    const getCSSVariable = (name, fallback) => {
      if (containerRef.current) {
        // First check the container itself
        const containerStyle = getComputedStyle(containerRef.current);
        const containerValue = containerStyle.getPropertyValue(name);
        if (containerValue && containerValue.trim() !== '') {
          return containerValue.trim();
        }

        // Then check parent (useful for web component shadow DOM)
        if (containerRef.current.parentElement) {
          const parentStyle = getComputedStyle(containerRef.current.parentElement);
          const parentValue = parentStyle.getPropertyValue(name);
          if (parentValue && parentValue.trim() !== '') {
            return parentValue.trim();
          }
        }
      }
      return fallback;
    };

    return {
      primaryColor: getCSSVariable('--primary-color', defaultColors.primaryColor || constants.THEME.PRIMARY_COLOR),
      secondaryColor: getCSSVariable('--secondary-color', defaultColors.secondaryColor || constants.THEME.SECONDARY_COLOR),
      fontFamily: getCSSVariable('--font-family', defaultColors.fontFamily || constants.THEME.FONT_FAMILY)
    };
  }, [containerRef, defaultColors]);

  return themeColors;
};

export default useThemeColors;