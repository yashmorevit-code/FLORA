import React, { useState } from 'react';

/**
 * BotanicalComparisonChart:
 * Visualizes dual time-series trajectories for Experiment A and Experiment B.
 * Plots independent series without merging arrays or forcing artificial alignment.
 * Dynamically computes union X domain (age in days) and common Y domain across both datasets.
 */
export function BotanicalComparisonChart({
  title,
  dataA = [],
  dataB = [],
  labelA = 'Experiment A',
  labelB = 'Experiment B',
  metricKey,
  metricLabel,
  unit = '',
  colorA = '#64ffda',
  colorB = '#ffca28',
  height = 240,
  minZero = true,
  emptyMessage = 'No historical time-series data available for comparison.',
}) {
  const [hoveredIdxA, setHoveredIdxA] = useState(null);
  const [hoveredIdxB, setHoveredIdxB] = useState(null);

  const hasA = Array.isArray(dataA) && dataA.length > 0;
  const hasB = Array.isArray(dataB) && dataB.length > 0;

  if (!hasA && !hasB) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-empty">{emptyMessage}</div>
      </div>
    );
  }

  // Padding inside SVG canvas
  const padding = { top: 25, right: 30, bottom: 35, left: 50 };
  const width = 600; // viewBox width for fluid SVG responsiveness
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Compute union X domain (simulated age in days)
  const xValuesA = hasA ? dataA.map((d) => (typeof d.ageDays === 'number' ? d.ageDays : 0)) : [];
  const xValuesB = hasB ? dataB.map((d) => (typeof d.ageDays === 'number' ? d.ageDays : 0)) : [];
  const allX = [...xValuesA, ...xValuesB];

  const minX = allX.length > 0 ? Math.min(0, Math.min(...allX)) : 0;
  const maxX = allX.length > 0 ? Math.max(1, Math.max(...allX)) : 1;
  const rangeX = maxX - minX || 1;

  // Compute common Y domain for the specific metricKey across both experiments
  const yValuesA = hasA
    ? dataA
        .map((d) => d[metricKey])
        .filter((v) => typeof v === 'number' && !isNaN(v))
    : [];
  const yValuesB = hasB
    ? dataB
        .map((d) => d[metricKey])
        .filter((v) => typeof v === 'number' && !isNaN(v))
    : [];
  const allY = [...yValuesA, ...yValuesB];

  let rawMinY = allY.length > 0 ? Math.min(...allY) : 0;
  let rawMaxY = allY.length > 0 ? Math.max(...allY) : 100;

  let effectiveMinY = minZero && rawMinY >= 0 ? 0 : rawMinY;
  const bufferY = (rawMaxY - effectiveMinY) * 0.1 || (rawMaxY === 0 ? 1 : Math.abs(rawMaxY) * 0.1);
  if (!minZero || rawMinY < 0) {
    effectiveMinY -= bufferY;
  }
  const effectiveMaxY = rawMaxY + bufferY;
  const rangeY = effectiveMaxY - effectiveMinY || 1;

  // Coordinate mappers
  const getX = (val) => padding.left + ((val - minX) / rangeX) * plotWidth;
  const getY = (val) => padding.top + plotHeight - ((val - effectiveMinY) / rangeY) * plotHeight;

  // SVG Path generator for an experiment's history
  const generatePath = (data) => {
    if (!data || data.length === 0) return '';
    const valid = data.filter(
      (d) => typeof d[metricKey] === 'number' && !isNaN(d[metricKey]) && typeof d.ageDays === 'number'
    );
    if (valid.length === 0) return '';
    if (valid.length === 1) {
      const cx = getX(valid[0].ageDays);
      const cy = getY(valid[0][metricKey]);
      return `M ${cx - 4},${cy} L ${cx + 4},${cy}`;
    }
    const points = valid.map((d) => `${getX(d.ageDays).toFixed(1)},${getY(d[metricKey]).toFixed(1)}`);
    return `M ${points.join(' L ')}`;
  };

  // Y-axis ticks
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = effectiveMinY + pct * rangeY;
    return {
      val: Number(val.toFixed(1)),
      y: padding.top + plotHeight - pct * plotHeight,
    };
  });

  // X-axis ticks
  const xTicks = [0, 0.5, 1].map((pct) => {
    const val = minX + pct * rangeX;
    return {
      val: Number(val.toFixed(1)),
      x: padding.left + pct * plotWidth,
    };
  });

  const activeHoverA = hoveredIdxA !== null && hasA ? dataA[hoveredIdxA] : null;
  const activeHoverB = hoveredIdxB !== null && hasB ? dataB[hoveredIdxB] : null;

  return (
    <div className="chart-card compare-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-legends">
          {hasA && (
            <div className="chart-legend-item">
              <span className="legend-color-dot" style={{ backgroundColor: colorA }} />
              <span className="legend-label" style={{ color: colorA, fontWeight: 600 }}>
                {labelA}
              </span>
              {unit && <span className="legend-unit">({unit})</span>}
            </div>
          )}
          {hasB && (
            <div className="chart-legend-item">
              <span className="legend-color-dot" style={{ backgroundColor: colorB }} />
              <span className="legend-label" style={{ color: colorB, fontWeight: 600 }}>
                {labelB}
              </span>
              {unit && <span className="legend-unit">({unit})</span>}
            </div>
          )}
        </div>
      </div>

      <div className="chart-svg-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="botanical-svg-chart"
          onMouseLeave={() => {
            setHoveredIdxA(null);
            setHoveredIdxB(null);
          }}
        >
          {/* Horizontal grid lines */}
          {yTicks.map((tick, i) => (
            <g key={`cmp-ytick-${i}`}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 8}
                y={tick.y + 4}
                fill="var(--color-cream-dark)"
                fontSize="9"
                textAnchor="end"
                fontFamily="var(--font-mono)"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Vertical grid lines */}
          {xTicks.map((tick, i) => (
            <g key={`cmp-xtick-${i}`}>
              <line
                x1={tick.x}
                y1={padding.top}
                x2={tick.x}
                y2={padding.top + plotHeight}
                stroke="rgba(255, 255, 255, 0.05)"
              />
              <text
                x={tick.x}
                y={padding.top + plotHeight + 18}
                fill="var(--color-cream-dark)"
                fontSize="9"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                {tick.val}d
              </text>
            </g>
          ))}

          {/* Trajectory Path Experiment A */}
          {hasA && (
            <path
              d={generatePath(dataA)}
              fill="none"
              stroke={colorA}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Trajectory Path Experiment B */}
          {hasB && (
            <path
              d={generatePath(dataB)}
              fill="none"
              stroke={colorB}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={hasA ? 'none' : 'none'}
            />
          )}

          {/* Hover indicator dots for A */}
          {activeHoverA && typeof activeHoverA[metricKey] === 'number' && (
            <circle
              cx={getX(activeHoverA.ageDays)}
              cy={getY(activeHoverA[metricKey])}
              r="5"
              fill={colorA}
              stroke="#111512"
              strokeWidth="2"
            />
          )}

          {/* Hover indicator dots for B */}
          {activeHoverB && typeof activeHoverB[metricKey] === 'number' && (
            <circle
              cx={getX(activeHoverB.ageDays)}
              cy={getY(activeHoverB[metricKey])}
              r="5"
              fill={colorB}
              stroke="#111512"
              strokeWidth="2"
            />
          )}

          {/* Interactive mouseover tracking: partition plotWidth into slices */}
          {Array.from({ length: 40 }).map((_, idx) => {
            const sliceW = plotWidth / 40;
            const sliceX = padding.left + idx * sliceW;
            const sliceAge = minX + (idx / 40) * rangeX;

            return (
              <rect
                key={`slice-${idx}`}
                x={sliceX}
                y={padding.top}
                width={sliceW}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => {
                  if (hasA) {
                    // Find nearest snapshot in A by ageDays
                    let closestIdxA = 0;
                    let minDiffA = Infinity;
                    dataA.forEach((d, i) => {
                      const diff = Math.abs((d.ageDays ?? 0) - sliceAge);
                      if (diff < minDiffA) {
                        minDiffA = diff;
                        closestIdxA = i;
                      }
                    });
                    setHoveredIdxA(closestIdxA);
                  }
                  if (hasB) {
                    // Find nearest snapshot in B by ageDays
                    let closestIdxB = 0;
                    let minDiffB = Infinity;
                    dataB.forEach((d, i) => {
                      const diff = Math.abs((d.ageDays ?? 0) - sliceAge);
                      if (diff < minDiffB) {
                        minDiffB = diff;
                        closestIdxB = i;
                      }
                    });
                    setHoveredIdxB(closestIdxB);
                  }
                }}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {(activeHoverA || activeHoverB) && (
          <div
            className="chart-tooltip compare-tooltip"
            style={{
              left: activeHoverA
                ? `${(getX(activeHoverA.ageDays) / width) * 100}%`
                : `${(getX(activeHoverB.ageDays) / width) * 100}%`,
            }}
          >
            <div className="tooltip-title">{metricLabel || title}</div>
            {activeHoverA && (
              <div className="tooltip-row">
                <span className="tooltip-dot" style={{ backgroundColor: colorA }} />
                <span style={{ color: colorA }}>{labelA}:</span>
                <strong>
                  {typeof activeHoverA[metricKey] === 'number'
                    ? activeHoverA[metricKey].toFixed(1)
                    : activeHoverA[metricKey] ?? '—'}{' '}
                  {unit}
                </strong>
                <span className="tooltip-age">({activeHoverA.ageDays.toFixed(1)}d)</span>
              </div>
            )}
            {activeHoverB && (
              <div className="tooltip-row">
                <span className="tooltip-dot" style={{ backgroundColor: colorB }} />
                <span style={{ color: colorB }}>{labelB}:</span>
                <strong>
                  {typeof activeHoverB[metricKey] === 'number'
                    ? activeHoverB[metricKey].toFixed(1)
                    : activeHoverB[metricKey] ?? '—'}{' '}
                  {unit}
                </strong>
                <span className="tooltip-age">({activeHoverB.ageDays.toFixed(1)}d)</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
