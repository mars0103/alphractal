import { createContext, useContext, useEffect, useMemo } from 'react'
import en from './en.js'
import pagesEn from './pages.en.js'

// English only. `lang` stays in the context so call sites that key off it keep working.
const DICT = { ...en, pages: pagesEn }
const NUM = new Intl.NumberFormat('en-US')
const VALUE = { lang: 'en', t: DICT, num: (n) => NUM.format(n) }
const I18nContext = createContext(VALUE)

export function I18nProvider({ children }) {
  useEffect(() => {
    document.documentElement.lang = DICT.meta.lang
  }, [])
  const value = useMemo(() => VALUE, [])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
