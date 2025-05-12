import React, { useState, useRef } from 'react';
import useScreenshotCapture from '../hooks/useScreenshotCapture';

/**
 * Component for handling file uploads in the feedback flow
 *
 * @param {Object} props Component props
 * @param {Function} props.onFileUpload Callback function that receives uploaded files
 * @returns {JSX.Element} File upload component
 */
const FileUploadComponent = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const { captureScreenshot, isCapturing } = useScreenshotCapture();

  const handleFiles = (files) => {
    const newFileArray = Array.from(files);
    const updatedFiles = [...selectedFiles, ...newFileArray];
    setSelectedFiles(updatedFiles);

    // Programmatically scroll chat to bottom after file selection to keep Continue button in view
    setTimeout(() => {
      const chatContent = document.querySelector('.rcb-chat-content');
      if (chatContent) {
        chatContent.scrollTop = chatContent.scrollHeight;
      }
    }, 100);

    if (onFileUpload) {
      onFileUpload(updatedFiles);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = (indexToRemove) => {
    const newFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(newFiles);
    if (onFileUpload) {
      onFileUpload(newFiles);
    }
  };

  const handleScreenshotCapture = async () => {
    try {
      const file = await captureScreenshot();
      handleFiles([file]);
    } catch (error) {
      // Error is already logged in the hook
    }
  };

  return (
    <div className="file-upload-container">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleScreenshotCapture();
          }}
          disabled={isCapturing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#107180',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 12px',
            cursor: isCapturing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          {isCapturing ? 'Taking screenshot...' : 'Take screenshot...'}
        </button>
      </div>

      <div
        className={`file-upload-dropzone ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          onChange={handleFileSelect}
          multiple
          style={{ display: "none" }}
        />
        <div className="upload-content" onClick={handleButtonClick} style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#107180"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p style={{ margin: 0 }}>Drag and drop files here or click to select files</p>
          </div>
          {selectedFiles.length > 0 && (
            <div className="selected-files" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: 400, color: '#888', fontSize: '13px', marginRight: '8px', alignSelf: 'center' }}>Selected files:</span>
              {selectedFiles.map((file, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    background: '#fff',
                    color: '#107180',
                    borderRadius: '5px',
                    padding: '4px 12px',
                    fontSize: '14px',
                    marginRight: '4px',
                    marginBottom: '4px',
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    onClick={e => { e.stopPropagation(); handleRemoveFile(index); }}
                    style={{
                      cursor: 'pointer',
                      color: '#888',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      marginRight: '4px',
                      userSelect: 'none',
                      lineHeight: 1,
                    }}
                    title="Remove file"
                    aria-label={`Remove ${file.name}`}
                  >
                    &times;
                  </span>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadComponent;