# kampta.github.io

Kamal Gupta's personal site — a hand-built, dependency-free **static
"agent-chat" single page**. Ask the agent about Kamal's research, latest
Optimus work, experience, and more. Live at <https://kampta.github.io>.

No framework, no build step. GitHub Pages serves it straight from `master`
(`.nojekyll` disables Jekyll).

## Structure

| Path | What |
|---|---|
| `index.html` | Shell, head/meta, chips, composer |
| `assets/style.css` | All styles (monospace, dark/light) |
| `assets/app.js` | All content **and** logic — edit copy here (`ANSWERS`, `PROJECTS`, `renderNews`, `renderTimeline`) |
| `images/`, `pubs/`, `asic/` | Project media, CV PDF, ASIC subsite |

## Develop

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

Edit content in `assets/app.js`. Deploy = commit + push to `master`
(redeploys in ~1 min).

## More

See [`CLAUDE.md`](./CLAUDE.md) for architecture, behavior notes, and how to
regenerate the generated assets (OG card, MP4s, thumbnails).

Previously a Jekyll blog; rebuilt static on 2026-05-16. The old source
(including the blog archive) remains in git history.
