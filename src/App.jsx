import { useState, useEffect, useRef, useCallback } from 'react'
import logoSvg from '/logo.svg'
import {
  Menu, X, ChevronDown, ArrowUp, Send,
  Target, ShieldCheck, Leaf, PackageCheck, Scale, Recycle,
  Landmark, FileText, Users, CalendarDays, ArrowLeftRight, Megaphone,
  Factory, Container, Layers, Package, Boxes, Cog, Wrench,
  Handshake, MessageSquare, UserPlus, BookOpen, Award, Calendar,
  Mail, Phone, MapPin, CheckCircle2, ExternalLink
} from 'lucide-react'

/* ==================== НАСТРОЙКИ ==================== */

// ID Google Таблицы с новостями (вставь сюда ID из ссылки на таблицу)
// Пример ссылки: https://docs.google.com/spreadsheets/d/СЮДА_ЭТОТ_ID/edit
const GOOGLE_SHEET_ID = '1GTWhFoB2tyWj-KcIBwyDd2tu0zgYAx2-wcixTV4I7cY'
const WEB3FORMS_KEY = '2f9a0467-bbc7-41df-b04f-ba46f8456494'

/* ==================== ДАННЫЕ ==================== */

const NAV_LINKS = [
  { href: '#about', label: 'О нас' },
  { href: '#activities', label: 'Деятельность' },
  { href: '#benefits', label: 'Преимущества' },
  { href: '#forwho', label: 'Для кого' },
  { href: '#news', label: 'Новости' },
  { href: '#contacts', label: 'Контакты' },
]

const GOALS = [
  { icon: Target, title: 'Развитие отрасли', text: 'Развитие упаковочной отрасли Центральной Азии как единого и конкурентоспособного рынка' },
  { icon: Scale, title: 'Стандарты и регламенты', text: 'Участие в разработке технических регламентов и стандартов упаковочной продукции' },
  { icon: ShieldCheck, title: 'Защита производителей', text: 'Защита отечественных производителей от недобросовестной конкуренции и контрафакта' },
  { icon: PackageCheck, title: 'Безопасность упаковки', text: 'Повышение безопасности пищевой упаковки и контроль качества материалов' },
  { icon: Recycle, title: 'Борьба с контрафактом', text: 'Противодействие некачественной и контрафактной упаковочной продукции на рынке' },
  { icon: Leaf, title: 'Экология и переработка', text: 'Развитие переработки вторичного сырья и продвижение экологических инициатив' },
]

const ACTIVITIES = [
  { icon: Landmark, title: 'Взаимодействие с государством', text: 'Работа с государственными органами по вопросам регулирования упаковочной отрасли' },
  { icon: FileText, title: 'Отраслевые инициативы', text: 'Подготовка отраслевых предложений и инициатив для улучшения рыночных условий' },
  { icon: Users, title: 'Экспертная поддержка', text: 'Консультации и экспертная поддержка участников по техническим и правовым вопросам' },
  { icon: CalendarDays, title: 'Форумы и мероприятия', text: 'Организация встреч, форумов, круглых столов и отраслевых конференций' },
  { icon: ArrowLeftRight, title: 'Обмен технологиями', text: 'Содействие обмену опытом и передовыми технологиями между участниками рынка' },
  { icon: Megaphone, title: 'Информационная поддержка', text: 'Информационная и аналитическая поддержка рынка упаковочных материалов' },
]

const MEMBER_TYPES = [
  { icon: Factory, label: 'Производители полимерной упаковки' },
  { icon: Container, label: 'Производители ПЭТ-тары' },
  { icon: Layers, label: 'Производители плёнок и пакетов' },
  { icon: Package, label: 'Производители гофрокартона' },
  { icon: Boxes, label: 'Поставщики сырья' },
  { icon: Wrench, label: 'Поставщики оборудования' },
  { icon: Recycle, label: 'Переработчики вторичного сырья' },
]

const BENEFITS = [
  { icon: Handshake, title: 'Представительство', text: 'Представление интересов вашего бизнеса перед государственными органами' },
  { icon: MessageSquare, title: 'Влияние на стандарты', text: 'Участие в обсуждении и формировании отраслевых требований' },
  { icon: UserPlus, title: 'Новые партнёры', text: 'Новые партнёры и клиенты внутри профессионального сообщества' },
  { icon: BookOpen, title: 'Отраслевая информация', text: 'Доступ к отраслевой информации и практическому опыту коллег' },
  { icon: Award, title: 'Репутация и доверие', text: 'Повышение доверия к компании через членство в объединении' },
  { icon: Calendar, title: 'Совместные проекты', text: 'Участие в совместных проектах, встречах и мероприятиях объединения' },
]

