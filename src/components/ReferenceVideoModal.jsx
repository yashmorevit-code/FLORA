import React, { useState } from 'react';
import { X, Film, Info } from 'lucide-react';

export function ReferenceVideoModal({ isOpen, onClose }) {
  const [selectedVideo, setSelectedVideo] = useState('/referrencevideos/Refferencevideo1.mp4');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 800,
          backgroundColor: '#1b221d',
          border: '1px solid var(--color-border)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Film size={18} color="#52c77a" />
            <h3 style={{ fontSize: '1rem', color: 'var(--color-cream)', fontWeight: 600 }}>
              Botanical Reference Study (Gemini Growth Videos)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flora-btn"
            style={{ minWidth: 32, padding: '4px 8px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Player */}
        <div style={{ backgroundColor: '#000000', position: 'relative', aspectRatio: '16/9' }}>
          <video
            key={selectedVideo}
            controls
            autoPlay
            loop
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            src={selectedVideo}
          >
            Your browser does not support HTML5 video.
          </video>
        </div>

        {/* Video selector clips */}
        <div style={{ padding: 16, display: 'flex', gap: 12, justifyContent: 'center', borderTop: '1px solid var(--color-border)' }}>
          {[
            { label: 'Study Clip 1 (Shoot Emergence)', path: '/referrencevideos/Refferencevideo1.mp4' },
            { label: 'Study Clip 2 (Vegetative Foliage)', path: '/referrencevideos/Refferencevideo2.mp4' },
            { label: 'Study Clip 3 (Fruit Maturation)', path: '/referrencevideos/Refferencevideo3.mp4' },
          ].map((vid) => (
            <button
              key={vid.path}
              className={`flora-btn ${selectedVideo === vid.path ? 'active' : ''}`}
              onClick={() => setSelectedVideo(vid.path)}
            >
              {vid.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
