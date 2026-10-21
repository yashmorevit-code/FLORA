import React, { useState } from 'react';
import { Calendar, Sprout, ArrowRight, CheckCircle2, Leaf, Flower, Apple } from 'lucide-react';

const STAGES = [
  {
    index: 1,
    name: 'Seed Imbibition',
    phase: 'Germination',
    dayRange: 'Day 0 – 3',
    icon: Sprout,
    description: 'Achene or seed absorbs moisture through passive osmosis, activating hydrolytic enzymes that break down starchy endosperm.',
    anatomy: 'Micropyle hydration, gibberellin synthesis, seed coat softening',
  },
  {
    index: 2,
    name: 'Radicle Piercing',
    phase: 'Germination',
    dayRange: 'Day 3 – 6',
    icon: Sprout,
    description: 'Primary embryonic root breaches the seed coat, driven by gravitropism to anchor deep into topsoil humus.',
    anatomy: 'Root cap mucilage secretion, apical meristem division',
  },
  {
    index: 3,
    name: 'Root Network',
    phase: 'Rhizosphere',
    dayRange: 'Day 6 – 10',
    icon: Sprout,
    description: 'Secondary lateral roots branch outward, multiplying surface contact area for mycorrhizal symbiosis and water uptake.',
    anatomy: 'Root hair elongation, Casparian strip differentiation',
  },
  {
    index: 4,
    name: 'Shoot Emergence',
    phase: 'Vegetative',
    dayRange: 'Day 10 – 15',
    icon: Leaf,
    description: 'Hypocotyl arches upward toward sunlight, lifting cotyledons above the soil line for initial phototrophic capture.',
    anatomy: 'Etiolation cessation, protochlorophyllide conversion',
  },
  {
    index: 5,
    name: 'First True Leaves',
    phase: 'Vegetative',
    dayRange: 'Day 15 – 25',
    icon: Leaf,
    description: 'Apical shoot produces first species-characteristic serrated leaflets with functional stomatal complexes.',
    anatomy: 'Palisade mesophyll organization, vascular vein branching',
  },
  {
    index: 6,
    name: 'Canopy Expansion',
    phase: 'Vegetative',
    dayRange: 'Day 26 – 45',
    icon: Leaf,
    description: 'Rapid internodal elongation and lateral sympodial branching create a dense foliar solar array.',
    anatomy: 'Xylem vessel lignification, secondary phloem loading',
  },
  {
    index: 7,
    name: 'Bud Initiation',
    phase: 'Reproductive',
    dayRange: 'Day 46 – 54',
    icon: Flower,
    description: 'Florigen signaling cascades induce apical meristems to cease leaf genesis and differentiate into floral calyx bracts.',
    anatomy: 'Sepal primordia, stamen & pistil organogenesis',
  },
  {
    index: 8,
    name: 'Anthesis Bloom',
    phase: 'Reproductive',
    dayRange: 'Day 55 – 63',
    icon: Flower,
    description: 'Petals unfurl to expose pollen-bearing anthers and receptive stigmatic surfaces for entomophilous pollination.',
    anatomy: 'Corolla opening, pollen tube germination down the style',
  },
  {
    index: 9,
    name: 'Fruit Set (Green Button)',
    phase: 'Fruiting',
    dayRange: 'Day 64 – 72',
    icon: Apple,
    description: 'Successful double fertilization triggers auxin surges, halting petal retention as ovaries swell into nascent fruitlets.',
    anatomy: 'Petal abscission, ovary wall pericarp thickening',
  },
  {
    index: 10,
    name: 'Fruit Expansion',
    phase: 'Fruiting',
    dayRange: 'Day 73 – 82',
    icon: Apple,
    description: 'Rapid cellular enlargement driven by vacuolar water uptake and translocated photosynthetic sucrose sink loading.',
    anatomy: 'Achene seed hardening, receptacle hypertrophy',
  },
  {
    index: 11,
    name: 'Breaker Ripening',
    phase: 'Ripening',
    dayRange: 'Day 83 – 92',
    icon: Apple,
    description: 'Chlorophyll degrades while ethylene triggers accumulation of anthocyanins, lycopene, and aromatic volatile esters.',
    anatomy: 'Starch-to-sugar enzymatic conversion, pectin softening',
  },
  {
    index: 12,
    name: 'Harvest Maturity',
    phase: 'Mature',
    dayRange: 'Day 93 – 105',
    icon: Apple,
    description: 'Full biological maturity reached. Seeds are viable, brix content peaks, and nutrient mobilization concludes.',
    anatomy: 'Full pigment saturation, calyx reflexing, abscission layer primed',
  },
];

export function LifecycleSection({ onEnterSimulator }) {
  const [activeStageIndex, setActiveStageIndex] = useState(7); // Default to Anthesis Bloom (iconic stage)
  const current = STAGES[activeStageIndex];

  return (
    <section id="lifecycle" className="flora-landing-section flora-lifecycle-section">
      <div className="flora-section-header">
        <div className="flora-section-tag">
          <Calendar size={14} />
          <span>CONTINUOUS BOTANICAL TIME</span>
        </div>
        <h2 className="flora-section-title">
          12 Phenological Milestones. <br />
          <span>From Seed Imbibition to Full Harvest.</span>
        </h2>
        <p className="flora-section-desc">
          Follow the uninterrupted morphological continuum of living plants.
          Scrub forward through days or step backward to observe root and shoot organogenesis.
        </p>
      </div>

      {/* Stage Scrub Track */}
      <div className="flora-stages-track-container">
        <div className="flora-stages-track">
          {STAGES.map((s, idx) => {
            const isSelected = idx === activeStageIndex;
            return (
              <button
                key={s.index}
                type="button"
                className={`flora-stage-node ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveStageIndex(idx)}
                title={`Inspect Stage ${s.index}: ${s.name}`}
              >
                <span className="flora-node-dot" />
                <span className="flora-node-num">{s.index}</span>
                <span className="flora-node-name">{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Detailed Card */}
      <div className="flora-stage-spotlight-card">
        <div className="flora-stage-spotlight-header">
          <div className="flora-stage-badge">
            <span>STAGE {current.index} OF 12</span>
            <span className="flora-dot-sep">&bull;</span>
            <span className="flora-stage-phase">{current.phase.toUpperCase()}</span>
          </div>
          <span className="flora-stage-days">{current.dayRange}</span>
        </div>

        <h3 className="flora-stage-title">{current.name}</h3>
        <p className="flora-stage-desc">{current.description}</p>

        <div className="flora-stage-anatomy-row">
          <span className="flora-anatomy-tag">Cellular & Vascular Milestones:</span>
          <span className="flora-anatomy-val">{current.anatomy}</span>
        </div>

        <div className="flora-stage-footer-actions">
          <div className="flora-stage-prev-next">
            <button
              type="button"
              className="flora-stage-nav-btn"
              disabled={activeStageIndex === 0}
              onClick={() => setActiveStageIndex((p) => Math.max(0, p - 1))}
            >
              &larr; Previous Stage
            </button>
            <button
              type="button"
              className="flora-stage-nav-btn"
              disabled={activeStageIndex === STAGES.length - 1}
              onClick={() => setActiveStageIndex((p) => Math.min(STAGES.length - 1, p + 1))}
            >
              Next Stage &rarr;
            </button>
          </div>

          <button
            type="button"
            className="flora-landing-btn-secondary"
            onClick={() => onEnterSimulator()}
          >
            <span>Simulate Full Timeline in Greenhouse</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
