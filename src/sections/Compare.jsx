import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'

/* Honest matrix (brief §5.1 sec. 6): the competitor's strength is stated first, in writing. */
export default function Compare() {
  const { t } = useI18n()
  const c = t.compare

  return (
    <section className="section cmp" data-nav-theme="paper" id="compare">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="container">
        <div className="cmp__head">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {c.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {c.title}
            </h2>
          </div>
          <p className="lede" data-reveal="up" data-delay="0.15">
            {c.body}
          </p>
        </div>

        <div className="cmp__wrap" data-reveal="up">
          <span className="ring ring--soft" aria-hidden="true" />
          <table className="cmp__t">
            <thead>
              <tr>
                <th scope="col" className="mono">
                  {c.cols.tool}
                </th>
                <th scope="col" className="mono">
                  {c.cols.theyWin}
                </th>
                <th scope="col" className="mono cmp__we">
                  {c.cols.weWin}
                </th>
                <th scope="col" className="sr-only">
                  {c.cols.link}
                </th>
              </tr>
            </thead>
            <tbody data-stagger>
              {c.rows.map((r) => (
                <tr key={r.key} data-item>
                  <th scope="row">
                    <Link to={r.to} className="cmp__name">
                      <span className="cmp__vs mono">vs</span>
                      {r.name}
                    </Link>
                  </th>
                  <td>
                    <span className="cmp__lab mono">{c.cols.theyWin}</span>
                    {r.they}
                  </td>
                  <td className="cmp__we">
                    <span className="cmp__lab mono">{c.cols.weWin}</span>
                    <span>{r.we}</span>
                  </td>
                  <td className="cmp__go">
                    <Link to={r.to} aria-label={`${c.cols.link}: ${r.name}`}>
                      →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
