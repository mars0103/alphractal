/* Marks a spot where a real platform capture belongs and has not been delivered yet. Visible on purpose:
   it names the material to drop in, so nothing is invented in its place. Delete it when the image lands. */
export default function Placeholder({ name, note, ratio = '16 / 9', dark = false, className = '' }) {
  return (
    <div className={`placeholder ${dark ? 'placeholder--dark' : ''} ${className}`} style={{ aspectRatio: ratio }} role="img" aria-label={`Placeholder: ${name}`}>
      <span className="placeholder__tag">PLACEHOLDER</span>
      <strong>{name}</strong>
      {note && <em>{note}</em>}
    </div>
  )
}
