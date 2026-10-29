/* A ruled section opener. `rule={false}` drops the hairline when a page wants a different rhythm.
   (The older Problem / StepsStory / Gains / Related blocks were archived with the legacy feature template, see site/_archive.) */
export function Section({ id, dark = false, theme, rule = true, children, className = '' }) {
  return (
    <section
      id={id}
      className={`section ${dark ? 'section--dark' : ''} ${className}`}
      data-nav-theme={theme || (dark ? 'dark' : 'paper')}
    >
      {rule && (
        <div className="hrule">
          <i data-reveal="rule" />
        </div>
      )}
      {children}
    </section>
  )
}
