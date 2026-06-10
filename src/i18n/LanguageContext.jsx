import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translations } from './translations'

// Контекст языка: lang ('ru' | 'en'), setLang, t(key, vars?)
const LanguageContext = createContext(null)

// Базовый путь приложения (например '/' в продакшне или '/caopum-landing-new-final/' в dev)
const BASE = import.meta.env.BASE_URL || '/'

// Убирает базовый путь из pathname, возвращает остаток начиная с '/'
// Пример: BASE='/foo/', pathname='/foo/en/bar' -> '/en/bar'
function stripBase(pathname) {
  if (!pathname) return '/'
  const baseNoTrailing = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE
  if (baseNoTrailing && pathname.startsWith(baseNoTrailing)) {
    const rest = pathname.slice(baseNoTrailing.length)
    return rest.startsWith('/') ? rest : '/' + rest
  }
  return pathname
}

// Определяем язык по URL (с учётом BASE): /en, /en/, /en/anything -> 'en', иначе 'ru'
function detectLangFromPath(pathname) {
  const path = stripBase(pathname)
  if (path === '/en' || path === '/en/' || path.startsWith('/en/') || path.startsWith('/en?')) {
    return 'en'
  }
  return 'ru'
}

// Получаем "хвост" пути после /en (для сохранения hash и query при переключении)
function stripEnPrefix(path) {
  if (path === '/en' || path === '/en/') return '/'
  if (path.startsWith('/en/')) return path.slice(3)
  return path
}

// Собирает финальный URL для нужного языка с учётом BASE
function buildPath(lang, currentPathname) {
  const inner = stripEnPrefix(stripBase(currentPathname))
  const langPart = lang === 'en' ? (inner === '/' ? '/en/' : '/en' + inner) : inner
  // Склеиваем BASE + langPart, избегая двойных слэшей
  const baseClean = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE
  const langClean = langPart.startsWith('/') ? langPart : '/' + langPart
  return baseClean + langClean || '/'
}

// Простой шаблонизатор: заменяет {key} на значение из vars
function interpolate(str, vars) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`))
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => detectLangFromPath(window.location.pathname))

  // Слушаем popstate (кнопка "назад" в браузере) и обновляем язык
  useEffect(() => {
    const handler = () => {
      const newLang = detectLangFromPath(window.location.pathname)
      setLangState(newLang)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // Синхронизация html lang, title и meta description при смене языка
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = lang === 'en'
      ? 'CAOPUM — Central Asian Association of Packaging Material Manufacturers'
      : 'ЦАОПУМ — Центрально-Азиатское объединение производителей упаковочных материалов'

    const desc = lang === 'en'
      ? 'Professional industry association of packaging manufacturers in Central Asia'
      : 'Профессиональное отраслевое объединение предприятий упаковочной индустрии Центральной Азии'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', desc)
  }, [lang])

  // Метод смены языка с обновлением URL
  const setLang = useCallback((newLang) => {
    if (newLang === lang) return
    const search = window.location.search
    const hash = window.location.hash
    const newPath = buildPath(newLang, window.location.pathname)
    window.history.pushState({}, '', newPath + search + hash)
    setLangState(newLang)
  }, [lang])

  // Функция перевода
  const t = useCallback((key, vars) => {
    const dict = translations[lang] || translations.ru
    const value = dict[key]
    if (value === undefined) {
      // Fallback на русский если ключа нет в текущем словаре
      const ruValue = translations.ru[key]
      if (ruValue !== undefined) return interpolate(ruValue, vars)
      // В крайнем случае возвращаем сам ключ для отладки
      return key
    }
    return interpolate(value, vars)
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}

// Удобный хук — возвращает только функцию t
export function useT() {
  return useLang().t
}
