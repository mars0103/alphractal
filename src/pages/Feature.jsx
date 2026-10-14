import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import PageShell from '../components/PageShell.jsx'
import PageHero from '../components/PageHero.jsx'
import GlowButton from '../components/GlowButton.jsx'
import { Gains, ProofBand, Problem, Related, Section, StepsStory } from '../components/PageBlocks.jsx'
import ResearchApp from '../components/visuals/ResearchApp.jsx'
import { AlphaAiViz, DomainsViz, McpViz, RateViz, Workbench } from '../components/visuals/HeroVisuals.jsx'
import {
  Academy,
  AlertsSection,
  ApiTiers,
  MacroSection,
  ModelsSection,
  ScreenersSection,
  ToolCatalog,
} from '../components/visuals/Extras.jsx'
import FinalCta from '../sections/FinalCta.jsx'
import McpHero from '../components/McpHero.jsx'
import Soon from './Soon.jsx'

// Recreated demos, not screenshots — a static capture can't show the interaction the copy is
// actually selling (a citation you click to open its chart, a panel you drag and resize), and
// it freezes the moment the real product's UI next changes. Built to match app.alphractal.com
// (four domains → Metrics, a citation-driven answer → Alpha AI, a draggable workbench →
// Dashboards, a live-updating report → Research), not as generic placeholder charts.
const HERO_VIZ = {
  'alpha-ai': AlphaAiViz,
  metrics: DomainsViz,
  mcp: McpViz,
  api: RateViz,
  dashboards: Workbench,
  research: ResearchApp,
}

const KINDS = {
  'alpha-ai': ['stream', 'progress', 'dock', 'wave'],
  metrics: ['screen', 'axis', 'defs'],
  mcp: ['url', 'ask', 'lock'],
  api: ['bars', 'credits', 'file'],
  dashboards: ['grid', 'builder', 'link'],
  research: ['livechart', 'wave', 'versions'],
}

const PRIMARY_HREF = { api: LINKS.docs }

/* The six sibling feature pages as a pill rail, current one lit — same idea as the home hero's stepper */
function Rail({ current, rows }) {
  return (
    <ul className="phero__rail" aria-label="Platform">
      {rows.map((r, i) => (
        <li key={r.key}>
          <Link to={r.to} className={r.key === current ? 'is-on' : ''} aria-current={r.key === current ? 'page' : undefined}>
            <b className="mono">{String(i + 1).padStart(2, '0')}</b> {r.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/* Six domains as a ruled grid (metrics page) */
function Domains({ data }) {
  return (
    <Section id="domains">
      <div className="container">
        <div className="section__head">
          <h2 className="h2" data-reveal="lines">
            {data.title}
          </h2>
        </div>
        <ul className="domains" data-stagger>
          {data.items.map((d, i) => (
            <li className="domain" data-item key={d.name}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <h3>{d.name}</h3>
              <p>{d.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

export default function Feature() {
  const { slug } = useParams()
  const { t } = useI18n()
  const c = t.pages.common
  const f = t.pages.features[slug]
  const row = t.pages.hub.rows.find((r) => r.key === slug)
  useMeta({ title: `${row ? row.title : slug} · Alphractal`, description: f?.hero.sub })
  if (!f) return <Soon />

  const Viz = HERO_VIZ[slug]
  const heroNote = slug === 'alpha-ai' ? c.disclaimer : null

  const actions = (
    <>
      <GlowButton href={PRIMARY_HREF[slug] || LINKS.start}>{f.hero.primary}</GlowButton>
      <a className="link-arrow phero__more" href={f.hero.secondaryHref}>
        {f.hero.secondary} <span>→</span>
      </a>
    </>
  )
  const rail = <Rail current={slug} rows={t.pages.hub.rows.filter((r) => HERO_VIZ[r.key])} />

  return (
    <PageShell>
      {slug === 'mcp' ? (
        <McpHero
          eyebrow={f.hero.eyebrow}
          title={f.hero.title}
          sub={f.hero.sub}
          actions={actions}
          note={heroNote}
          rail={rail}
          stage={f.stage}
        />
      ) : (
        <PageHero eyebrow={f.hero.eyebrow} title={f.hero.title} sub={f.hero.sub} visual={<Viz />} note={heroNote} rail={rail} actions={actions} centered />
      )}

      <Problem eyebrow={c.problem} title={f.problem.title} text={f.problem.text} />
      <StepsStory eyebrow={c.how} title={f.how.title} steps={f.how.steps} kinds={KINDS[slug]} url={`app.alphractal.com/${slug}`} />

      {slug === 'metrics' && (
        <>
          <Domains data={f.domains} />
          <ModelsSection />
          <MacroSection />
        </>
      )}
      {slug === 'mcp' && <ToolCatalog />}
      {slug === 'api' && <ApiTiers />}
      {slug === 'dashboards' && (
        <>
          <AlertsSection />
          <ScreenersSection />
        </>
      )}
      {slug === 'research' && <Academy />}

      <Gains eyebrow={c.gains} title={f.gains.title} items={f.gains.items} />
      <ProofBand eyebrow={c.proof} {...f.proof} legal={f.legal} />
      <Related keys={f.related} eyebrow={c.keepGoing} title={c.keepGoingTitle} />
      <FinalCta title={c.ctaTitle} sub={c.ctaSub} primary={c.startFree} secondary={c.seePlatform} />
    </PageShell>
  )
}
