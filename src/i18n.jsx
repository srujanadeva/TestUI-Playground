// The language context for the whole app (English and Arabic). The text itself lives
// next to each feature in a strings.js file exporting { en, ar }; they are merged here
// into one flat set of keys per language. Strings may contain {name} placeholders,
// filled in by t(key, { name }). A key missing in Arabic falls back to English.
import { createContext, useContext, useState } from 'react'
import common from './common.strings.js'
import layout from './layout/strings.js'
import playgroundInputs from './playground/inputs.strings.js'
import playgroundSelection from './playground/selection.strings.js'
import playgroundButtons from './playground/buttons.strings.js'
import playgroundEvents from './playground/events.strings.js'
import playgroundWindows from './playground/windows.strings.js'
import playgroundAdvanced from './playground/advanced.strings.js'
import playgroundWorkflows from './playground/workflows.strings.js'
import auth from './auth/strings.js'
import petstore from './petstore/strings.js'
import media from './media/strings.js'
import frames from './frames/strings.js'
import spreadsheet from './spreadsheet/strings.js'
import verification from './verification/strings.js'
import data from './data/strings.js'
import controls from './controls/strings.js'
import navigation from './navigation/strings.js'
import interactions from './interactions/strings.js'
import live from './live/strings.js'
import browser from './browser/strings.js'

const MODULES = [
  common,
  layout,
  playgroundInputs,
  playgroundSelection,
  playgroundButtons,
  playgroundEvents,
  playgroundWindows,
  playgroundAdvanced,
  playgroundWorkflows,
  auth,
  petstore,
  media,
  frames,
  spreadsheet,
  verification,
  data,
  controls,
  navigation,
  interactions,
  live,
  browser,
]

/**
 * Merges every feature's strings into { en: {...}, ar: {...} }.
 * Keys share one namespace, so in development a key defined twice (which would
 * silently overwrite) or present in only one language is reported in the console.
 */
function mergeStrings(modules) {
  const merged = { en: {}, ar: {} }
  for (const strings of modules) {
    for (const lang of ['en', 'ar']) {
      for (const [key, value] of Object.entries(strings[lang] ?? {})) {
        if (import.meta.env.DEV && key in merged[lang]) console.warn(`[i18n] duplicate ${lang} key: ${key}`)
        merged[lang][key] = value
      }
    }
  }
  if (import.meta.env.DEV) {
    for (const key of Object.keys(merged.en)) if (!(key in merged.ar)) console.warn(`[i18n] missing ar key: ${key}`)
    for (const key of Object.keys(merged.ar)) if (!(key in merged.en)) console.warn(`[i18n] missing en key: ${key}`)
  }
  return merged
}

const translations = mergeStrings(MODULES)

const LanguageContext = createContext(null)

/**
 * Provides the current language and translation helpers. The language starts as
 * English on every load; it isn't saved.
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  /**
   * The translated string for `key`, with {placeholders} filled from `vars`.
   * Falls back to English, then to the key itself, so a missing translation shows
   * up visibly instead of as blank text.
   * Each placeholder is replaced once (String.replace with a string pattern).
   */
  const t = (key, vars = {}) => {
    const str = translations[lang]?.[key] ?? translations.en[key] ?? key
    if (typeof str !== 'string') return key
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str)
  }

  /** Like t, for keys whose value is an array (e.g. month or country lists). */
  const tArr = key => translations[lang]?.[key] ?? translations.en[key] ?? []

  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en')

  return (
    <LanguageContext.Provider value={{ lang, t, tArr, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

/**
 * The language context.
 * @returns `{ lang, t, tArr, toggleLang }`; lang is "en" or "ar".
 */
export const useLang = () => useContext(LanguageContext)
