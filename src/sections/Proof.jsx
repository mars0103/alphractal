import { useI18n } from '../i18n/I18nProvider.jsx'
import PostsStack from '../components/PostsStack.jsx'

/* Social proof: a black band with the approved sentence and the ten approved posts. Nothing else (no label, quotes or survey
   bars). The posts are never links. The stack itself lives in components/PostsStack.jsx so the About page uses the same block. */
export default function Proof() {
  const { t } = useI18n()
  const p = t.proof
  return (
    <div id="proof">
      <PostsStack phrase={p.phrase} label={p.postsLabel} />
    </div>
  )
}
