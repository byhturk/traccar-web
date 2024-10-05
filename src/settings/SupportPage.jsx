import React, { useState, useEffect } from 'react';
import PageLayout from '../common/components/PageLayout';

const SupportPage = () => {
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  return (
    <PageLayout breadcrumbs={['support', 'support']}>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <iframe
        src="https://takipon.com/appcontact"
        width="100%"
        height="100%"
        style={{ border: 'none', display: loading ? 'none' : 'block' }}
        title="Destek"
        onLoad={handleIframeLoad}
      />
      {!iframeLoaded && (
        <div className="iframe-loading-message">
          Bağlanıyor, lütfen bekleyiniz...
        </div>
      )}
      <style>{`
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #ccc;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .iframe-loading-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 18px;
          color: #333;
        }
      `}</style>
    </PageLayout>
  );
};

export default SupportPage;
