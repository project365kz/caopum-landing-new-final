import { useState, useEffect, useRef, useCallback } from 'react'
import logoSvg from '/logo.svg'
import Preloader from './components/Preloader'
import { useLang, useT } from './i18n/LanguageContext'
import {
  Menu, X, ChevronDown, ArrowUp, Send,
  Target, ShieldCheck, Leaf, PackageCheck, Scale, Recycle,
  Landmark, FileText, Users, CalendarDays, ArrowLeftRight, Megaphone,
  Factory, Container, Layers, Package, Boxes, Cog, Wrench,
  Handshake, MessageSquare, UserPlus, BookOpen, Award, Calendar,
  Mail, Phone, MapPin, CheckCircle2, ExternalLink
} from 'lucide-react'

/* ==================== НАСТРОЙКИ ==================== */

const GOOGLE_SHEET_ID = '1GTWhFoB2tyWj-KcIBwyDd2tu0zgYAx2-wcixTV4I7cY'
const WEB3FORMS_KEY = '2f9a0467-bbc7-41df-b04f-ba46f8456494'

/* ==================== ДАННЫЕ (только структура — тексты приходят через t()) ==================== */

const NAV_LINKS = [
  { href: '#about', key: 'nav.about' },
  { href: '#activities', key: 'nav.activities' },
  { href: '#benefits', key: 'nav.benefits' },
  { href: '#forwho', key: 'nav.forwho' },
  { href: '#news', key: 'nav.news' },
  { href: '#contacts', key: 'nav.contacts' },
]

const GOALS = [
  { icon: Target, k: 'goals.1' },
  { icon: Scale, k: 'goals.2' },
  { icon: ShieldCheck, k: 'goals.3' },
  { icon: PackageCheck, k: 'goals.4' },
  { icon: Recycle, k: 'goals.5' },
  { icon: Leaf, k: 'goals.6' },
]

const ACTIVITIES = [
  { icon: Landmark, k: 'activities.1' },
  { icon: FileText, k: 'activities.2' },
  { icon: Users, k: 'activities.3' },
  { icon: CalendarDays, k: 'activities.4' },
  { icon: ArrowLeftRight, k: 'activities.5' },
  { icon: Megaphone, k: 'activities.6' },
]

const MEMBER_TYPES = [
  { icon: Factory, k: 'members.1' },
  { icon: Container, k: 'members.2' },
  { icon: Layers, k: 'members.3' },
  { icon: Package, k: 'members.4' },
  { icon: Boxes, k: 'members.5' },
  { icon: Wrench, k: 'members.6' },
  { icon: Recycle, k: 'members.7' },
]

const BENEFITS = [
  { icon: Handshake, k: 'benefits.1' },
  { icon: MessageSquare, k: 'benefits.2' },
  { icon: UserPlus, k: 'benefits.3' },
  { icon: BookOpen, k: 'benefits.4' },
  { icon: Award, k: 'benefits.5' },
  { icon: Calendar, k: 'benefits.6' },
]

const FOR_WHOM = [
  { icon: Factory, k: 'forwho.1' },
  { icon: Cog, k: 'forwho.2' },
  { icon: Boxes, k: 'forwho.3' },
  { icon: ArrowLeftRight, k: 'forwho.4' },
  { icon: Package, k: 'forwho.5' },
]

/* ==================== ХУКИ ==================== */

function useScrollManager() {
  const [data, setData] = useState({
    progress: 0,
    scrolled: false,
    showScrollTop: false,
    activeSection: '',
  })

  useEffect(() => {
    let ticking = false
    const handler = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight

        let activeSection = ''
        const sections = NAV_LINKS.map(l => l.href.slice(1))
        for (const id of sections) {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= 120) {
            activeSection = id
          }
        }

        setData({
          progress: docHeight > 0 ? (scrollTop / docHeight) * 100 : 0,
          scrolled: scrollTop > 30,
          showScrollTop: scrollTop > 500,
          activeSection,
        })
        ticking = false
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return data
}

function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const observeAll = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => io.observe(el))
    }
    observeAll()

    const mutationObs = new MutationObserver(observeAll)
    mutationObs.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mutationObs.disconnect()
    }
  }, [])
}

