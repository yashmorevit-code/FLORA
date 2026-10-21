import React from 'react';
import { Eye, LineChart, FlaskConical, GitCompare, Leaf } from 'lucide-react';

export function NavigationBar({ currentWorkspace, onSelectWorkspace }) {
  const tabs = [
    { id: 'simulator', label: 'Simulator', icon: <Eye size={15} /> },
    { id: 'analytics', label: 'Analytics', icon: <LineChart size={15} /> },
    { id: 'experiments', label: 'Experiments', icon: <FlaskConical size={15} /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare size={15} /> },
    { id: 'species', label: 'Species', icon: <Leaf size={15} /> },
  ];

  return (
    <nav className="flora-nav-bar" role="tablist" aria-label="Digital Greenhouse Workspaces">
      {tabs.map((tab) => {
        const isActive = currentWorkspace === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={`flora-nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => onSelectWorkspace(tab.id)}
          >
            <span className="nav-tab-icon">{tab.icon}</span>
            <span className="nav-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
