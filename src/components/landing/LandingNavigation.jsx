import React, { useState, useEffect } from 'react';
import { Sprout, ArrowRight, Menu, X, Compass, Sparkles } from 'lucide-react';

export function LandingNavigation({ onEnterSimulator }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      const container = e.target;
      if (container && container.scrollTop !== undefined) {
        setScrolled(container.scrollTop > 30);
      } else {
        setScrolled(window.scrollY > 30);
      }
    };

    // Attach to landing container if available or window
    const container = document.querySelector('.flora-landing-container');
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`flora-landing-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="flora-landing-nav-inner">
        {/* Brand */}
        <div className="flora-landing-brand" onClick={() => scrollTo('hero')}>
          <div className="flora-landing-logo-badge">
            <Sprout size={20} className="flora-landing-logo-icon" />
          </div>
          <div className="flora-landing-brand-text">
            <span className="flora-landing-brand-title">FLORA</span>
            <span className="flora-landing-brand-sub">Botanical Growth Simulator</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="flora-landing-nav-links">
          <button
            type="button"
            className="flora-landing-nav-link"
            onClick={() => scrollTo('species')}
          >
            Living Species
          </button>
          <button
            type="button"
            className="flora-landing-nav-link"
            onClick={() => scrollTo('environment')}
          >
            Environmental Physics
          </button>
          <button
            type="button"
            className="flora-landing-nav-link"
            onClick={() => scrollTo('lifecycle')}
          >
            Phenological Stages
          </button>
          <button
            type="button"
            className="flora-landing-nav-link"
            onClick={() => scrollTo('telemetry')}
          >
            Scientific Telemetry
          </button>
        </div>

        {/* CTA Button */}
        <div className="flora-landing-nav-actions">
          <button
            type="button"
            className="flora-landing-btn-primary"
            onClick={() => onEnterSimulator()}
            title="Enter the live 3D botanical greenhouse simulation"
          >
            <span>Enter the Greenhouse</span>
            <ArrowRight size={16} className="flora-btn-arrow" />
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="flora-landing-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="flora-landing-mobile-drawer">
          <button
            type="button"
            className="flora-landing-mobile-link"
            onClick={() => scrollTo('species')}
          >
            Living Species
          </button>
          <button
            type="button"
            className="flora-landing-mobile-link"
            onClick={() => scrollTo('environment')}
          >
            Environmental Physics
          </button>
          <button
            type="button"
            className="flora-landing-mobile-link"
            onClick={() => scrollTo('lifecycle')}
          >
            Phenological Stages
          </button>
          <button
            type="button"
            className="flora-landing-mobile-link"
            onClick={() => scrollTo('telemetry')}
          >
            Scientific Telemetry
          </button>
          <div className="flora-landing-mobile-cta">
            <button
              type="button"
              className="flora-landing-btn-primary full-width"
              onClick={() => {
                setMobileMenuOpen(false);
                onEnterSimulator();
              }}
            >
              <span>Enter the Greenhouse</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