const scrollLockCount = { current: 0 }
function lockScroll() {
  scrollLockCount.current++
  document.body.style.overflow = 'hidden'
}
function unlockScroll() {
  scrollLockCount.current = Math.max(0, scrollLockCount.current - 1)
  if (scrollLockCount.current === 0) {
    document.body.style.overflow = ''
  }
}

/* ==================== КОМПОНЕНТЫ ==================== */

/* --- Кнопка CTA --- */
function CtaButton({ className = '', children, onClick, variant = 'accent' }) {
  const base = 'relative inline-flex items-center justify-center gap-2.5 font-semibold rounded-xl transition-all duration-300 cursor-pointer'
  const variants = {
    accent: 'bg-accent-500 hover:bg-accent-600 text-white shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5',
    outline: 'border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50',
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5',
  }
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base ${className}`}>
      {children}
    </button>
  )
}

/* --- Заголовок секции --- */
function SectionHeader({ tag, title, subtitle, light = false }) {
  return (
    <div className="text-center mb-8 sm:mb-14 reveal">
      {tag && (
        <span className={`font-semibold text-xs sm:text-sm uppercase tracking-wider ${light ? 'text-accent-400' : 'text-accent-500'}`}>
          {tag}
        </span>
      )}
      <h2 className={`mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h2>
      <div className="section-divider mt-4 sm:mt-5" />
      {subtitle && (
        <p className={`mt-2 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed ${light ? 'text-white/70' : 'text-slate-600'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* --- Прогресс-бар --- */
function ScrollProgress({ progress }) {
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />
}

/* --- Переключатель языка RU / EN --- */
function LangSwitcher({ scrolled, variant = 'desktop' }) {
  const { lang, setLang, t } = useLang()
  const baseBtn = 'px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-300 cursor-pointer uppercase tracking-wider'

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        <button onClick={() => setLang('ru')}
          className={`${baseBtn} ${lang === 'ru' ? 'bg-white text-primary-500 shadow-sm' : 'text-slate-500'}`}>
          {t('header.langRu')}
        </button>
        <button onClick={() => setLang('en')}
          className={`${baseBtn} ${lang === 'en' ? 'bg-white text-primary-500 shadow-sm' : 'text-slate-500'}`}>
          {t('header.langEn')}
        </button>
      </div>
    )
  }

  const inactive = scrolled ? 'text-slate-400 hover:text-slate-600' : 'text-white/60 hover:text-white'
  const active = scrolled ? 'text-primary-500 bg-primary-50' : 'text-white bg-white/15'
  return (
    <div className={`flex items-center gap-0.5 ${scrolled ? '' : 'border border-white/20 rounded-lg p-0.5'}`}>
      <button onClick={() => setLang('ru')} className={`${baseBtn} ${lang === 'ru' ? active : inactive}`}>
        {t('header.langRu')}
      </button>
      <button onClick={() => setLang('en')} className={`${baseBtn} ${lang === 'en' ? active : inactive}`}>
        {t('header.langEn')}
      </button>
    </div>
  )
}

/* --- Header --- */
function Header({ onCtaClick, scrolled, activeSection }) {
  const t = useT()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (mobileOpen) lockScroll()
    else unlockScroll()
    return () => { if (mobileOpen) unlockScroll() }
  }, [mobileOpen])

  // На Hero (тёмный фон) — логотип в белом варианте через CSS filter.
  // При скролле (белый фон) — обычный цветной.
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
      ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-slate-900/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a href="#" className="flex items-center gap-3 shrink-0">
            <img
              src={logoSvg}
              alt="ЦАОПУМ"
              className={`h-10 sm:h-14 w-auto transition-[filter] duration-500 ${scrolled ? '' : 'brightness-0 invert'}`}
            />
          </a>

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(link => {
              const isActive = activeSection === link.href.slice(1)
              return (
                <a key={link.href} href={link.href}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300
                    ${scrolled
                      ? `${isActive ? 'text-primary-500 bg-primary-50' : 'text-slate-600 hover:text-primary-500 hover:bg-slate-50'}`
                      : `${isActive ? 'text-white bg-white/15' : 'text-white/80 hover:text-white hover:bg-white/10'}`
                    }`}
                >
                  {t(link.key)}
                </a>
              )
            })}
            <div className="ml-3">
              <LangSwitcher scrolled={scrolled} />
            </div>
            <button onClick={onCtaClick}
              className={`ml-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer
                ${scrolled
                  ? 'bg-accent-500 text-white hover:bg-accent-600 shadow-md shadow-accent-500/20'
                  : 'bg-white/15 text-white border border-white/25 hover:bg-white/25 backdrop-blur-sm'}`}
            >
              {t('cta.join')}
            </button>
          </nav>

          <button onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg cursor-pointer transition-colors ${scrolled ? 'text-slate-700' : 'text-white'}`}
            aria-label={mobileOpen ? t('header.closeMenu') : t('header.openMenu')}
            aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl mobile-menu-enter">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            <div className="px-4 pb-3 mb-2 border-b border-slate-100">
              <LangSwitcher variant="mobile" />
            </div>
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3.5 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary-500 font-medium transition-colors">
                {t(link.key)}
              </a>
            ))}
            <button onClick={() => { setMobileOpen(false); onCtaClick() }}
              className="mt-3 px-4 py-3.5 bg-accent-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-accent-600 transition-colors">
              {t('cta.apply')}
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}

/* --- Hero --- */
function Hero({ onCtaClick }) {
  const t = useT()
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />

      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-2xl sm:blur-3xl hero-blob-1" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-primary-400/10 rounded-full blur-2xl sm:blur-3xl hero-blob-2" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-accent-400/5 rounded-full blur-2xl sm:blur-3xl hero-blob-3" />

      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:py-32 md:py-36 text-center w-full">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 mb-6 sm:mb-8 sm:backdrop-blur-sm reveal">
          <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
          <span className="text-white/70 text-xs sm:text-sm font-medium">{t('hero.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] mb-4 sm:mb-6 max-w-5xl mx-auto reveal">
          {t('hero.title.main')}{' '}
          <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
            {t('hero.title.accent')}
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed reveal reveal-delay-1">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 reveal reveal-delay-2">
          <CtaButton onClick={onCtaClick} className="w-full sm:w-auto">
            <Send size={18} />
            {t('cta.apply')}
          </CtaButton>
          <CtaButton variant="outline" className="w-full sm:w-auto" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
            {t('cta.learnMore')}
            <ChevronDown size={18} />
          </CtaButton>
        </div>

        <div className="mt-10 sm:mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 max-w-4xl mx-auto reveal reveal-delay-3">
          {[
            { value: '7+', label: t('hero.stat1.label') },
            { value: '6', label: t('hero.stat2.label') },
            { value: t('hero.stat3.value'), label: t('hero.stat3.label') },
            { value: '∞', label: t('hero.stat4.label') },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent mb-0.5">
                {s.value}
              </div>
              <div className="text-white/50 text-xs sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hidden sm:flex flex-col items-center gap-2 scroll-hint-anim">
        <span className="text-xs font-medium tracking-wider uppercase">{t('hero.scrollHint')}</span>
        <ChevronDown size={20} />
      </div>
    </section>
  )
}

/* --- О нас + Цели (табы) --- */
function About() {
  const t = useT()
  const [tab, setTab] = useState('about')

  return (
    <section id="about" className="py-14 sm:py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader tag={t('about.tag')} title={t('about.title')} />

        <div className="flex justify-center mb-8 sm:mb-12 reveal" role="tablist">
          <div className="inline-flex bg-slate-100 rounded-xl sm:rounded-2xl p-1">
            {[
              { key: 'about', label: t('about.tab.about') },
              { key: 'goals', label: t('about.tab.goals') },
            ].map(item => (
              <button key={item.key} onClick={() => setTab(item.key)}
                role="tab"
                aria-selected={tab === item.key}
                className={`px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer
                  ${tab === item.key
                    ? 'bg-white text-primary-500 shadow-md'
                    : 'text-slate-500 hover:text-slate-700'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tab-content" key={tab}>
          {tab === 'about' ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-5 gap-6 sm:gap-10 items-start">
                <div className="md:col-span-3 space-y-4 sm:space-y-5 reveal">
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">{t('about.companyName')}</strong>{t('about.text1Rest')}
                  </p>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                    {t('about.text2')}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-3 sm:space-y-4 reveal reveal-delay-1">
                  {[
                    { icon: Users, label: t('about.stat1.label'), sub: t('about.stat1.sub') },
                    { icon: Target, label: t('about.stat2.label'), sub: t('about.stat2.sub') },
                    { icon: CheckCircle2, label: t('about.stat3.label'), sub: t('about.stat3.sub') },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-primary-200 transition-colors duration-300">
                      <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <s.icon size={22} className="text-primary-500" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{s.label}</div>
                        <div className="text-slate-500 text-xs">{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {GOALS.map((item, i) => (
                <div key={i} className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100
                  hover:shadow-xl hover:border-accent-200 hover:-translate-y-1 transition-all duration-300 group reveal reveal-delay-${Math.min(i, 5)}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-500/10 to-accent-500/5 rounded-xl
                    flex items-center justify-center mb-4 group-hover:bg-accent-500 group-hover:shadow-lg group-hover:shadow-accent-500/25 transition-all duration-300">
                    <item.icon size={24} className="text-accent-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{t(item.k + '.title')}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{t(item.k + '.text')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* --- Направления деятельности --- */
function Activities() {
  const t = useT()
  return (
    <section id="activities" className="py-14 sm:py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t('activities.tag')}
          title={t('activities.title')}
          subtitle={t('activities.subtitle')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ACTIVITIES.map((item, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 sm:p-7 border border-slate-100
              hover:shadow-xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 group reveal reveal-delay-${Math.min(i, 5)}`}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500/10 to-primary-500/5 rounded-xl sm:rounded-2xl
                flex items-center justify-center mb-3 sm:mb-5 group-hover:bg-primary-500 group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                <item.icon size={24} className="text-primary-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1.5 sm:mb-2 text-base sm:text-lg">{t(item.k + '.title')}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(item.k + '.text')}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- Преимущества --- */
function Benefits({ onCtaClick }) {
  const t = useT()
  return (
    <section id="benefits" className="py-14 sm:py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-400/8 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader tag={t('benefits.tag')} title={t('benefits.title')} light />

        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-14 reveal">
          <p className="text-white/80 text-base sm:text-lg leading-relaxed">
            {t('benefits.intro1')}<strong className="text-white">{t('benefits.intro2')}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8 sm:mb-14">
          {BENEFITS.map((b, i) => (
            <div key={i} className={`glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 group reveal reveal-delay-${Math.min(i, 5)}`}>
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-accent-500/15 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4
                group-hover:bg-accent-500 group-hover:shadow-lg group-hover:shadow-accent-500/30 transition-all duration-300">
                <b.icon size={22} className="text-accent-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{t(b.k + '.title')}</h3>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{t(b.k + '.text')}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto text-center reveal">
          <p className="text-white/70 mb-2 text-xs sm:text-sm">
            {t('benefits.cta.who')}
          </p>
          <p className="text-white font-semibold text-base sm:text-xl mb-5 sm:mb-6">
            {t('benefits.cta.apply')}
          </p>
          <CtaButton onClick={onCtaClick} className="w-full sm:w-auto">
            <Send size={18} />
            {t('cta.becomeMember')}
          </CtaButton>
        </div>
      </div>
    </section>
  )
}

/* --- Для кого --- */
function ForWhom({ onCtaClick }) {
  const t = useT()
  return (
    <section id="forwho" className="py-14 sm:py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t('forwho.tag')}
          title={t('forwho.title')}
          subtitle={t('forwho.subtitle')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5 mb-8 sm:mb-12">
          {FOR_WHOM.map((item, i) => (
            <div key={i} className={`group flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 bg-white
              hover:border-accent-300 hover:shadow-xl transition-all duration-300 reveal reveal-delay-${Math.min(i, 4)}`}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 sm:mx-auto sm:mb-4 bg-gradient-to-br from-primary-50 to-accent-500/5 rounded-xl sm:rounded-2xl
                flex items-center justify-center shrink-0 group-hover:from-accent-500 group-hover:to-accent-600
                group-hover:shadow-lg group-hover:shadow-accent-500/25 transition-all duration-300">
                <item.icon size={24} className="text-primary-500 group-hover:text-white transition-colors duration-300 sm:[&]:w-7 sm:[&]:h-7" />
              </div>
              <div className="sm:text-center">
                <h3 className="font-bold text-slate-900 text-sm mb-0.5 sm:mb-1">{t(item.k + '.label')}</h3>
                <p className="text-slate-400 text-xs">{t(item.k + '.desc')}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center reveal">
          <CtaButton variant="primary" onClick={onCtaClick} className="w-full sm:w-auto">
            <Send size={18} />
            {t('cta.applyJoin')}
          </CtaButton>
        </div>
      </div>
    </section>
  )
}

/* --- Участники --- */
function Members() {
  const t = useT()
  return (
    <section className="py-14 sm:py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t('members.tag')}
          title={t('members.title')}
          subtitle={t('members.subtitle')}
        />
        <div className="flex flex-wrap justify-center gap-4">
          {MEMBER_TYPES.map((m, i) => (
            <div key={i} className={`flex items-center gap-3 sm:gap-4 bg-white rounded-xl p-4 sm:p-5
              border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-300
              w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] reveal reveal-delay-${Math.min(i, 5)}`}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary-500/10 rounded-lg flex items-center justify-center shrink-0">
                <m.icon size={20} className="text-primary-500" />
              </div>
              <span className="text-slate-700 font-medium text-sm">{t(m.k)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- Загрузка данных из Google Таблицы --- */

function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return ''
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return ''
    if (parsed.hostname === 'drive.google.com') {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
      if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`
      return ''
    }
    return url
  } catch {}
  return ''
}

function sanitizeText(val) {
  if (typeof val !== 'string') return String(val ?? '')
  return val.replace(/<[^>]*>/g, '')
}

function parseGoogleSheetsResponse(text) {
  const match = text.match(/google\.visualization\.Query\.setResponse\((.+)\)/s)
  if (!match) return []
  let json
  try {
    json = JSON.parse(match[1])
  } catch {
    return []
  }
  if (!json?.table?.cols || !json?.table?.rows) return []
  const cols = json.table.cols.map(c => c.label)
  return json.table.rows
    .map(row => {
      const obj = {}
      row.c.forEach((cell, i) => {
        if (cols[i]) obj[cols[i]] = cell ? (cell.f ?? cell.v ?? '') : ''
      })
      return {
        'Заголовок': sanitizeText(obj['Заголовок']),
        'Текст': sanitizeText(obj['Текст']),
        'Дата': sanitizeText(obj['Дата']),
        'Картинка': sanitizeImageUrl(obj['Картинка']),
        // Опциональные английские поля. Если в таблице нет — будут пустые
        'Title EN': sanitizeText(obj['Title EN']),
        'Text EN': sanitizeText(obj['Text EN']),
      }
    })
    .filter(item => item['Заголовок'])
}

// Берёт заголовок новости в нужном языке. EN с fallback на русский
function getNewsTitle(item, lang) {
  if (lang === 'en' && item['Title EN']) return item['Title EN']
  return item['Заголовок'] || ''
}

// Берёт текст новости в нужном языке. EN с fallback на русский
function getNewsText(item, lang) {
  if (lang === 'en' && item['Text EN']) return item['Text EN']
  return item['Текст'] || ''
}

function useGoogleSheetNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!GOOGLE_SHEET_ID) {
      setLoading(false)
      return
    }
    fetch(`https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json`)
      .then(r => r.text())
      .then(text => setNews(parseGoogleSheetsResponse(text)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { news, loading }
}

/* --- Модалка новости --- */
function NewsModal({ item, onClose }) {
  const { lang, t } = useLang()

  useEffect(() => {
    if (!item) return
    lockScroll()
    const handleEscape = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)
    return () => {
      unlockScroll()
      document.removeEventListener('keydown', handleEscape)
    }
  }, [item, onClose])

  if (!item) return null

  const title = getNewsTitle(item, lang)
  const text = getNewsText(item, lang)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 overlay-enter" />
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-scroll modal-enter"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          aria-label={t('cta.close')}>
          <X size={18} />
        </button>
        {item['Картинка'] && (
          <div className="w-full max-h-[400px] overflow-hidden rounded-t-2xl">
            <img src={item['Картинка']} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          {item['Дата'] && (
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{item['Дата']}</p>
          )}
          <h2 className="font-bold text-slate-900 text-xl sm:text-2xl mb-4">{title}</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">{text}</p>
        </div>
      </div>
    </div>
  )
}

/* --- Новости --- */
function News() {
  const { lang, t } = useLang()
  const { news, loading } = useGoogleSheetNews()
  const [selected, setSelected] = useState(null)

  const placeholders = [
    { 'Заголовок': t('news.placeholder.1.title'), 'Текст': t('news.placeholder.1.text'), 'Дата': t('news.soon'), 'Картинка': '' },
    { 'Заголовок': t('news.placeholder.2.title'), 'Текст': t('news.placeholder.2.text'), 'Дата': t('news.soon'), 'Картинка': '' },
    { 'Заголовок': t('news.placeholder.3.title'), 'Текст': t('news.placeholder.3.text'), 'Дата': t('news.soon'), 'Картинка': '' },
  ]

  const hasNews = news.length > 0
  const items = hasNews ? news.slice(0, 20) : placeholders

  return (
    <section id="news" className="py-14 sm:py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t('news.tag')}
          title={t('news.title')}
          subtitle={t('news.subtitle')}
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="relative">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-news -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              {items.map((n, i) => {
                const title = hasNews ? getNewsTitle(n, lang) : n['Заголовок']
                const text = hasNews ? getNewsText(n, lang) : n['Текст']
                return (
                  <div key={i} onClick={() => hasNews && setSelected(n)}
                    className={`min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] flex-shrink-0 snap-start
                    rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 bg-white
                    hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${hasNews ? 'cursor-pointer' : ''}`}>
                    {n['Картинка'] ? (
                      <div className="h-40 sm:h-48 overflow-hidden">
                        <img src={n['Картинка']} alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-40 sm:h-48 bg-gradient-to-br from-primary-50 via-slate-50 to-accent-50 flex items-center justify-center">
                        <Package size={36} className="text-slate-200 group-hover:text-primary-200 transition-colors duration-300 sm:[&]:w-12 sm:[&]:h-12" />
                      </div>
                    )}
                    <div className="p-4 sm:p-6">
                      {n['Дата'] && (
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 sm:mb-2">{n['Дата']}</p>
                      )}
                      <h3 className="font-bold text-slate-900 mb-1.5 sm:mb-2 text-sm sm:text-base group-hover:text-primary-500 transition-colors duration-300 line-clamp-2">
                        {title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">{text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <NewsModal item={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

/* --- Контакты --- */
function Contacts({ onCtaClick }) {
  const t = useT()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    const form = e.target
    const data = {
      access_key: WEB3FORMS_KEY,
      subject: t('contacts.form.subject'),
      from_name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    }
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSent(true)
        form.reset()
        setTimeout(() => setSent(false), 4000)
      } else {
        alert(t('contacts.form.error'))
      }
    } catch {
      alert(t('contacts.form.networkError'))
    }
    setSending(false)
  }

  return (
    <section id="contacts" className="py-14 sm:py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900" />
      <div className="absolute top-[-10%] right-[20%] w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader tag={t('contacts.tag')} title={t('contacts.title')} light />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 max-w-5xl mx-auto">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 reveal">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">
              {t('contacts.company')}
            </h3>
            <div className="space-y-5">
              {[
                { icon: Mail, label: t('contacts.email.label'), value: 'caopum.kz@gmail.com', href: 'mailto:caopum.kz@gmail.com' },
                { icon: Phone, label: t('contacts.phone.label'), value: '+7 747 794 11 63', href: 'tel:+77477941163' },
                { icon: MapPin, label: t('contacts.address.label'), value: t('contacts.address.value') },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/8 rounded-xl flex items-center justify-center shrink-0">
                    <c.icon size={20} className="text-accent-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-white font-medium hover:text-accent-400 transition-colors">{c.value}</a>
                    ) : (
                      <p className="text-white font-medium">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/50 text-sm mb-4">{t('contacts.wantJoin')}</p>
              <button onClick={onCtaClick}
                className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 font-semibold text-sm transition-colors cursor-pointer">
                {t('cta.applyShort')} <ExternalLink size={16} />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 reveal reveal-delay-1">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">{t('contacts.form.title')}</h3>
            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-accent-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-accent-400" />
                </div>
                <p className="text-white font-semibold text-lg">{t('contacts.form.success')}</p>
                <p className="text-white/50 text-sm mt-2">{t('contacts.form.successSub')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input type="text" name="name" required placeholder={t('contacts.form.name')}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30
                      focus:border-accent-500/50 focus:bg-white/8 outline-none transition-all duration-300" />
                </div>
                <div>
                  <input type="email" name="email" required placeholder={t('contacts.form.email')}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30
                      focus:border-accent-500/50 focus:bg-white/8 outline-none transition-all duration-300" />
                </div>
                <div>
                  <textarea name="message" required placeholder={t('contacts.form.message')} rows="4"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30
                      focus:border-accent-500/50 focus:bg-white/8 outline-none transition-all duration-300 resize-none" />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl
                    transition-all duration-300 shadow-lg shadow-accent-500/25 cursor-pointer flex items-center justify-center gap-2">
                  <Send size={18} />
                  {sending ? t('contacts.form.sending') : t('contacts.form.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* --- Footer --- */
function Footer({ onCtaClick }) {
  const t = useT()
  return (
    <footer className="bg-slate-950 py-8 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-800/50">
          <img src={logoSvg} alt="ЦАОПУМ" className="h-8 sm:h-10 w-auto brightness-0 invert opacity-60" />
          <nav className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} className="text-slate-500 hover:text-white text-xs sm:text-sm transition-colors duration-300">
                {t(link.key)}
              </a>
            ))}
          </nav>
          <button onClick={onCtaClick}
            className="px-5 py-2.5 bg-accent-500/10 text-accent-400 border border-accent-500/20 rounded-xl text-sm font-semibold
              hover:bg-accent-500 hover:text-white transition-all duration-300 cursor-pointer">
            {t('cta.join')}
          </button>
        </div>
        <p className="text-slate-600 text-xs sm:text-sm text-center">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  )
}

/* --- Модальная форма заявки --- */
function ApplicationModal({ isOpen, onClose }) {
  const t = useT()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setSubmitted(false)
    setSubmitting(false)
    lockScroll()

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      unlockScroll()
      document.removeEventListener('keydown', handleEscape)
      if (formRef.current) formRef.current.reset()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const form = e.target
    const empty = t('modal.empty')
    const data = {
      access_key: WEB3FORMS_KEY,
      subject: t('modal.subject'),
      // Ключи на русском — для удобства чтения письма на email
      'Компания': form.company.value,
      'Тип предприятия': form.type.value,
      'Контактное лицо': form.contact.value,
      'Должность': form.position.value || empty,
      'Телефон': form.phone.value,
      'Email': form.email.value,
      'Комментарий': form.comment.value || empty,
    }
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        alert(t('contacts.form.error'))
      }
    } catch {
      alert(t('contacts.form.networkError'))
    }
    setSubmitting(false)
  }

  const req = t('modal.required')

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 pb-[env(safe-area-inset-bottom)]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm overlay-enter" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto modal-scroll modal-enter"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label={t('modal.close')}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-300 hover:text-slate-600 cursor-pointer transition-colors z-10">
          <X size={22} />
        </button>

        <div className="p-5 sm:p-7 md:p-9">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-accent-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={40} className="text-accent-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('modal.success.title')}</h3>
              <p className="text-slate-500 mb-6">{t('modal.success.text')}</p>
              <button onClick={onClose}
                className="px-8 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors cursor-pointer">
                {t('modal.close')}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('modal.title')}</h3>
                <p className="text-slate-500">{t('modal.subtitle')}</p>
              </div>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('modal.field.company')} {req}</label>
                    <input type="text" name="company" required placeholder={t('modal.field.company.ph')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('modal.field.type')} {req}</label>
                    <select name="type" required defaultValue=""
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm text-slate-700">
                      <option value="" disabled>{t('modal.field.type.ph')}</option>
                      {MEMBER_TYPES.map((m, i) => (
                        <option key={i} value={t(m.k)}>{t(m.k)}</option>
                      ))}
                      <option value="other">{t('modal.field.type.other')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('modal.field.contact')} {req}</label>
                    <input type="text" name="contact" required placeholder={t('modal.field.contact.ph')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('modal.field.position')}</label>
                    <input type="text" name="position" placeholder={t('modal.field.position.ph')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('modal.field.phone')} {req}</label>
                    <input type="tel" name="phone" required placeholder={t('modal.field.phone.ph')} pattern="^\+?\d[\d\s\-\(\)]{6,18}\d$" title={t('modal.field.phone.title')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('modal.field.email')} {req}</label>
                    <input type="email" name="email" required placeholder={t('modal.field.email.ph')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('modal.field.comment')}</label>
                  <textarea name="comment" rows="3" placeholder={t('modal.field.comment.ph')}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm resize-none" />
                </div>
                <label className="flex items-start gap-3 cursor-pointer py-1">
                  <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500" />
                  <span className="text-xs text-slate-500 leading-relaxed">{t('modal.consent')}</span>
                </label>
                <button type="submit" disabled={submitting}
                  className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl
                    transition-all duration-300 shadow-lg shadow-accent-500/25 cursor-pointer flex items-center justify-center gap-2 mt-2">
                  <Send size={18} />
                  {submitting ? t('modal.submitting') : t('modal.submit')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* --- Кнопка «Наверх» --- */
function ScrollToTop({ visible }) {
  const t = useT()
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 text-white rounded-full shadow-xl
        flex items-center justify-center hover:bg-primary-600 hover:shadow-2xl hover:-translate-y-0.5
        transition-all duration-300 cursor-pointer
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      aria-label={t('common.scrollTop')}
    >
      <ArrowUp size={20} />
    </button>
  )
}

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */

export default function App() {
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const openModal = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => setModalOpen(false), [])
  const finishLoading = useCallback(() => setLoading(false), [])

  const { progress, scrolled, showScrollTop, activeSection } = useScrollManager()
  useScrollReveal()

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {loading && <Preloader onFinish={finishLoading} />}
      <ScrollProgress progress={progress} />
      <Header onCtaClick={openModal} scrolled={scrolled} activeSection={activeSection} />
      <Hero onCtaClick={openModal} />
      <About />
      <Activities />
      <Benefits onCtaClick={openModal} />
      <ForWhom onCtaClick={openModal} />
      <Members />
      <News />
      <Contacts onCtaClick={openModal} />
      <Footer onCtaClick={openModal} />
      <ApplicationModal isOpen={modalOpen} onClose={closeModal} />
      <ScrollToTop visible={showScrollTop} />
    </div>
  )
}
