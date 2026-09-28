/* Black button with a blue glow and a light that travels the border. See .btn--glow and .ring in base.css */
export default function GlowButton({ href, children, className = '', as: Tag = 'a', ...rest }) {
  return (
    <Tag href={href} className={`btn btn--glow ${className}`} {...rest}>
      <span className="ring" aria-hidden="true" />
      <span>{children}</span>
    </Tag>
  )
}
