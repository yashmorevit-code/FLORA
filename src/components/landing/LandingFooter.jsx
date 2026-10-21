import React from 'react';
import { Sprout, ArrowUp, Compass, ShieldCheck } from 'lucide-react';

export function LandingFooter({ onEnterSimulator }) {
  const scrollToTop = () => {
    const container = document.querySelector('.flora-landing-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="flora-landing-footer">
      <div className="flora-footer-inner">
        <div className="flora-footer-top">
          <div className="flora-footer-brand">
            <div className="flora-footer-logo-row">
              <div className="flora-landing-logo-badge">
                <Sprout size={18} />
              </div>
              <span className="flora-footer-title">FLORA</span>
            </div>
            <p className="flora-footer-tagline">
              A cinematic botanical growth simulator modeling deterministic plant biophysics,
              rhizosphere hydrology, and 3D phenological development.
            </p>
            <div className="flora-footer-badges">
              <span className="flora-footer-pill">
                <Compass size={12} color="#52c77a" />
                Three.js / React Three Fiber
              </span>
              <span className="flora-footer-pill">
                <ShieldCheck size={12} color="#52c77a" />
                Deterministic Biophysics
              </span>
            </div>
          </div>

          <div className="flora-footer-links-col">
            <span className="flora-footer-col-title">Exploration</span>
            <button type="button" className="flora-footer-link" onClick={() => scrollTo('species')}>
              Living Species Registry
            </button>
            <button type="button" className="flora-footer-link" onClick={() => scrollTo('environment')}>
              Environmental Physics
            </button>
            <button type="button" className="flora-footer-link" onClick={() => scrollTo('lifecycle')}>
              12 Phenological Milestones
            </button>
            <button type="button" className="flora-footer-link" onClick={() => scrollTo('telemetry')}>
              Scientific Telemetry
            </button>
          </div>

          <div className="flora-footer-links-col">
            <span className="flora-footer-col-title">Simulation</span>
            <button type="button" className="flora-footer-link" onClick={() => onEnterSimulator('tomato')}>
              Solanum lycopersicum (Tomato)
            </button>
            <button type="button" className="flora-footer-link" onClick={() => onEnterSimulator('strawberry')}>
              Fragaria × ananassa (Strawberry)
            </button>
            <button type="button" className="flora-footer-link" onClick={() => onEnterSimulator('sunflower')}>
              Helianthus annuus (Sunflower)
            </button>
            <button type="button" className="flora-footer-link" onClick={() => onEnterSimulator('chilli')}>
              Capsicum annuum (Chilli)
            </button>
          </div>

          <div className="flora-footer-action-col">
            <button
              type="button"
              className="flora-landing-btn-primary full-width"
              onClick={() => onEnterSimulator()}
            >
              Enter the Greenhouse
            </button>
            <button
              type="button"
              className="flora-footer-back-to-top"
              onClick={scrollToTop}
              title="Scroll back to top"
            >
              <ArrowUp size={15} />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

        <div className="flora-footer-bottom">
          <p className="flora-footer-copy">
            &copy; {new Date().getFullYear()} Flora Botanical Simulation Laboratory. Open scientific research project.
          </p>
          <p className="flora-footer-credits">
            Powered by WebGL &bull; High-precision botanical twin geometry &bull; Deterministic physiology
          </p>
        </div>
      </div>
    </footer>
  );
}
