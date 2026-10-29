import { useParams } from 'react-router-dom'
import Soon from './Soon.jsx'
import Metrics from './product/Metrics.jsx'
import Api from './product/Api.jsx'
import Research from './product/Research.jsx'
import AlphaAi from './product/AlphaAi.jsx'
import Mcp from './product/Mcp.jsx'
import Dashboards from './product/Dashboards.jsx'

// One file per product page (pages/product/*). The old shared template is archived in site/_archive.
const PAGES = { metrics: Metrics, api: Api, research: Research, 'alpha-ai': AlphaAi, mcp: Mcp, dashboards: Dashboards }

export default function Feature() {
  const { slug } = useParams()
  const Page = PAGES[slug]
  return Page ? <Page /> : <Soon />
}
