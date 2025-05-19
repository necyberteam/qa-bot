/**
 * Get theme colors, with fallbacks and CSS variable support
 *
 * @param {React.RefObject} containerRef - Reference to the container element to extract CSS variables from
 * @returns {Object} Theme color configuration
 */
export const getThemeColors = (containerRef) => {
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
    primaryColor: getCSSVariable('--primary-color', '#1a5b6e'),
    secondaryColor: getCSSVariable('--secondary-color', '#107180'),
    fontFamily: getCSSVariable('--font-family', 'Arial, sans-serif')
  };
};