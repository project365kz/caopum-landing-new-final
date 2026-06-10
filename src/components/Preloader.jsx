import { useEffect, useRef, useState } from 'react'

// Splash-экран: загружает caopum-splash.svg inline (чтобы overflow:visible работал на лепестках),
// держит SPLASH_HOLD мс, делает плавный fade-out за FADE_DURATION и зовёт onFinish.
// Используется один раз при первой загрузке сайта.

const SPLASH_HOLD = 2700   // длительность анимации в SVG (~2.5с) + небольшая пауза
const FADE_DURATION = 500  // плавное исчезновение

export default function Preloader({ onFinish }) {
  const [fadingOut, setFadingOut] = useState(false)
  const [svgMarkup, setSvgMarkup] = useState('')
  const containerRef = useRef(null)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  // Загружаем SVG как текст и вставляем inline — так overflow:visible сохраняется
  useEffect(() => {
    let aborted = false
    fetch(import.meta.env.BASE_URL + 'caopum-splash.svg')
      .then(r => r.text())
      .then(txt => {
        if (aborted) return
        // Убираем XML-декларацию, она ломает innerHTML
        setSvgMarkup(txt.replace(/<\?xml[^>]*\?>\s*/i, ''))
      })
      .catch(() => {
        // Если SVG не загрузился — сразу скрываем splash, чтобы не блокировать сайт
        if (!aborted) onFinishRef.current?.()
      })
    return () => { aborted = true }
  }, [])

  // Таймеры: ждём окончание анимации → fade-out → onFinish
  useEffect(() => {
    const t1 = setTimeout(() => setFadingOut(true), SPLASH_HOLD)
    const t2 = setTimeout(() => onFinishRef.current?.(), SPLASH_HOLD + FADE_DURATION)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  // Гарантируем что у SVG есть overflow:visible, чтобы лепестки не обрезались по viewBox
  useEffect(() => {
    if (!svgMarkup || !containerRef.current) return
    const svg = containerRef.current.querySelector('svg')
    if (svg) svg.setAttribute('overflow', 'visible')
  }, [svgMarkup])

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none transition-opacity ${fadingOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: 'linear-gradient(to bottom right, #07233f 0%, #0b355c 50%, #104879 100%)',
        transitionDuration: `${FADE_DURATION}ms`,
      }}
      // SVG вставляется как HTML; источник — наш собственный файл из public/
      dangerouslySetInnerHTML={svgMarkup ? {
        __html: `<div style="width:min(42vw,460px);filter:drop-shadow(0 0 20px rgba(255,255,255,0.08)) drop-shadow(0 0 60px rgba(50,105,179,0.25));">${svgMarkup}</div>`
      } : undefined}
    />
  )
}
