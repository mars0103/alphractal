# Alphractal — site institucional

React + GSAP (ScrollTrigger, SplitText, Flip, Draggable) + CSS puro. Sem Tailwind, sem Three.js.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/client: build normal + build SSR + prerender (SSG) de toda rota pública
npm run preview  # serve dist/client
```

## SSG (prerendering)

`npm run build` roda três passos: `vite build` (bundle do navegador), `vite build --ssr src/entry-server.jsx --outDir dist/server` (bundle Node só pra renderizar) e `scripts/prerender.mjs`, que chama `render(url)` pra cada rota pública (features, `/vs/*`, os 50 posts do blog etc.), grava `dist/client/<rota>/index.html` com o HTML real já dentro e apaga `dist/server` no final. `src/entry-client.jsx` faz `hydrateRoot` quando acha esse HTML pronto em `#root` (senão cai pra `createRoot`, caso do `npm run dev`, que continua 100% CSR/SPA como antes). `hooks/useMeta.js` não muda de assinatura: o mesmo `useMeta({...})` chamado em cada página agora também alimenta um `headState` que o `entry-server` lê depois do `renderToString`/`renderToPipeableStream`, pra cravar title/description/canonical/OG/robots/JSON-LD no HTML estático de cada rota. `vercel.json` aponta `outputDirectory` pra `dist/client` e liga `cleanUrls` (serve `<rota>/index.html` em `/rota` e devolve 404 real pra URL que não existe — antes disso as subrotas voltavam 404 pro crawler porque não havia deploy estático por rota).

Pendente: sitemap.xml/robots.txt (item abaixo) e decidir se o Terminal/Workbench interativo continua CSR-only (ver guia `Alphractal_Guia_Frontend_Landing_v2.pdf`).

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Home completa (hero do Figma + janela do produto + 9 seções) |
| `/platform` | Hub: 7 recursos, uma linha cada |
| `/platform/alpha-ai` · `metrics` · `mcp` · `api` · `dashboards` · `research` | Um template (`pages/Feature.jsx`), seis instâncias |
| `/terminal` | Teaser + lista de espera. Sem tela, sem motion de hype, disclaimer literal |
| `/institutional` | Entender / Operacionalizar / Construir, níveis da API, SLA e conformidade |
| `/about` | História, timeline por scroll, time (galeria), pesquisa, carreiras |
| `/pricing` | O que cada plano inclui. Nenhum preço de plano pago fixo |
| `/vs/glassnode` · `nansen` · `coinglass` · `messari` | Matriz honesta, migração, FAQ |
| `/privacy` · `/terms` | Texto migrado palavra por palavra do site atual, com índice lateral |
| `/blog` · `/blog/:slug` | 50 artigos migrados do site atual (busca, filtro por tag com Flip, progresso de leitura, JSON-LD por artigo) |
| `/start` | LP de tráfego pago (noindex): ainda não feita |

## Estrutura

```
src/
  entry-client.jsx         monta no navegador (hydrateRoot se achar HTML pré-renderizado, senão createRoot)
  entry-server.jsx         renderiza uma rota pro prerender (Node); exporta render(url)
  lib/facts.js            números (brief §7.1) e links. Tudo que é suposição está marcado
  i18n/                   en.js + pt.js (home) e pages.en.js + pages.pt.js (demais páginas)
  hooks/useReveals.js     entradas declarativas: data-reveal / data-stagger
  components/             Header, Footer, GradientWaves, HeroGrid, PageShell, PageHero,
                          PageBlocks (Problem, Steps, Gains, ProofBand, Related), MiniViz,
                          CitationChat, Accordion, CountUp
  components/visuals/     HeroVisuals (demo de cada página) e Extras (seções próprias)
  sections/               seções da home (AppPreview = janela do produto com 7 abas, logo abaixo do hero)
  components/preview/     Icon (ícones de linha) e Panels (as 7 telas da janela); dados de exemplo em lib/preview-data.js
  pages/                  uma por rota
  styles/                 tokens → base → layout → header → hero → sections → story → blocks → pages
src/content/              legal.json e blog.json (gerados por scripts/migrate-content.mjs)
scripts/                  migrate-content.mjs (reexecutável), wire-meta.py (uso único), prerender.mjs (roda no build)
public/figma/             assets exportados do Figma (nó 1:2)
public/team/team.jpg      (opcional) foto do time: se existir, a galeria do About passa a usá-la inteira
```

## Motion (tudo GSAP)

- **Hero:** gradiente SVG do Figma em deriva + parallax + inclinação com o cursor, malha de pontos reativa, demo da IA em loop, luz percorrendo as bordas.
- **Janela do produto (AppPreview):** 7 abas que trocam sozinhas a cada 5s com linha de progresso. Pausa no hover, no foco, fora da tela e com a aba oculta; clique e setas do teclado funcionam. Cada tela entra com stagger, barras crescem, sparklines e o gauge se desenham. Sem motion não rotaciona e a barra some.
- **Home:** consolidação (5 janelas → 1) e como funciona (gráfico se desenhando), ambas pinadas por scroll; cards com spotlight; IA com citação.
- **Páginas:** mesa de painéis **arrastável** (Draggable, troca de posição), mosaico macro de 46 painéis e ranking de screener que se reordenam com **Flip**, catálogo MCP, escada de taxa da API, regra de alerta composta, relatório com gráfico ao vivo, timeline por scroll.
- `prefers-reduced-motion`: nenhuma animação roda e todo o conteúdo fica visível. Abaixo de 992px os trechos pinados viram scrub sem pin.

## Pendências de conteúdo (⚠ VERIFICAR)

- `facts.js`: 1.500+ métricas (categorias somam ~1.013, por isso a contagem por categoria não aparece) e 23 vs 28/29 modelos.
- `facts.js → LINKS / CONTACT`: docs, vendas, lista de espera, carreiras, X, Telegram e LinkedIn são **suposições**. `hello@alphractal.com` é um placeholder.
- `pages.en.js → vs.pages`: usa só o que o brief e o doc de features afirmam. Coinglass e Messari precisam ser conferidos com `comparisonLandings.ts`.
- About: datas dos marcos (só 2023 é certo), hobbies dos 5 (vazio até coletar), foto do time, Gustavo França (entra?), grafia "Luan Silveira" e o cargo do Rafael (brief: Research Lead; doc de features: Chief Research Officer).
- Trial de 3 dias do Pro: a copy não afirma se pede cartão.
- Prova: posts reais do X e logo cloud rotulada seguem pendentes de curadoria.
- **SEO:** cada página define o próprio `<title>`, descrição, canonical e JSON-LD (`hooks/useMeta.js`); desde a migração pra SSG (ver seção acima) isso já vai cravado no HTML de cada rota, sem depender de JS. Falta ainda: `sitemap.xml` + `robots.txt`, e os redirects do site antigo.
- **Blog:** o texto dos posts foi copiado como está (em inglês). Imagens e gráficos embutidos, se existirem no site antigo, não foram migrados. Os posts mostram "Apenas educacional" no final, como no original.
- **Legal:** o texto vale só em inglês. Os e-mails reais são privacy@alphractal.com e legal@alphractal.com. O termo de teste grátis diz que a conta vira paga no fim do trial, o que sugere que o trial exige cartão: confirme antes de a copy dizer o contrário.
- **Janela do produto:** o wireframe 1a pede uma "captura do produto, ao vivo, não simulada". O que está lá é uma interface ilustrativa com dados de exemplo (`lib/preview-data.js`, rotulada na tela como "não ao vivo"). Troque por captura real ou dados vivos antes de lançar; se mantiver ilustrativa, os textos de Research/Alerts em `i18n/*.js → preview` são inventados. Os planos citados (Free, Pro, Max) vêm de `pages.en.js`; o selo NEW da sidebar copia o app atual.
