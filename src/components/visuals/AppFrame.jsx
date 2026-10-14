import BorderGlow from '../BorderGlow.jsx'

/*
 * The product window every feature demo lives in: same dark surface and browser chrome as the
 * home hero's panels (.hpanel__bar in hero.css), so a feature page reads as the same app.
 */
export default function AppFrame({ url, className = '', children }) {
  return (
    <BorderGlow className={`appframe ${className}`} backgroundColor="#03050d">
      <div className="hpanel__bar" aria-hidden="true">
        <span className="hpanel__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="hpanel__url mono">{url}</span>
        <span className="hpanel__live mono">
          <i />
        </span>
      </div>
      {children}
    </BorderGlow>
  )
}
