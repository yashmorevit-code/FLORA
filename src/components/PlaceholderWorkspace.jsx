import React from 'react';
import { ArrowLeft, Clock, FlaskConical, GitCompare, Leaf } from 'lucide-react';

export function PlaceholderWorkspace({ name, description, phaseTarget, onReturnToSimulator }) {
  const getIcon = () => {
    switch (name.toLowerCase()) {
      case 'experiments':
        return <FlaskConical size={36} color="#64ffda" />;
      case 'compare':
        return <GitCompare size={36} color="#81c784" />;
      case 'species':
        return <Leaf size={36} color="#ffd54f" />;
      default:
        return <Clock size={36} color="#52c77a" />;
    }
  };

  return (
    <div className="flora-placeholder-page">
      <div className="placeholder-card">
        <div className="placeholder-icon-badge">{getIcon()}</div>
        <h2>{name} Workspace</h2>
        <span className="placeholder-tag">Coming in a future phase</span>
        <p className="placeholder-desc">{description}</p>
        <button className="flora-btn return-btn" onClick={onReturnToSimulator}>
          <ArrowLeft size={16} />
          Return to 3D Simulator
        </button>
      </div>
    </div>
  );
}
