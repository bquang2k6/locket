import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomeHeader() {
  const [isSolid, setIsSolid] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSolid(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header id="hd" className={isSolid ? 'solid' : ''}>
      <div className="in">
        <Link className="logo" to="/">
          <img src="/favicon.png" alt="Locket Wan" />
          <span>Locket Wan</span>
        </Link>
        <div className="flex items-center gap-3">
          <a
            className="btn"
            href="https://apk.locket-wan.top/download"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "rgba(0, 0, 0, 0.08)",
              color: "#1a1200",
              fontWeight: 900,
              fontSize: "16px"
            }}
          >
            Tải app
          </a>
        </div>
      </div>
    </header>
  );
}
