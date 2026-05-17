# CLAUDE.md

Operational notes for working on this repo with Claude Code. Public repo —
keep this file to architecture/build notes only, nothing private.

## What this is

`kampta.github.io` — Kamal Gupta's personal site, a hand-built **static
"agent-chat" single page**. No framework, no build step, no dependencies.
Served by GitHub Pages straight from `master` (`.nojekyll` disables Jekyll).

Files that *are* the site:

- `index.html` — shell, `<head>` (meta/OG/JSON-LD), chips, composer
- `assets/style.css` — all styles (CSS variables; dark default + light)
- `assets/app.js` — all content **and** logic (no separate data files)
- `404.html` + `assets/404.js` (its only script — kept external on purpose)
- `.nojekyll`, `favicon.ico`, `robots.txt`, empty `CNAME`
- `assets/` images: `og.png`, `avatar.jpg`, `optimus-*.jpg`
- `images/` project teasers + generated `*.mp4`/`*.jpg` posters
- `pubs/kamal_gupta_cv.pdf` — **content source of truth** for bio/roles/pubs
- `asic/` — standalone ASIC project subsite, linked from research

## Where content is edited (all in `assets/app.js`)

- `ANSWERS` — every reply: `about` (the merged landing: bio → renderNews),
  `research`, `experience`, `contact`, `cv`, `meta`, `hello`, `fallback`.
  `ANSWERS.news` is an alias of `ANSWERS.about` (news is merged in).
- `PROJECTS[]` — research cards (title, venue, desc, authors, media,
  optional `video`, web/paper/code links). `K. Gupta` is auto-bolded.
- `renderNews()` — inline `optimus[]` (videos) + `milestones[]`.
- `renderTimeline()` — the experience `rows`.
- Copy uses tiny markdown: `**bold**`, `*italic*`, `[text](url)`. Do **not**
  wrap links in `**…**`; the tokenizer handles it but plain links are the
  convention. Text streams one **sentence** at a time.

## Behavior notes

- Routing: `ROUTES` = research/about/experience/contact/cv/meta. `news` is
  NOT a route (merged into about) — keep it that way or `#news` double-renders.
  Deep links: `/#research` etc. Boot auto-asks `about`.
- Scroll: each new question is pinned ~16px from the top; never auto-jump to
  the bottom of a long reply. Auto-anchor stops once the user scrolls.
- `classify()` maps free-text → intent by keywords.
- **Security/CSP**: both pages ship a strict `Content-Security-Policy` meta
  (`script-src 'self'`, `style-src 'self'`, no `unsafe-inline`). So: **no
  inline `<script>`/`<style>` or `style=`/`innerHTML`** — build DOM nodes,
  put CSS in `style.css`, JS in `assets/*.js`. (Inline JSON-LD is fine; CSP
  doesn't gate `application/ld+json`.) Third-party media is self-hosted
  (`optimus-*.jpg`); only the click-to-load `youtube-nocookie` iframe is
  remote (allowed via `frame-src`). External links use `noopener noreferrer`.
- **Composer input is currently disabled**: the free-text `<form>` is
  commented out in `index.html` (chips-only nav). The JS is guarded
  (`if (form)`) and `classify()` is kept, so restoring = un-comment that
  `<form>` block; no JS change needed.
- **Accent color** is the CSS var `--accent` / `--accent-soft` / `--accent-2`
  in `assets/style.css` (per `[data-theme]`). Current: emerald `#45d68b`
  dark / `#0f9d58` light. The OG card **bakes the accent in** — if you change
  it, regenerate `assets/og.png` (the temp `_og.html` must use the new hex).

## Regenerating assets (requires: ffmpeg, yt-dlp, poppler, Google Chrome)

Read the CV: `pdftotext -layout pubs/kamal_gupta_cv.pdf -`

Avatar from a square headshot:
`sips -s format jpeg -s formatOptions 82 -Z 256 SRC.jpg --out assets/avatar.jpg`

gif → mp4 + poster (then point the project's `media` at the `.jpg`, add `video`):
```
ffmpeg -y -i IN.gif -movflags +faststart -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -an -crf 30 OUT.mp4
ffmpeg -y -i IN.gif -frames:v 1 OUT.jpg
```

X / Twitter video thumbnail:
```
yt-dlp --skip-download --write-thumbnail --convert-thumbnails jpg -o /tmp/t.%(ext)s "<x-url>"
sips -s format jpeg -s formatOptions 80 -Z 720 /tmp/t.jpg --out assets/optimus-YYYY.jpg
```

OG social card (`assets/og.png`, 1200×630): write a temp `assets/_og.html`
styled like the site (font `/System/Library/Fonts/SFNSMono.ttf`) plus a temp
`assets/_ogphoto.jpg`, then:
```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --screenshot=assets/og.png "file://$PWD/assets/_og.html"
rm assets/_og.html assets/_ogphoto.jpg
```
ffmpeg here lacks `drawtext`, so Chrome is the text-rendering path.

## Run & deploy

- Local: `python3 -m http.server 8000` → http://localhost:8000
- Verify visually with headless Chrome `--screenshot` (use
  `--virtual-time-budget=9000` so streaming/thumbnails settle).
- Deploy: commit + push to `master`. Pages redeploys in ~1 min →
  https://kampta.github.io

## History

The site was Jekyll until 2026-05-16, then rebuilt static. **All old Jekyll
source (≈23 blog posts 2011–2023, `_layouts`, `_config.yml`, …) was
deliberately deleted.** Do not recreate it. It lives in git history — recover
with e.g. `git checkout d70febe -- _posts`.
