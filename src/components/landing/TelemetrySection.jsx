import React from 'react';
import {
  Activity,
  BarChart3,
  FlaskConical,
  GitCompare,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export function TelemetrySection({ onEnterSimulator }) {
  return (
    <section id="telemetry" className="flora-landing-section flora-telemetry-section">
      <div className="flora-section-header">
        <div className="flora-section-tag">
          <Activity size={14} />
          <span>SCIENTIFIC TELEMETRY & WORKSPACES</span>
        </div>
        <h2 className="flora-section-title">
          Research-Grade Biophysics. <br />
          <span>Four Specialized Scientific Workspaces.</span>
        </h2>
        <p className="flora-section-desc">
          Flora is not an ornamental 3D model viewer. It is a deterministic digital twin
          providing continuous physiological telemetry, organ dissection, and comparative trials.
        </p>
      </div>

      {/* 4 Specialized Workspaces Grid */}
      <div className="flora-workspaces-grid">
        {/* Card 1: 3D Living Simulator */}
        <div className="flora-workspace-card">
          <div className="flora-ws-icon-wrap">
            <Compass size={22} className="flora-ws-icon" />
          </div>
          <h3 className="flora-ws-title">3D Greenhouse Simulator</h3>
          <p className="flora-ws-desc">
            Directly manipulate atmospheric sunlight, soil water potential, wind breeze, and nutrient saturation
            while inspecting 3D anatomical labels and subterranean root systems.
          </p>
          <ul className="flora-ws-bullets">
            <li><CheckCircle2 size={13} color="#52c77a" /> Non-destructive organ inspection</li>
            <li><CheckCircle2 size={13} color="#52c77a" /> Real-time 5-factor stress decomposition</li>
            <li><CheckCircle2 size={13} color="#52c77a" /> Subterranean root cross-section visualization</li>
          </ul>
        </div>

        {/* Card 2: Analytics Workspace */}
        <div className="flora-workspace-card">
          <div className="flora-ws-icon-wrap">
            <BarChart3 size={22} className="flora-ws-icon" />
          </div>
          <h3 className="flora-ws-title">Physiological Analytics</h3>
          <p className="flora-ws-desc">
            Plot continuous time-series curves tracking stem elongation, root-to-shoot biomass allocation,
            cumulative water stress, and chlorophyll integrity across every simulated day.
          </p>
          <ul className="flora-ws-bullets">
            <li><CheckCircle2 size={13} color="#52c77a" /> High-frequency deterministic sampling</li>
            <li><CheckCircle2 size={13} color="#52c77a" /> Vigor vs. stress correlation analysis</li>
            <li><CheckCircle2 size={13} color="#52c77a" /> Biomass accretion time-series charts</li>
          </ul>
        </div>

        {/* Card 3: Controlled Experiments */}
        <div className="flora-workspace-card">
          <div className="flora-ws-icon-wrap">
            <FlaskConical size={22} className="flora-ws-icon" />
          </div>
          <h3 className="flora-ws-title">Controlled Stress Trials</h3>
          <p className="flora-ws-desc">
            Formulate agronomic hypotheses, freeze baseline trial conditions, and save repeatable experiments
            testing drought tolerance, thermal heat shock, or high-salinity stress.
          </p>
          <ul className="flora-ws-bullets">
            <li><CheckCircle2 size={13} color="#52c77a" /> Persistent browser trial repository</li>
            <li><CheckCircle2 size={13} color="#52c77a" /> One-click trial state replay into 3D</li>
            <li><CheckCircle2 size={13} color="#52c77a" /> Custom experiment tagging and metadata</li>
          </ul>
        </div>

        {/* Card 4: Comparative Trials */}
        <div className="flora-workspace-card">
          <div className="flora-ws-icon-wrap">
            <GitCompare size={22} className="flora-ws-icon" />
          </div>
          <h3 className="flora-ws-title">Comparative Growth Trials</h3>
          <p className="flora-ws-desc">
            Perform side-by-side growth differential analyses between distinct treatment regimens
            to uncover optimal agronomic microclimates and yield performance.
          </p>
          <ul className="flora-ws-bullets">
            <li><CheckCircle2 size={13} color="#52c77a" /> Dual-trial delta calculation</li>
            <li><CheckCircle2 size={13} color="#52c77a" /> Phenological milestone comparative timing</li>
            <li><CheckCircle2 size={13} color="#52c77a" /> Stress tolerance divergence metrics</li>
          </ul>
        </div>
      </div>

      {/* Grand CTA Banner */}
      <div className="flora-grand-cta-banner">
        <div className="flora-cta-glow-backdrop" />
        <div className="flora-cta-content">
          <span className="flora-cta-eyebrow">READY TO EXPLORE?</span>
          <h3 className="flora-cta-title">
            Step Into the Living Digital Greenhouse.
          </h3>
          <p className="flora-cta-desc">
            Unleash the full power of real-time botanical 3D simulation in your browser.
            Adjust climate parameters, observe cellular and morphological responses, and watch nature grow.
          </p>

          <div className="flora-cta-btn-row">
            <button
              type="button"
              className="flora-landing-btn-primary large"
              onClick={() => onEnterSimulator()}
            >
              <span>Enter the Greenhouse</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
