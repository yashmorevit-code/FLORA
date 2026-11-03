import React from 'react';
import { Eye, LineChart, FlaskConical, GitCompare, Leaf } from 'lucide-react';
import { useTranslation } from '../i18n/index.jsx';

export function NavigationBar({ currentWorkspace, onSelectWorkspace }) {
  const { t } = useTranslation();

  const tabs = [
    { id: 'simulator', label: t('nav.simulator'), icon: <Eye size={15} /> },
    { id: 'analytics', label: t('nav.analytics'), icon: <LineChart size={15} /> },
    { id: 'experiments', label: t('nav.experiments'), icon: <FlaskConical size={15} /> },
    { id: 'compare', label: t('nav.compare'), icon: <GitCompare size={15} /> },
    { id: 'species', label: t('nav.species'), icon: <Leaf size={15} /> },
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