const FOR_WHOM = [
  { icon: Factory, label: 'Производители упаковки', desc: 'Полимерная, ПЭТ, плёнки, гофрокартон' },
  { icon: Cog, label: 'Переработчики полимеров', desc: 'Вторичное сырьё и рециклинг' },
  { icon: Boxes, label: 'Поставщики сырья', desc: 'Полимеры, гранулы, добавки' },
  { icon: ArrowLeftRight, label: 'Поставщики оборудования', desc: 'Экструзия, печать, формовка' },
  { icon: Package, label: 'Потребители упаковки', desc: 'Пищевая, промышленная продукция' },
]

/* ==================== ХУКИ ==================== */

/* Единый scroll-менеджер (один обработчик вместо четырёх) */
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

/* Scroll-reveal с поддержкой динамического контента (табы и т.д.) */
function useScrollReveal() {
  const observerRef = useRef(null)

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
    observerRef.current = io

    const observeAll = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => io.observe(el))
    }
    observeAll()

    // Следим за DOM для динамического контента (табы)
    const mutationObs = new MutationObserver(observeAll)
    mutationObs.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mutationObs.disconnect()
    }
  }, [])
}

/* Управление блокировкой скролла (считает вложенные блокировки) */
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

/* --- Header --- */
function Header({ onCtaClick, scrolled, activeSection }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Блокируем скролл при открытом мобильном меню (с учётом вложенных блокировок)
  useEffect(() => {
    if (mobileOpen) lockScroll()
    else unlockScroll()
    return () => { if (mobileOpen) unlockScroll() }
  }, [mobileOpen])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
      ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-slate-900/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a href="#" className="flex items-center gap-3 shrink-0">
            <img src={logoSvg} alt="ЦАОПУМ" className="h-10 sm:h-14 w-auto" />
          </a>

          {/* Десктоп-навигация */}
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
                  {link.label}
                </a>
              )
            })}
            <button onClick={onCtaClick}
              className={`ml-4 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer
                ${scrolled
                  ? 'bg-accent-500 text-white hover:bg-accent-600 shadow-md shadow-accent-500/20'
                  : 'bg-white/15 text-white border border-white/25 hover:bg-white/25 backdrop-blur-sm'}`}
            >
              Вступить
            </button>
          </nav>

          {/* Бургер */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg cursor-pointer transition-colors ${scrolled ? 'text-slate-700' : 'text-white'}`}
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl mobile-menu-enter">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3.5 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary-500 font-medium transition-colors">
                {link.label}
              </a>
            ))}
            <button onClick={() => { setMobileOpen(false); onCtaClick() }}
              className="mt-3 px-4 py-3.5 bg-accent-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-accent-600 transition-colors">
              Оставить заявку
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}

/* --- Hero --- */
function Hero({ onCtaClick }) {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />

      {/* Анимированные блобы — уменьшен blur на мобильных для iOS Safari */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-2xl sm:blur-3xl hero-blob-1" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-primary-400/10 rounded-full blur-2xl sm:blur-3xl hero-blob-2" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-accent-400/5 rounded-full blur-2xl sm:blur-3xl hero-blob-3" />

      {/* Паттерн */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:py-32 md:py-36 text-center w-full">
        {/* Бейдж */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 mb-6 sm:mb-8 sm:backdrop-blur-sm reveal">
          <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
          <span className="text-white/70 text-xs sm:text-sm font-medium">Профессиональное отраслевое объединение</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] mb-4 sm:mb-6 max-w-5xl mx-auto reveal">
          Центрально-Азиатское объединение производителей{' '}
          <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
            упаковочных материалов
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed reveal reveal-delay-1">
          Развиваем цивилизованный рынок упаковки, повышаем качество продукции и формируем единые отраслевые стандарты в Центральной Азии
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 reveal reveal-delay-2">
          <CtaButton onClick={onCtaClick} className="w-full sm:w-auto">
            <Send size={18} />
            Оставить заявку
          </CtaButton>
          <CtaButton variant="outline" className="w-full sm:w-auto" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
            Узнать больше
            <ChevronDown size={18} />
          </CtaButton>
        </div>

        {/* Статистика */}
        <div className="mt-10 sm:mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 max-w-4xl mx-auto reveal reveal-delay-3">
          {[
            { value: '7+', label: 'типов участников' },
            { value: '6', label: 'направлений работы' },
            { value: 'ЦА', label: 'регион охвата' },
            { value: '∞', label: 'возможностей роста' },
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

      {/* Скролл-подсказка — скрыта на мобильном */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hidden sm:flex flex-col items-center gap-2 scroll-hint-anim">
        <span className="text-xs font-medium tracking-wider uppercase">Вниз</span>
        <ChevronDown size={20} />
      </div>
    </section>
  )
}

/* --- О нас + Цели (табы) --- */
function About() {
  const [tab, setTab] = useState('about')

  return (
    <section id="about" className="py-14 sm:py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader tag="О нас" title="Профессиональная площадка для отрасли" />

        {/* Табы */}
        <div className="flex justify-center mb-8 sm:mb-12 reveal" role="tablist">
          <div className="inline-flex bg-slate-100 rounded-xl sm:rounded-2xl p-1">
            {[
              { key: 'about', label: 'Об объединении' },
              { key: 'goals', label: 'Наши цели' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                role="tab"
                aria-selected={tab === t.key}
                className={`px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer
                  ${tab === t.key
                    ? 'bg-white text-primary-500 shadow-md'
                    : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Контент табов */}
        <div className="tab-content" key={tab}>
          {tab === 'about' ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-5 gap-6 sm:gap-10 items-start">
                <div className="md:col-span-3 space-y-4 sm:space-y-5 reveal">
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">ТОО «Центрально-Азиатское объединение производителей упаковочных материалов»</strong> —
                    это отраслевое объединение производителей упаковки, переработчиков полимеров, поставщиков сырья и оборудования.
                  </p>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                    Объединение формирует профессиональную площадку для взаимодействия бизнеса, государства и потребителей упаковочной продукции.
                    Мы работаем над развитием отрасли, защитой интересов добросовестных производителей и внедрением
                    современных технологических и экологических решений.
                  </p>
                </div>
                <div className="md:col-span-2 space-y-3 sm:space-y-4 reveal reveal-delay-1">
                  {[
                    { icon: Users, label: 'Участников', sub: 'производителей и поставщиков' },
                    { icon: Target, label: 'Центральная Азия', sub: 'география деятельности' },
                    { icon: CheckCircle2, label: 'Единые стандарты', sub: 'требования качества' },
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
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
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
  return (
    <section id="activities" className="py-14 sm:py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Деятельность"
          title="Направления деятельности"
          subtitle="Ключевые области работы объединения"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ACTIVITIES.map((item, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 sm:p-7 border border-slate-100
              hover:shadow-xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 group reveal reveal-delay-${Math.min(i, 5)}`}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500/10 to-primary-500/5 rounded-xl sm:rounded-2xl
                flex items-center justify-center mb-3 sm:mb-5 group-hover:bg-primary-500 group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                <item.icon size={24} className="text-primary-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1.5 sm:mb-2 text-base sm:text-lg">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- Преимущества --- */
function Benefits({ onCtaClick }) {
  return (
    <section id="benefits" className="py-14 sm:py-20 md:py-28 relative overflow-hidden">
      {/* Градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-400/8 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Преимущества"
          title="Зачем вступать в объединение"
          light
        />

        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-14 reveal">
          <p className="text-white/80 text-base sm:text-lg leading-relaxed">
            Рынок упаковки быстро меняется: усиливаются требования к безопасности, растёт конкуренция,
            появляются новые стандарты. <strong className="text-white">Работать поодиночке становится сложнее.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8 sm:mb-14">
          {BENEFITS.map((b, i) => (
            <div key={i} className={`glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 group reveal reveal-delay-${Math.min(i, 5)}`}>
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-accent-500/15 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4
                group-hover:bg-accent-500 group-hover:shadow-lg group-hover:shadow-accent-500/30 transition-all duration-300">
                <b.icon size={22} className="text-accent-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{b.title}</h3>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>

        {/* CTA блок */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto text-center reveal">
          <p className="text-white/70 mb-2 text-xs sm:text-sm">
            Членом объединения может стать юридическое лицо или ИП в сфере упаковочных материалов
          </p>
          <p className="text-white font-semibold text-base sm:text-xl mb-5 sm:mb-6">
            Оставьте заявку — и мы свяжемся с вами
          </p>
          <CtaButton onClick={onCtaClick} className="w-full sm:w-auto">
            <Send size={18} />
            Стать участником
          </CtaButton>
        </div>
      </div>
    </section>
  )
}

/* --- Для кого --- */
function ForWhom({ onCtaClick }) {
  return (
    <section id="forwho" className="py-14 sm:py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Для кого"
          title="Объединение создано для вас"
          subtitle="Объединяясь, участники получают больше возможностей, чем работая по отдельности"
        />

        {/* Мобильный: горизонтальные карточки, десктоп: центрированные */}
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
                <h3 className="font-bold text-slate-900 text-sm mb-0.5 sm:mb-1">{item.label}</h3>
                <p className="text-slate-400 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center reveal">
          <CtaButton variant="primary" onClick={onCtaClick} className="w-full sm:w-auto">
            <Send size={18} />
            Подать заявку на вступление
          </CtaButton>
        </div>
      </div>
    </section>
  )
}

/* --- Участники --- */
function Members() {
  return (
    <section className="py-14 sm:py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Участники"
          title="Кто входит в объединение"
          subtitle="Мы объединяем предприятия всей цепочки упаковочной индустрии"
        />
        <div className="flex flex-wrap justify-center gap-4">
          {MEMBER_TYPES.map((m, i) => (
            <div key={i} className={`flex items-center gap-3 sm:gap-4 bg-white rounded-xl p-4 sm:p-5
              border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-300
              w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] reveal reveal-delay-${Math.min(i, 5)}`}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary-500/10 rounded-lg flex items-center justify-center shrink-0">
                <m.icon size={20} className="text-primary-500" />
              </div>
              <span className="text-slate-700 font-medium text-sm">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- Загрузка данных из Google Таблицы --- */

// Проверяем что URL картинки безопасный (только https)
function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return ''
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return ''
    // Google Drive ссылки автоматически преобразуем в прямой формат
    if (parsed.hostname === 'drive.google.com') {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
      if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`
      return ''
    }
    return url
  } catch {}
  return ''
}

// Очищаем текстовые поля от HTML-тегов
function sanitizeText(val) {
  if (typeof val !== 'string') return String(val ?? '')
  return val.replace(/<[^>]*>/g, '')
}

function parseGoogleSheetsResponse(text) {
  // Ответ приходит в формате: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
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
      // Очищаем данные
      return {
        'Заголовок': sanitizeText(obj['Заголовок']),
        'Текст': sanitizeText(obj['Текст']),
        'Дата': sanitizeText(obj['Дата']),
        'Картинка': sanitizeImageUrl(obj['Картинка']),
      }
    })
    .filter(item => item['Заголовок'])
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 overlay-enter" />
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-scroll modal-enter"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          aria-label="Закрыть">
          <X size={18} />
        </button>
        {item['Картинка'] && (
          <div className="w-full max-h-[400px] overflow-hidden rounded-t-2xl">
            <img src={item['Картинка']} alt={item['Заголовок']} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          {item['Дата'] && (
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{item['Дата']}</p>
          )}
          <h2 className="font-bold text-slate-900 text-xl sm:text-2xl mb-4">{item['Заголовок']}</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">{item['Текст']}</p>
        </div>
      </div>
    </div>
  )
}

/* --- Новости --- */
function News() {
  const { news, loading } = useGoogleSheetNews()
  const [selected, setSelected] = useState(null)

  const placeholders = [
    { title: 'Скоро здесь появятся новости отрасли', text: 'Следите за обновлениями — мы будем публиковать актуальные новости' },
    { title: 'Отраслевая аналитика', text: 'Аналитические обзоры рынка упаковочных материалов Центральной Азии' },
    { title: 'Мероприятия и форумы', text: 'Анонсы предстоящих встреч, конференций и круглых столов' },
  ]

  // Если есть реальные новости — показываем их, иначе заглушки
  const hasNews = news.length > 0

  return (
    <section id="news" className="py-14 sm:py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Новости"
          title="Новости отрасли"
          subtitle="Следите за последними событиями упаковочной индустрии"
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="relative">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-news -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              {(hasNews ? news.slice(0, 20) : placeholders.map(n => ({ 'Заголовок': n.title, 'Текст': n.text, 'Дата': hasNews ? '' : 'Скоро', 'Картинка': '' }))).map((n, i) => (
                <div key={i} onClick={() => hasNews && setSelected(n)}
                  className={`min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] flex-shrink-0 snap-start
                  rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 bg-white
                  hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${hasNews ? 'cursor-pointer' : ''}`}>
                  {n['Картинка'] ? (
                    <div className="h-40 sm:h-48 overflow-hidden">
                      <img src={n['Картинка']} alt={n['Заголовок']}
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
                      {n['Заголовок']}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">{n['Текст']}</p>
                  </div>
                </div>
              ))}
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
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    const form = e.target
    const data = {
      access_key: WEB3FORMS_KEY,
      subject: 'Сообщение с сайта ЦАОПУМ',
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
      }
    } catch {}
    setSending(false)
  }

  return (
    <section id="contacts" className="py-14 sm:py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900" />
      <div className="absolute top-[-10%] right-[20%] w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Контакты"
          title="Свяжитесь с нами"
          light
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 max-w-5xl mx-auto">
          {/* Контактная информация */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 reveal">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">
              ТОО «Центрально-Азиатское объединение производителей упаковочных материалов»
            </h3>
            <div className="space-y-5">
              {[
                { icon: Mail, label: 'Электронная почта', value: 'info@caopum.kz', href: 'mailto:info@caopum.kz' },
                { icon: Phone, label: 'Телефон', value: '+7 (___) ___-__-__', href: 'tel:+77000000000' },
                { icon: MapPin, label: 'Адрес', value: 'г. ___' },
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
              <p className="text-white/50 text-sm mb-4">Хотите стать участником?</p>
              <button onClick={onCtaClick}
                className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 font-semibold text-sm transition-colors cursor-pointer">
                Подать заявку <ExternalLink size={16} />
              </button>
            </div>
          </div>

          {/* Форма */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 reveal reveal-delay-1">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">Напишите нам</h3>
            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-accent-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-accent-400" />
                </div>
                <p className="text-white font-semibold text-lg">Сообщение отправлено!</p>
                <p className="text-white/50 text-sm mt-2">Мы ответим в ближайшее время</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input type="text" name="name" required placeholder="Ваше имя"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30
                      focus:border-accent-500/50 focus:bg-white/8 outline-none transition-all duration-300" />
                </div>
                <div>
                  <input type="email" name="email" required placeholder="Email"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30
                      focus:border-accent-500/50 focus:bg-white/8 outline-none transition-all duration-300" />
                </div>
                <div>
                  <textarea name="message" required placeholder="Сообщение" rows="4"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30
                      focus:border-accent-500/50 focus:bg-white/8 outline-none transition-all duration-300 resize-none" />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3.5 rounded-xl
                    transition-all duration-300 shadow-lg shadow-accent-500/25 cursor-pointer flex items-center justify-center gap-2">
                  <Send size={18} />
                  Отправить сообщение
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
  return (
    <footer className="bg-slate-950 py-8 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-800/50">
          <img src={logoSvg} alt="ЦАОПУМ" className="h-8 sm:h-10 w-auto brightness-0 invert opacity-60" />
          <nav className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} className="text-slate-500 hover:text-white text-xs sm:text-sm transition-colors duration-300">
                {link.label}
              </a>
            ))}
          </nav>
          <button onClick={onCtaClick}
            className="px-5 py-2.5 bg-accent-500/10 text-accent-400 border border-accent-500/20 rounded-xl text-sm font-semibold
              hover:bg-accent-500 hover:text-white transition-all duration-300 cursor-pointer">
            Вступить
          </button>
        </div>
        <p className="text-slate-600 text-xs sm:text-sm text-center">
          &copy; {new Date().getFullYear()} ТОО «ЦАОПУМ». Все права защищены.
        </p>
      </div>
    </footer>
  )
}

/* --- Модальная форма заявки --- */
function ApplicationModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setSubmitted(false)
    setSubmitting(false)
    lockScroll()

    // Закрытие по Escape
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
    const data = {
      access_key: WEB3FORMS_KEY,
      subject: 'Заявка на вступление в ЦАОПУМ',
      'Компания': form.company.value,
      'Тип предприятия': form.type.value,
      'Контактное лицо': form.contact.value,
      'Должность': form.position.value || '—',
      'Телефон': form.phone.value,
      'Email': form.email.value,
      'Комментарий': form.comment.value || '—',
    }
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) setSubmitted(true)
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 pb-[env(safe-area-inset-bottom)]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm overlay-enter" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto modal-scroll modal-enter"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Закрыть"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-300 hover:text-slate-600 cursor-pointer transition-colors z-10">
          <X size={22} />
        </button>

        <div className="p-5 sm:p-7 md:p-9">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-accent-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={40} className="text-accent-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Заявка отправлена!</h3>
              <p className="text-slate-500 mb-6">Мы свяжемся с вами в ближайшее время для консультации.</p>
              <button onClick={onClose}
                className="px-8 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors cursor-pointer">
                Закрыть
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Заявка на вступление</h3>
                <p className="text-slate-500">Заполните форму — мы свяжемся с вами для консультации</p>
              </div>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Компания *</label>
                    <input type="text" name="company" required placeholder="ТОО «Ваша компания»"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Тип предприятия *</label>
                    <select name="type" required defaultValue=""
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm text-slate-700">
                      <option value="" disabled>Выберите...</option>
                      {MEMBER_TYPES.map((m, i) => (
                        <option key={i} value={m.label}>{m.label}</option>
                      ))}
                      <option value="other">Другое</option>
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Контактное лицо *</label>
                    <input type="text" name="contact" required placeholder="Имя и фамилия"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Должность</label>
                    <input type="text" name="position" placeholder="Директор"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Телефон *</label>
                    <input type="tel" name="phone" required placeholder="+7 (___) ___-__-__" pattern="[\d\s\+\-\(\)]{7,20}" title="Введите корректный номер телефона"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                    <input type="email" name="email" required placeholder="email@company.kz"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Комментарий</label>
                  <textarea name="comment" rows="3" placeholder="Дополнительная информация или вопросы"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all text-sm resize-none" />
                </div>
                <label className="flex items-start gap-3 cursor-pointer py-1">
                  <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500" />
                  <span className="text-xs text-slate-500 leading-relaxed">Даю согласие на обработку персональных данных</span>
                </label>
                <button type="submit"
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-4 rounded-xl
                    transition-all duration-300 shadow-lg shadow-accent-500/25 cursor-pointer flex items-center justify-center gap-2 mt-2">
                  <Send size={18} />
                  Отправить заявку
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
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 text-white rounded-full shadow-xl
        flex items-center justify-center hover:bg-primary-600 hover:shadow-2xl hover:-translate-y-0.5
        transition-all duration-300 cursor-pointer
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      aria-label="Наверх"
    >
      <ArrowUp size={20} />
    </button>
  )
}

/* --- Загрузочный экран --- */
function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('in') // in → show → out → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100)
    const t2 = setTimeout(() => setPhase('out'), 1800)
    const t3 = setTimeout(() => onFinish(), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700
      transition-opacity duration-700 ${phase === 'out' ? 'opacity-0' : 'opacity-100'}`}>
      {/* Фоновые блобы */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-400/10 rounded-full blur-3xl" />

      <div className={`flex flex-col items-center transition-all duration-1000 ease-out
        ${phase === 'in' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
        {/* Логотип с кольцом */}
        <div className="relative">
          <div className={`absolute inset-[-20px] rounded-full border-2 border-white/10 transition-all duration-1000 ease-out
            ${phase === 'show' || phase === 'out' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
          <div className={`absolute inset-[-40px] rounded-full border border-white/5 transition-all duration-1200 delay-200 ease-out
            ${phase === 'show' || phase === 'out' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
          <img src={logoSvg} alt="ЦАОПУМ" className="h-20 sm:h-28 w-auto splash-logo-glow" />
        </div>

        {/* Линия-индикатор */}
        <div className="mt-8 w-16 h-1 rounded-full overflow-hidden bg-white/10">
          <div className={`h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full transition-all ease-out
            ${phase === 'in' ? 'w-0' : 'w-full'}`}
            style={{ transitionDuration: '1600ms' }} />
        </div>
      </div>
    </div>
  )
}

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ ==================== */

export default function App() {
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const openModal = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => setModalOpen(false), [])
  const finishLoading = useCallback(() => setLoading(false), [])

  // Единый scroll-менеджер
  const { progress, scrolled, showScrollTop, activeSection } = useScrollManager()

  // Scroll-reveal (включает MutationObserver для динамического контента)
  useScrollReveal()

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {loading && <SplashScreen onFinish={finishLoading} />}
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
