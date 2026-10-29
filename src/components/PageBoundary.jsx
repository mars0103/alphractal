import { Component } from 'react'

/* Keeps a crash inside one page from blanking the whole app: header and footer stay, and the page says what failed.
   Reset per route (App.jsx keys it by pathname). */
export default class PageBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[page crashed]', error, info && info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <section className="section" data-nav-theme="paper">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">Something went wrong</p>
            <h1 className="h2">This page failed to load.</h1>
            <p className="lede">Reload to try again. If it keeps happening, the message below helps us find the cause.</p>
            <p className="mono" style={{ fontSize: 13, color: 'var(--slate)', overflowWrap: 'anywhere' }}>
              {String((error && error.message) || error)}
            </p>
          </div>
        </div>
      </section>
    )
  }
}
