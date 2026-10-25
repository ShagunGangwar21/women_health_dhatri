import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../translations/translations';
import { useAuth } from './AuthContext';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { user, token } = useAuth();

  // Initialize from localStorage or user profile or default to 'en'
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('dhatri_language');
      if (saved === 'hi' || saved === 'en' || saved === 'hinglish') return saved;
      if (user?.language === 'hi' || user?.language === 'en' || user?.language === 'hinglish') return user.language;
    } catch (e) {}
    return 'en';
  });

  // Sync if user object updates with preferred language
  useEffect(() => {
    if (user?.language && (user.language === 'hi' || user.language === 'en' || user.language === 'hinglish')) {
      const saved = localStorage.getItem('dhatri_language');
      if (!saved) {
        setLanguageState(user.language);
      }
    }
  }, [user]);

  // Set language with instant state update, localStorage persistence, and backend sync
  const setLanguage = useCallback((newLang) => {
    if (newLang !== 'en' && newLang !== 'hi' && newLang !== 'hinglish') return;
    setLanguageState(newLang);
    try {
      localStorage.setItem('dhatri_language', newLang);
    } catch (e) {}

    // Persist to backend user profile if authenticated
    if (token) {
      fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ language: newLang })
      }).catch(err => console.warn('Failed to persist language preference to backend:', err));
    }
  }, [token]);

  // Translate helper: supports dot notation (e.g. 'nav.dashboard') and variables ({count}, {doctor})
  const t = useCallback((keyPath, params = {}, fallback = '') => {
    if (!keyPath) return '';
    const keys = keyPath.split('.');

    let current = translations[language];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = null;
        break;
      }
    }

    // Fallback logic
    if (!current) {
      // If hinglish is missing, try English or Hindi
      if (language === 'hinglish') {
        let enCurrent = translations.en;
        for (const k of keys) {
          if (enCurrent && typeof enCurrent === 'object' && k in enCurrent) {
            enCurrent = enCurrent[k];
          } else {
            enCurrent = null;
            break;
          }
        }
        current = enCurrent;
      }

      // Fallback to English if missing in Hindi
      if (!current && language !== 'en') {
        let enCurrent = translations.en;
        for (const k of keys) {
          if (enCurrent && typeof enCurrent === 'object' && k in enCurrent) {
            enCurrent = enCurrent[k];
          } else {
            enCurrent = null;
            break;
          }
        }
        current = enCurrent;
      }
    }

    if (!current) {
      return fallback || keyPath;
    }

    if (typeof current === 'string') {
      let result = current;
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([paramKey, val]) => {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), val);
        });
      }
      return result;
    }

    return current;
  }, [language]);

  // Format date according to active language locale
  const formatDate = useCallback((dateVal, options = {}) => {
    if (!dateVal) return '';
    const cleanStr = typeof dateVal === 'string' && dateVal.includes('T') ? dateVal.split('T')[0] : String(dateVal);
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
        return d.toLocaleDateString(locale, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          ...options
        });
      }
    }
    return cleanStr;
  }, [language]);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      formatDate,
      isHindi: language === 'hi',
      isHinglish: language === 'hinglish',
      isEnglish: language === 'en'
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
