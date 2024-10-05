/* eslint-disable import/no-relative-packages */
import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import dayjs from 'dayjs';
import usePersistedState from '../util/usePersistedState';


import az from '../../resources/l10n/az.json'; import 'dayjs/locale/az';
import de from '../../resources/l10n/de.json'; import 'dayjs/locale/de';
import en from '../../resources/l10n/en.json'; import 'dayjs/locale/en';
import ru from '../../resources/l10n/ru.json'; import 'dayjs/locale/ru';
import tr from '../../resources/l10n/tr.json'; import 'dayjs/locale/tr';
import uk from '../../resources/l10n/uk.json'; import 'dayjs/locale/uk';

const languages = {
  tr: { data: tr, country: 'TR', name: 'Türkçe' },
  az: { data: az, country: 'AZ', name: 'Azərbaycanca' },
  de: { data: de, country: 'DE', name: 'Deutsch' },
  en: { data: en, country: 'US', name: 'English' },
  ru: { data: ru, country: 'RU', name: 'Русский' },
  uk: { data: uk, country: 'UA', name: 'Українська' },
};

const getDefaultLanguage = () => {
  const browserLanguages = window.navigator.languages ? window.navigator.languages.slice() : [];
  const browserLanguage = window.navigator.userLanguage || window.navigator.language;
  browserLanguages.push(browserLanguage);
  browserLanguages.push(browserLanguage.substring(0, 2));

  for (let i = 0; i < browserLanguages.length; i += 1) {
    let language = browserLanguages[i].replace('-', '');
    if (language in languages) {
      return language;
    }
    if (language.length > 2) {
      language = language.substring(0, 2);
      if (language in languages) {
        return language;
      }
    }
  }
  return 'en';
};

const LocalizationContext = createContext({
  languages,
  language: 'en',
  setLanguage: () => {},
});

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = usePersistedState('language', getDefaultLanguage());
  const direction = /^(ar|he|fa)$/.test(language) ? 'rtl' : 'ltr';

  const value = useMemo(() => ({ languages, language, setLanguage, direction }), [languages, language, setLanguage, direction]);

  useEffect(() => {
    let selected;
    if (language.length > 2) {
      selected = `${language.slice(0, 2)}-${language.slice(-2).toLowerCase()}`;
    } else {
      selected = language;
    }
    dayjs.locale(selected);
    document.dir = direction;
  }, [language, direction]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);

export const useTranslation = () => {
  const context = useContext(LocalizationContext);
  const { data } = context.languages[context.language];
  return useMemo(() => (key) => data[key], [data]);
};

export const useTranslationKeys = (predicate) => {
  const context = useContext(LocalizationContext);
  const { data } = context.languages[context.language];
  return Object.keys(data).filter(predicate);
};
