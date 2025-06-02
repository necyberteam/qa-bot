import { useState } from 'react';

/**
 * Custom hook for capturing screenshots using the Screen Capture API
 * @returns {Object} Object containing capture function and capturing state
 */
const useScreenshotCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async () => {
    try {
      setIsCapturing(true);

      // Request screen capture with specific options for better UX
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser", // Prefer capturing browser tabs
          cursor: "always",
          logicalSurface: true, // Capture what the user actually sees
          width: { ideal: 1920 }, // Suggest high quality
          height: { ideal: 1080 }
        },
        audio: false
      });

      // When a display is selected, capture an image
      const track = stream.getVideoTracks()[0];

      // Create video element to capture the frame
      const video = document.createElement('video');
      video.srcObject = stream;

      // Wait for video metadata to load
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });

      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

      // Create file from blob
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([blob], `screenshot-${timestamp}.png`, { type: 'image/png' });

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      setIsCapturing(false);
      return file;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      setIsCapturing(false);
      throw error;
    }
  };

  return {
    captureScreenshot,
    isCapturing
  };
};

export default useScreenshotCapture;