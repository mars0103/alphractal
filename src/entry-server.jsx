import { StrictMode } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { Writable } from 'node:stream'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
import { I18nProvider } from './i18n/I18nProvider.jsx'
import { headState } from './hooks/useMeta.js'

// One call = one route. Every route but Home is React.lazy()-loaded (App.jsx keeps that
// for the client bundle's code-splitting), so we need onAllReady — renderToString would
// just emit the Suspense fallback (null) for every one of those pages.
export async function render(url) {
  headState.current = null

  const html = await new Promise((resolve, reject) => {
    let out = ''
    const writable = new Writable({
      write(chunk, _enc, cb) {
        out += chunk
        cb()
      },
    })
    writable.on('finish', () => resolve(out))
    writable.on('error', reject)

    const { pipe } = renderToPipeableStream(
      <StrictMode>
        <StaticRouter location={url}>
          <I18nProvider>
            <App />
          </I18nProvider>
        </StaticRouter>
      </StrictMode>,
      {
        onAllReady() {
          pipe(writable)
        },
        onShellError: reject,
        onError: reject,
      },
    )
  })

  return { html, head: headState.current }
}
