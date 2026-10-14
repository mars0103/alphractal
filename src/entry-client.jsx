import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/albert-sans'
import '@fontsource-variable/inter'
import '@fontsource-variable/geist-mono'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/header.css'
import './styles/hero.css'
import './styles/sections.css'
import './styles/story.css'
import './styles/blocks.css'
import './styles/preview.css'
import './styles/pages.css'
import './styles/content.css'
import './styles/border-glow.css'
import './styles/footer.css'
import './styles/feature.css'
import './styles/mobile.css'
import App, { preloadRoute } from './App.jsx'
import { I18nProvider } from './i18n/I18nProvider.jsx'

const app = (
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
)

const root = document.getElementById('root')

// Prerendered routes ship real markup inside #root; hydrate it so React reuses that DOM
// instead of throwing it away. A route with no prerendered file (or the dev server, which
// serves an empty root) just mounts fresh.
if (root.hasChildNodes()) {
  // Load this route's chunk first so hydration meets real code, not a suspended boundary
  preloadRoute(window.location.pathname)
    .catch(() => {})
    .then(() => hydrateRoot(root, app))
} else {
  createRoot(root).render(app)
}

// Hide the splash (see index.html) two frames after mount, so the browser has actually
// painted the real page before it fades out — no flash of an empty or half-styled app.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.getElementById('splash')?.classList.add('is-done')
  })
})
