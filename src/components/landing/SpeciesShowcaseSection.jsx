import React, { useState } from 'react';
import {
  Sprout,
  Droplets,
  Sun,
  Thermometer,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { getAllSpecies, SPECIES_IDS } from '../../simulation/species.js';

export function SpeciesShowcaseSection({ onEnterSimulator, onPreviewSpecies }) {
  const allSpecies = getAllSpecies();
  const [selectedId, setSelectedId] = useState(SPECIES_IDS.TOMATO);

  const selectedSpecies = allSpecies.find((s) => s.id === selectedId) || allSpecies[0];

  return (
    <section id="species" className="flora-landing-section flora-species-section">
      <div className="flora-section-header">
        <div className="flora-section-tag">
          <Sprout size={14} />
          <span>LIVING BOTANICAL COLLECTION</span>
        </div>
        <h2 className="flora-section-title">
          Seven Distinct Species. <br />
          <span>Real Morphology & Phenology.</span>
        </h2>
        <p className="flora-section-desc">
          Every plant in Flora is modeled on authentic agronomic botany—from Solanaceae branching habits
          to cereal tillers and stoloniferous rosulate strawberries.
        </p>
      </div>

      {/* Species Selector Tabs */}
      <div className="flora-species-tabs">
        {allSpecies.map((sp) => {
          const isSelected = sp.id === selectedId;
          return (
            <button
              key={sp.id}
              type="button"
              className={`flora-species-tab-btn ${isSelected ? 'active' : ''}`}
              onClick={() => {
                setSelectedId(sp.id);
                onPreviewSpecies?.(sp.id);
              }}
            >
              <span className="flora-tab-common">{sp.commonName}</span>
              <span className="flora-tab-sci">{sp.scientificName}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Species Spotlight Card */}
      <div className="flora-species-spotlight">
        <div className="flora-spotlight-left">
          <div className="flora-spotlight-badge-row">
            <span className="flora-pill-family">{selectedSpecies.family}</span>
            <span className="flora-pill-variety">{selectedSpecies.variety}</span>
          </div>

          <h3 className="flora-spotlight-title">{selectedSpecies.commonName}</h3>
          <p className="flora-spotlight-latin">{selectedSpecies.scientificName}</p>
          <p className="flora-spotlight-desc">{selectedSpecies.description}</p>

          {/* Morphological Highlights */}
          <div className="flora-spotlight-grid">
            <div className="flora-spotlight-metric">
              <span className="flora-metric-label">Growth Habit</span>
              <span className="flora-metric-val">
                {selectedSpecies.architecture?.growthHabit?.replace(/_/g, ' ') || 'Sympodial'}
              </span>
            </div>
            <div className="flora-spotlight-metric">
              <span className="flora-metric-label">Mature Canopy Height</span>
              <span className="flora-metric-val">
                {selectedSpecies.maxStemHeight ? `${Math.round(selectedSpecies.maxStemHeight * 100)} cm` : 'Rosette'}
              </span>
            </div>
            <div className="flora-spotlight-metric">
              <span className="flora-metric-label">Phenological Lifecycle</span>
              <span className="flora-metric-val">
                {selectedSpecies.lifecycle?.totalMaturityDays || 80} Days to Harvest
              </span>
            </div>
            <div className="flora-spotlight-metric">
              <span className="flora-metric-label">Reproductive Strategy</span>
              <span className="flora-metric-val">
                {selectedSpecies.architecture?.fruitType?.replace(/_/g, ' ') || 'Berry'}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flora-spotlight-actions">
            <button
              type="button"
              className="flora-landing-btn-primary"
              onClick={() => onEnterSimulator(selectedSpecies.id)}
            >
              <span>Simulate {selectedSpecies.commonName} in Greenhouse</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: Environmental Envelope Card */}
        <div className="flora-spotlight-right">
          <div className="flora-envelope-header">
            <Layers size={16} />
            <span>Optimal Environmental Envelope</span>
          </div>

          <div className="flora-envelope-item">
            <div className="flora-envelope-top">
              <span className="flora-env-name">
                <Thermometer size={14} color="#e59866" />
                Thermal Zone
              </span>
              <span className="flora-env-range">
                {selectedSpecies.optimalEnvironment?.temperatureMin}°C &ndash; {selectedSpecies.optimalEnvironment?.temperatureMax}°C
              </span>
            </div>
            <div className="flora-env-bar-track">
              <div
                className="flora-env-bar-fill"
                style={{
                  width: `${((selectedSpecies.optimalEnvironment?.temperatureMax || 26) / 38) * 100}%`,
                  background: 'linear-gradient(90deg, #d4a359, #e59866)',
                }}
              />
            </div>
          </div>

          <div className="flora-envelope-item">
            <div className="flora-envelope-top">
              <span className="flora-env-name">
                <Droplets size={14} color="#6ba8c7" />
                Soil Moisture (Rhizosphere)
              </span>
              <span className="flora-env-range">
                {selectedSpecies.optimalEnvironment?.moistureMin}% &ndash; {selectedSpecies.optimalEnvironment?.moistureMax}%
              </span>
            </div>
            <div className="flora-env-bar-track">
              <div
                className="flora-env-bar-fill"
                style={{
                  width: `${selectedSpecies.optimalEnvironment?.moistureMax || 75}%`,
                  background: 'linear-gradient(90deg, #5b9279, #6ba8c7)',
                }}
              />
            </div>
          </div>

          <div className="flora-envelope-item">
            <div className="flora-envelope-top">
              <span className="flora-env-name">
                <Sun size={14} color="#f9e79f" />
                Solar Irradiance (PAR)
              </span>
              <span className="flora-env-range">
                {selectedSpecies.optimalEnvironment?.lightMin}% &ndash; {selectedSpecies.optimalEnvironment?.lightMax}%
              </span>
            </div>
            <div className="flora-env-bar-track">
              <div
                className="flora-env-bar-fill"
                style={{
                  width: `${selectedSpecies.optimalEnvironment?.lightMax || 80}%`,
                  background: 'linear-gradient(90deg, #a3c9a8, #f9e79f)',
                }}
              />
            </div>
          </div>

          <div className="flora-envelope-note">
            <p>
              Simulated under non-linear Liebig Minimum curves. Deviations outside these ranges induce
              measurable stress factors, leaf chlorosis, stomatal closure, and delayed ripening.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
