import PostsStack from './PostsStack.jsx'

/* Kept so existing imports keep working: the wall of scrolling posts was replaced by the stacked cards (PostsStack). */
export default function PostsCarousel({ label, phrase }) {
  return <PostsStack label={label} phrase={phrase} />
}
