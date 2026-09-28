import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from './en.js'
import pt from './pt.js'
import pagesEn from './pages.en.js'
import pagesPt from './pages.pt.js'

const DICTS = { en: { ...en, pages: pagesEn }, pt: { ...pt, pages: pagesPt } }
const I18nContext = createContext({ t: DICTS.en, lang: 'en', setLang: () => {}, num: (n) => String(n) })

const read = () => {
  try {
    const stored = window.localStorage.getItem('alphractal-lang')
    if (stored === 'en' || stored === 'pt') return stored
  } catch {
    /* storage can be blocked, English is the default */
  }
  return 'en'
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(read)

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      window.localStorage.setItem('alphractal-lang', next)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = DICTS[lang].meta.lang
  }, [lang])

  const value = useMemo(() => {
    const locale = lang === 'pt' ? 'pt-BR' : 'en-US'
    return { lang, setLang, t: DICTS[lang], num: (n) => new Intl.NumberFormat(locale).format(n) }
  }, [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
