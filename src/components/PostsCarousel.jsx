import { PROOF_POSTS } from '../lib/facts.js'

/* The ten approved posts as a wall of three columns that scroll vertically, in alternating directions and at slightly
   different speeds. Every card has the same size, the wall stays inside the page columns and fades to white at the top and
   bottom. Never links: the sources are production references only. Paused on hover; static with reduced motion. */
const COLS = [
  { posts: [0, 3, 6, 9], dir: 'up', time: 70 },
  { posts: [1, 4, 7], dir: 'down', time: 58 },
  { posts: [2, 5, 8], dir: 'up', time: 78 },
]

export default function PostsCarousel({ label }) {
  return (
    <div className="container posts__wrap" data-reveal="up">
      <div className="posts" role="region" aria-label={label}>
        {COLS.map((col, ci) => (
          <ul className={`posts__col posts__col--${col.dir}`} key={ci} style={{ '--t': `${col.time}s` }}>
            {[0, 1].map((copy) => (
              <li key={copy} className="posts__set" aria-hidden={copy ? 'true' : undefined}>
                <ul>
                  {col.posts.map((i) => {
                    const post = PROOF_POSTS[i]
                    return (
                      <li className="posts__card" key={post.file}>
                        <img src={`/proof/${post.file}.webp`} alt={copy ? '' : `Post on X by ${post.by}`} loading="lazy" draggable="false" />
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
