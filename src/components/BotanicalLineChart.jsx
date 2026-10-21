import React, { useState } from 'react';

/**
 * Clean responsive SVG Line Chart tailored for botanical time-series data.
 */
export function BotanicalLineChart({
  title,
  data = [],
  series = [],
  xKey = 'ageDays',
  xUnit = 'd',
  height = 240,
  emptyMessage = 'No simulation history recorded yet.',
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-empty">{emptyMessage}</div>
      </div>
    );
  }

  // Padding inside SVG canvas
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const width = 600; // viewBox width for fluid SVG responsiveness

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Compute X domain (simulated age in days)
  const xValues = data.map((d) => d[xKey] ?? 0);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const rangeX = maxX - minX || 1;

  // Compute Y domain across all visible series
  let minY = Infinity;
  let maxY = -Infinity;

  series.forEach((s) => {
    data.forEach((d) => {
      const val = d[s.key];
      if (val !== undefined && val !== null) {
        if (val < minY) minY = val;
        if (val > maxY) maxY = val;
      }
    });
  });

  if (minY === Infinity) {
    minY = 0;
    maxY = 100;
  }

  // Include small buffer on Y axis
  const bufferY = (maxY - minY) * 0.1 || (maxY === 0 ? 1 : Math.abs(maxY) * 0.1);
  const effectiveMinY = sMin(minY, series);
  const effectiveMaxY = maxY + bufferY;
  const rangeY = effectiveMaxY - effectiveMinY || 1;

  function sMin(rawMin, sers) {
    // If all series have minZero set or are percentage/positive, anchor at 0
    if (sers.every((s) => s.minZero !== false) && rawMin >= 0) return 0;
    return Math.floor(rawMin - bufferY);
  }

  // Mapping coordinate functions
  const getX = (val) => padding.left + ((val - minX) / rangeX) * plotWidth;
  const getY = (val) => padding.top + plotHeight - ((val - effectiveMinY) / rangeY) * plotHeight;

  // Generate SVG path for a series
  const generatePath = (s) => {
    const points = data
      .filter((d) => d[s.key] !== undefined && d[s.key] !== null)
      .map((d) => `${getX(d[xKey])},${getY(d[s.key])}`);

    if (points.length === 0) return '';
    if (points.length === 1) {
      // Single point represented as small horizontal segment
      const [x, y] = points[0].split(',');
      return `M ${Number(x) - 4},${y} L ${Number(x) + 4},${y}`;
    }
    return `M ${points.join(' L ')}`;
  };

  // Y-axis grid ticks (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = effectiveMinY + pct * rangeY;
    return {
      val: Number(val.toFixed(1)),
      y: padding.top + plotHeight - pct * plotHeight,
    };
  });

  // X-axis grid ticks
  const xTicks = [0, 0.5, 1].map((pct) => {
    const val = minX + pct * rangeX;
    return {
      val: Number(val.toFixed(1)),
      x: padding.left + pct * plotWidth,
    };
  });

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {/* Series Legends */}
        <div className="chart-legends">
          {series.map((s) => (
            <div key={s.key} className="chart-legend-item">
              <span
                className="legend-color-dot"
                style={{ backgroundColor: s.color }}
              />
              <span className="legend-label">{s.label}</span>
              {s.unit && <span className="legend-unit">({s.unit})</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="chart-svg-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="botanical-svg-chart"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Background horizontal grid lines */}
          {yTicks.map((tick, i) => (
            <g key={`ytick-${i}`}>
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
            <g key={`xtick-${i}`}>
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
                {tick.val}
                {xUnit}
              </text>
            </g>
          ))}

          {/* Series lines */}
          {series.map((s) => (
            <path
              key={`line-${s.key}`}
              d={generatePath(s)}
              fill="none"
              stroke={s.color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Hover interactive vertical guide line & tooltip */}
          {hoveredPoint && (
            <g>
              <line
                x1={getX(hoveredPoint[xKey])}
                y1={padding.top}
                x2={getX(hoveredPoint[xKey])}
                y2={padding.top + plotHeight}
                stroke="rgba(100, 255, 218, 0.5)"
                strokeDasharray="2 2"
              />
              {series.map((s) => {
                const val = hoveredPoint[s.key];
                if (val === undefined) return null;
                return (
                  <circle
                    key={`hover-dot-${s.key}`}
                    cx={getX(hoveredPoint[xKey])}
                    cy={getY(val)}
                    r="4.5"
                    fill={s.color}
                    stroke="#111512"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          )}

          {/* Transparent interactive vertical hitboxes for crisp mouseover */}
          {data.map((d, idx) => {
            const stepW = plotWidth / Math.max(1, data.length);
            const cx = getX(d[xKey]);
            return (
              <rect
                key={`hitbox-${idx}`}
                x={cx - stepW / 2}
                y={padding.top}
                width={stepW}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(d)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {hoveredPoint && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(getX(hoveredPoint[xKey]) / width) * 100}%`,
            }}
          >
            <div className="tooltip-title">
              Age: {hoveredPoint[xKey]} {xUnit} (Prog: {Math.round(hoveredPoint.overallProgress * 100)}%)
            </div>
            {series.map((s) => (
              <div key={s.key} className="tooltip-row">
                <span className="tooltip-dot" style={{ backgroundColor: s.color }} />
                <span>{s.label}:</span>
                <strong>
                  {hoveredPoint[s.key]} {s.unit || ''}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
