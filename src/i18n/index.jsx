// src/i18n/index.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './translations/en.js';
import hi from './translations/hi.js';
import mr from './translations/mr.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', displayCode: 'EN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', displayCode: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳', displayCode: 'मराठी' },
];

const TRANSLATIONS = { en, hi, mr };

const STORAGE_KEY = 'flora_selected_language';

export function getInitialLanguage() {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (saved && TRANSLATIONS[saved]) return saved;
  } catch (e) {}
  return 'en';
}

/**
 * Common legacy/alternate key aliases to prevent missing keys
 */
const KEY_ALIASES = {
  'species.selectSpecies': 'environment.speciesLabel',
  'environment.moisture': 'environment.soilMoisture',
  'environment.water': 'environment.waterPlant',
  'environment.dry': 'environment.dry',
  'environment.fertilize': 'environment.addNutrients',
  'environment.overview': 'environment.presetOverview',
  'environment.canopy': 'environment.presetCanopy',
  'environment.roots': 'environment.presetRoots',
  'environment.flowersFruit': 'environment.presetFlowers',
  'vitals.health': 'vitals.overallHealth',
  'vitals.stressAnalysis': 'vitals.stressOverview',
  'vitals.thermalStress': 'vitals.tempStress',
  'guide.transcript': 'guide.transcriptTab',
  'guide.biology': 'guide.biologyTab',
  'guide.ecology': 'guide.ecologyTab',
  'guide.inspectOrgan': 'guide.inspect3d',
  'guide.completedTitle': 'guide.tourComplete',
  'guide.completedSubtitle': 'guide.tourCompleteDesc',
  'landing.tagline': 'landing.heroEyebrow',
  'landing.heroTitle': 'landing.heroHeadline',
  'analytics.title': 'analyticsWorkspace.title',
  'analytics.subtitle': 'analyticsWorkspace.subtitle',
  'analytics.snapshots': 'analyticsWorkspace.snapshots',
  'analytics.lifecycle': 'analyticsWorkspace.lifecycle',
  'analytics.shootRootChart': 'analyticsWorkspace.shootRootChart',
  'analytics.healthVigourChart': 'analyticsWorkspace.healthVigourChart',
  'analytics.environmentChart': 'analyticsWorkspace.environmentChart',
  'analytics.reproductiveChart': 'analyticsWorkspace.reproductiveChart',
  'analytics.sunflowerReproductiveChart': 'analyticsWorkspace.sunflowerReproductiveChart',
};

/**
 * Access a nested translation key using dot-notation: 'vitals.overallHealth'
 * Supports interpolation like {species}
 */
export function translate(key, currentLang = 'en', fallback = null, params = null) {
  if (!key) return '';

  // If second arg is an object rather than string or null (e.g. t('guide.completedSubtitle', { species: 'Tomato' }))
  if (typeof fallback === 'object' && fallback !== null && params === null) {
    params = fallback;
    fallback = null;
  }

  const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  // Resolve key or alias
  const resolvedKey = KEY_ALIASES[key] || key;
  const parts = resolvedKey.split('.');

  let curr = langDict;
  for (const part of parts) {
    if (curr && typeof curr === 'object' && part in curr) {
      curr = curr[part];
    } else {
      curr = null;
      break;
    }
  }

  // If not found in requested language, try original key in requested language
  if ((curr === null || curr === undefined) && resolvedKey !== key) {
    let origCurr = langDict;
    for (const part of key.split('.')) {
      if (origCurr && typeof origCurr === 'object' && part in origCurr) {
        origCurr = origCurr[part];
      } else {
        origCurr = null;
        break;
      }
    }
    if (origCurr !== null && origCurr !== undefined) {
      curr = origCurr;
    }
  }

  // Fallback to English dictionary if current language was not English
  if ((curr === null || curr === undefined) && currentLang !== 'en') {
    let enCurr = TRANSLATIONS.en;
    for (const part of parts) {
      if (enCurr && typeof enCurr === 'object' && part in enCurr) {
        enCurr = enCurr[part];
      } else {
        enCurr = null;
        break;
      }
    }
    if (enCurr !== null && enCurr !== undefined) {
      curr = enCurr;
    } else if (resolvedKey !== key) {
      let origEnCurr = TRANSLATIONS.en;
      for (const part of key.split('.')) {
        if (origEnCurr && typeof origEnCurr === 'object' && part in origEnCurr) {
          origEnCurr = origEnCurr[part];
        } else {
          origEnCurr = null;
          break;
        }
      }
      if (origEnCurr !== null && origEnCurr !== undefined) {
        curr = origEnCurr;
      }
    }
  }

  // Final deliberate English fallback: NEVER display raw dot-notated technical keys
  let result = curr;
  if (result === null || result === undefined) {
    if (fallback !== null) {
      result = fallback;
    } else {
      // Deliberate clean English title fallback from key segment
      const lastSegment = key.split('.').pop();
      result = lastSegment
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .trim();
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }
  }

  // Interpolate parameters if provided
  if (typeof result === 'string' && params && typeof params === 'object') {
    for (const [pKey, pVal] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
    }
  }

  return result;
}

const LanguageContext = createContext({
  language: 'en',
  currentLanguage: 'en',
  setLanguage: () => {},
  changeLanguage: () => {},
  t: (key, fallback, params) => translate(key, 'en', fallback, params),
  languages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    const handleLangEvent = (e) => {
      const targetLang = e.detail?.language;
      if (targetLang && TRANSLATIONS[targetLang] && targetLang !== language) {
        setLanguageState(targetLang);
      }
    };
    window.addEventListener('flora_language_changed', handleLangEvent);
    return () => window.removeEventListener('flora_language_changed', handleLangEvent);
  }, [language]);

  const changeLanguage = useCallback((newLang) => {
    if (!TRANSLATIONS[newLang]) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      sessionStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {}

    // Dispatch global custom event for non-React controllers (e.g. audioController)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flora_language_changed', { detail: { language: newLang } }));
    }
  }, []);

  const t = useCallback((key, fallback = null, params = null) => {
    return translate(key, language, fallback, params);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguage: language,
        setLanguage: changeLanguage,
        changeLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
