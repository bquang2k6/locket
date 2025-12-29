import React, { useState, useEffect, useRef } from 'react';

const DonationWidget = () => {
  const [isActive, setIsActive] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleWidget = () => {
    setIsActive(!isActive);
  };

  return (
    <>
      <style>{`
        @keyframes pulse-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }

        @keyframes bounce-text {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        .donation-container {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          font-family: sans-serif;
        }

        .trigger-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          position: relative;
          z-index: 50;
        }

        .trigger-btn {
          width: 60px;
          height: auto;
          transition: transform 0.3s ease;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
          animation: pulse-zoom 2s infinite ease-in-out;
        }

        .trigger-wrapper:hover .trigger-btn {
          animation-play-state: paused;
          transform: scale(1.2);
        }

        .donation-container.active .trigger-btn {
          animation: none;
          transform: rotate(-15deg);
        }

        .cta-text {
          font-size: 11px;
          font-weight: bold;
          color: #d32f2f;
          background-color: #ffeb3b;
          padding: 3px 8px;
          border-radius: 12px;
          margin-top: 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          white-space: nowrap;
          animation: bounce-text 2s infinite 1s;
        }

        .popup-content {
          position: absolute;
          right: 80px;
          top: 50%;
          transform: translateY(-50%) scale(0);
          transform-origin: right center;
          width: 250px;
          background: white;
          padding: 15px;
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          pointer-events: none;
          text-align: center;
          z-index: 40;
        }

        .donation-container.active .popup-content {
          transform: translateY(-50%) scale(1);
          opacity: 1;
          pointer-events: auto;
        }

        .qr-image {
          width: 100%;
          height: auto;
          border-radius: 8px;
          margin-bottom: 10px;
          display: block;
        }

        .donate-text {
          color: #333;
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          line-height: 1.4;
        }

        .popup-content::after {
          content: '';
          position: absolute;
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 8px 0 8px 8px;
          border-color: transparent transparent transparent white;
        }

        @media (max-width: 400px) {
          .popup-content {
            width: 200px;
          }
          .donate-text {
            font-size: 12px;
          }
        }
      `}</style>

      <div 
        ref={widgetRef}
        className={`donation-container ${isActive ? 'active' : ''}`}
      >
        {/* Nội dung ẩn (QR Code) */}
        <div className="popup-content">
          <img 
            src="/banking_infor.png"
            alt="QR Code" 
            className="qr-image"
          />
          <p className="donate-text">
            Donate để nuôi web<br />
            đi các bợn<br />
            Thank kiu
          </p>
        </div>

        {/* Nút kích hoạt */}
        <div className="trigger-wrapper" onClick={toggleWidget}>
          <img 
            src="/an-xin.png"
            alt="Support Me" 
            className="trigger-btn"
          />
          <span className="cta-text">Nuôi web</span>
        </div>
      </div>
    </>
  );
};

export default DonationWidget;