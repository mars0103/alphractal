import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { LINKS } from '../lib/facts.js'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap.js'
import GlowButton from './GlowButton.jsx'

function LangSwitch({ className = '' }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div className={`lang ${className}`} role="group" aria-label={t.lang.label}>
      {['en', 'pt'].map((code) => (
        <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
          {t.lang[code]}
        </button>
      ))}
    </div>
  )
}

export default function Header() {
  const { t, lang } = useI18n()
  const { pathname } = useLocation()
  const root = useRef(null)
  const megaRef = useRef(null)
  const drawerRef = useRef(null)
  const closeTimer = useRef(null)
  const [open, setOpen] = useState(false)
  const [drawer, setDrawer] = useState(false)

  /* Scroll state + theme flip when the header passes over a dark / paper section */
  useGSAP(
    () => {
      const header = root.current
      const stuck = ScrollTrigger.create({
        start: 24,
        end: 'max',
        onToggle: (self) => header.classList.toggle('is-stuck', self.isActive),
      })
      // Theme = whichever [data-nav-theme] section is under the header line. Measured from the live layout,
      // so pin spacers never throw it off.
      const sections = Array.from(document.querySelectorAll('[data-nav-theme]'))
      const check = () => {
        const line = 62
        let theme = header.dataset.theme
        for (const el of sections) {
          const r = el.getBoundingClientRect()
          if (r.top <= line && r.bottom > line) theme = el.dataset.navTheme
        }
        if (theme !== header.dataset.theme) header.dataset.theme = theme
      }
      const watcher = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: check, onRefresh: check })
      check()
      return () => {
        stuck.kill()
        watcher.kill()
      }
    },
    { dependencies: [pathname, lang], scope: root, revertOnUpdate: true },
  )

  /* Entrance */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from(root.current, { yPercent: -40, autoAlpha: 0, duration: 1.1, delay: 0.15, ease: 'power4.out' })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  /* Mega menu open / close */
  useEffect(() => {
    const panel = megaRef.current
    if (!panel) return
    const reduce = window.matchMedia(MQ.reduced).matches
    if (open) {
      gsap.killTweensOf(panel)
      gsap.set(panel, { visibility: 'visible' })
      gsap.to(panel, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.4, ease: 'power3.out' })
      if (!reduce) {
        gsap.fromTo(
          panel.querySelectorAll('.mega__item, .mega__foot'),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.04, delay: 0.05, overwrite: true },
        )
      }
    } else {
      gsap.to(panel, { autoAlpha: 0, y: -6, duration: reduce ? 0 : 0.25, ease: 'power2.in' })
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onDown = (e) => !root.current?.querySelector('.nav__item--menu')?.contains(e.target) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
    setDrawer(false)
  }, [pathname, lang])

  /* Mobile drawer */
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    if (drawer && drawerRef.current && !window.matchMedia(MQ.reduced).matches) {
      gsap.fromTo(
        drawerRef.current.querySelectorAll('.drawer__link, .drawer__sub, .drawer__actions'),
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' },
      )
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawer])

  const hoverOpen = () => {
    if (!window.matchMedia(MQ.desktop).matches) return
    clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const hoverClose = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 140)
  }

  const pm = t.nav.platformMenu

  return (
    <>
      <header ref={root} className="site-header" data-theme="dark">
        <div className="bar">
          <span className="bar__frame" aria-hidden="true" />
          <Link to="/" className="brand" aria-label="Alphractal">
            <img src="/figma/logo-mark.svg" alt="" width="27" height="25" />
            <span>Alphractal</span>
          </Link>

          <nav className="nav" aria-label="Main">
            <div className="nav__item nav__item--menu" onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
              <button
                type="button"
                className="nav__link"
                aria-expanded={open}
                aria-haspopup="true"
                aria-controls="platform-menu"
                onClick={() => setOpen((v) => !v)}
              >
                {t.nav.platform}
                <img className="nav__chev" src="/figma/chevron.svg" alt="" width="7" height="4.5" />
              </button>
              <div id="platform-menu" ref={megaRef} className="mega" role="region" aria-label={pm.label}>
                <div className="mega__grid">
                  {pm.items.map((item) => (
                    <Link key={item.to} to={item.to} className="mega__item">
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </Link>
                  ))}
                </div>
                <div className="mega__foot">
                  <Link to={pm.terminal.to} className="link-arrow">
                    {pm.terminal.title} <span>→</span>
                  </Link>
                  <Link to="/platform" className="link-arrow">
                    {pm.hub} <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="nav__item">
              <NavLink to="/institutional" className="nav__link">
                {t.nav.institutional}
              </NavLink>
            </div>
            <div className="nav__item">
              <NavLink to="/pricing" className="nav__link">
                {t.nav.pricing}
              </NavLink>
            </div>
            <div className="nav__item">
              <NavLink to="/about" className="nav__link">
                {t.nav.about}
              </NavLink>
            </div>
          </nav>

          <span />

          <div className="bar__actions">
            <LangSwitch className="lang--bar" />
            <a className="login" href={LINKS.login}>
              {t.nav.login}
            </a>
            <GlowButton className="bar__cta" href={LINKS.start}>
              {t.nav.start}
            </GlowButton>
            <button
              type="button"
              className="burger"
              aria-expanded={drawer}
              aria-controls="drawer"
              aria-label={drawer ? t.nav.close : t.nav.menu}
              onClick={() => setDrawer((v) => !v)}
            >
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>

      <div id="drawer" ref={drawerRef} className={`drawer ${drawer ? 'is-open' : ''}`}>
        <Link to="/platform" className="drawer__link">
          {t.nav.platform}
        </Link>
        <div className="drawer__sub">
          {pm.items.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.title}
            </Link>
          ))}
          <Link to={pm.terminal.to}>{pm.terminal.title}</Link>
        </div>
        <Link to="/institutional" className="drawer__link">
          {t.nav.institutional}
        </Link>
        <Link to="/pricing" className="drawer__link">
          {t.nav.pricing}
        </Link>
        <Link to="/about" className="drawer__link">
          {t.nav.about}
        </Link>
        <div className="drawer__actions">
          <GlowButton href={LINKS.start}>{t.nav.start}</GlowButton>
          <a className="login" href={LINKS.login}>
            {t.nav.login}
          </a>
          <LangSwitch />
        </div>
      </div>
    </>
  )
}
