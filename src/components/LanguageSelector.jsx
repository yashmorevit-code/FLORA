import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n/index.jsx';

/**
 * FLORA Dedicated Botanical Language Selector
 * 
 * Displays: 🌐 Language | EN ▾
 * Dropdown options:
 * - 🇬🇧 English
 * - 🇮🇳 हिन्दी
 * - 🇮🇳 मराठी
 */
export default function LanguageSelector({ className = '' }) {
  const { language, setLanguage, changeLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = language || 'en';
  const switchLang = changeLanguage || setLanguage;

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === activeLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div
      className={`flora-language-selector ${className}`}
      ref={dropdownRef}
      aria-label="Language Selector"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flora-lang-trigger-btn ${isOpen ? 'active' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Select Language / भाषा चुनें / भाषा निवडा"
      >
        <span className="flora-lang-globe-icon" aria-hidden="true">🌐</span>
        <span className="flora-lang-label-group">
          <span className="flora-lang-prefix">{t('language.label', 'Language')}</span>
          <span className="flora-lang-divider">|</span>
          <span className="flora-lang-current-code">{activeLangObj.displayCode || activeLang.toUpperCase()}</span>
        </span>
        <span className={`flora-lang-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true">▾</span>
      </button>

      {isOpen && (
        <div
          className="flora-lang-dropdown-menu"
          role="listbox"
          aria-label="Select Language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === activeLang;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  if (switchLang) switchLang(lang.code);
                  setIsOpen(false);
                }}
                className={`flora-lang-option-btn ${isSelected ? 'selected' : ''}`}
              >
                <div className="flora-lang-option-left">
                  <span className="flora-lang-flag">{lang.flag}</span>
                  <span className="flora-lang-name">{lang.nativeLabel}</span>
                </div>
                {isSelected && <span className="flora-lang-active-dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
