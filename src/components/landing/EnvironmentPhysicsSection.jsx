import React, { useState, useMemo } from 'react';
import {
  Droplets,
  Sun,
  Thermometer,
  Zap,
  Wind,
  Gauge,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export function EnvironmentPhysicsSection() {
  const [moisture, setMoisture] = useState(65);
  const [light, setLight] = useState(70);
  const [temperature, setTemperature] = useState(22);
  const [nutrients, setNutrients] = useState(65);
  const [wind, setWind] = useState(35);

  // Live scientific stress & vigor calculations using Flora's biological formulas
  const metrics = useMemo(() => {
    // Water stress: quadratic penalty outside 50-75%
    let waterStress = 0;
    let hypoxia = 0;
    if (moisture < 45) {
      waterStress = ((45 - moisture) / 45) * 100;
    } else if (moisture > 85) {
      hypoxia = ((moisture - 85) / 15) * 100;
    }

    // Light stress
    let lightStress = 0;
    if (light < 40) {
      lightStress = ((40 - light) / 40) * 80;
    } else if (light > 85) {
      lightStress = ((light - 85) / 15) * 75;
    }

    // Temperature stress
    let tempStress = 0;
    if (temperature < 16) {
      tempStress = ((16 - temperature) / 16) * 90;
    } else if (temperature > 28) {
      tempStress = ((temperature - 28) / 14) * 95;
    }

    const totalStress = Math.min(100, Math.round(
      waterStress * 0.35 + hypoxia * 0.35 + lightStress * 0.2 + tempStress * 0.25
    ));

    const vigor = Math.max(10, Math.round(100 - totalStress * 0.85));

    let statusText = 'Optimal photosynthetic balance. Active vegetative growth and cellular expansion.';
    let statusType = 'optimal';

    if (totalStress > 45) {
      statusType = 'severe';
      statusText = 'Critical stress threshold breached: Stomata closed, potential cellular dehydration.';
    } else if (totalStress > 15) {
      statusType = 'warning';
      statusText = 'Suboptimal envelope: Growth rate attenuated, mild physiological compensation active.';
    }

    return {
      totalStress,
      vigor,
      statusText,
      statusType,
      transpiration: Math.round(moisture * 0.4 + light * 0.3 + temperature * 0.3),
    };
  }, [moisture, light, temperature, nutrients, wind]);

  return (
    <section id="environment" className="flora-landing-section flora-env-section">
      <div className="flora-section-header">
        <div className="flora-section-tag">
          <Gauge size={14} />
          <span>BIOPHYSICAL FORCES</span>
        </div>
        <h2 className="flora-section-title">
          Shape the Microclimate. <br />
          <span>Observe Real Physiological Adaptation.</span>
        </h2>
        <p className="flora-section-desc">
          Flora doesn't use pre-recorded animations. Every leaf curl, transpiration flux,
          and internodal elongation is governed by biophysical differential equations.
        </p>
      </div>

      <div className="flora-env-sandbox-grid">
        {/* Left: Interactive Sliders Sandbox */}
        <div className="flora-env-controls-box">
          <div className="flora-box-title-row">
            <span className="flora-box-title">Rhizosphere & Microclimate Tuner</span>
            <span className="flora-box-sub">Adjust inputs to test live feedback</span>
          </div>

          {/* Moisture */}
          <div className="flora-slider-group">
            <div className="flora-slider-header">
              <span className="flora-slider-label">
                <Droplets size={15} color="#6ba8c7" />
                Soil Moisture (Hydration)
              </span>
              <span className="flora-slider-val">{moisture}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="flora-slider"
            />
          </div>

          {/* Sunlight */}
          <div className="flora-slider-group">
            <div className="flora-slider-header">
              <span className="flora-slider-label">
                <Sun size={15} color="#f9e79f" />
                Solar Radiation (PAR)
              </span>
              <span className="flora-slider-val">{light}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              value={light}
              onChange={(e) => setLight(Number(e.target.value))}
              className="flora-slider"
            />
          </div>

          {/* Temperature */}
          <div className="flora-slider-group">
            <div className="flora-slider-header">
              <span className="flora-slider-label">
                <Thermometer size={15} color="#e59866" />
                Ambient Temperature
              </span>
              <span className="flora-slider-val">{temperature}°C</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="flora-slider"
            />
          </div>

          {/* Nutrients */}
          <div className="flora-slider-group">
            <div className="flora-slider-header">
              <span className="flora-slider-label">
                <Zap size={15} color="#a3c9a8" />
                Macronutrients (N-P-K)
              </span>
              <span className="flora-slider-val">{nutrients}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={nutrients}
              onChange={(e) => setNutrients(Number(e.target.value))}
              className="flora-slider"
            />
          </div>

          {/* Wind */}
          <div className="flora-slider-group">
            <div className="flora-slider-header">
              <span className="flora-slider-label">
                <Wind size={15} color="#c5cec3" />
                Canopy Aerodynamics (Breeze)
              </span>
              <span className="flora-slider-val">{wind}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wind}
              onChange={(e) => setWind(Number(e.target.value))}
              className="flora-slider"
            />
          </div>
        </div>

        {/* Right: Live Biological Telemetry Gauge */}
        <div className="flora-env-output-box">
          <div className="flora-box-title-row">
            <span className="flora-box-title">Calculated Biophysical Response</span>
            <span className={`flora-status-badge ${metrics.statusType}`}>
              {metrics.statusType === 'optimal' && <CheckCircle2 size={13} />}
              {metrics.statusType !== 'optimal' && <AlertTriangle size={13} />}
              <span>{metrics.statusType.toUpperCase()}</span>
            </span>
          </div>

          {/* Metric Meters */}
          <div className="flora-meters-row">
            <div className="flora-meter-card">
              <span className="flora-meter-label">Growth Vigour</span>
              <span className="flora-meter-number" style={{ color: '#52c77a' }}>
                {metrics.vigor}%
              </span>
              <div className="flora-meter-track">
                <div
                  className="flora-meter-fill"
                  style={{ width: `${metrics.vigor}%`, backgroundColor: '#52c77a' }}
                />
              </div>
            </div>

            <div className="flora-meter-card">
              <span className="flora-meter-label">Cumulative Stress</span>
              <span
                className="flora-meter-number"
                style={{ color: metrics.totalStress > 30 ? '#c76a6a' : '#d4a359' }}
              >
                {metrics.totalStress}%
              </span>
              <div className="flora-meter-track">
                <div
                  className="flora-meter-fill"
                  style={{
                    width: `${metrics.totalStress}%`,
                    backgroundColor: metrics.totalStress > 30 ? '#c76a6a' : '#d4a359',
                  }}
                />
              </div>
            </div>

            <div className="flora-meter-card">
              <span className="flora-meter-label">Transpiration Flux</span>
              <span className="flora-meter-number" style={{ color: '#6ba8c7' }}>
                {metrics.transpiration} <small>mmol/m²s</small>
              </span>
              <div className="flora-meter-track">
                <div
                  className="flora-meter-fill"
                  style={{ width: `${Math.min(100, metrics.transpiration)}%`, backgroundColor: '#6ba8c7' }}
                />
              </div>
            </div>
          </div>

          <div className="flora-telemetry-explanation">
            <p className="flora-explanation-text">{metrics.statusText}</p>
          </div>

          <div className="flora-env-cards-subgrid">
            <div className="flora-subcard">
              <h4>Osmotic Potential</h4>
              <p>Soil water tension governs xylem suction and cell turgidity pressure.</p>
            </div>
            <div className="flora-subcard">
              <h4>Thermal Degree-Days</h4>
              <p>Cumulative temperature drives enzymatic rates and phenological pacing.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
