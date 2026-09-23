# Folio — developer edition

A one-page developer portfolio in plain HTML, CSS and JavaScript. No framework, no build step and no dependencies apart from Google Fonts.

The editorial structure (chapters, oversized type, numbered menu, loading intro, live clock and hover-preview work list) is inspired by [khanhnguyen.design](https://khanhnguyen.design/). All code and content here are original.

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

```
index.html            All page content, including the five case studies
assets/css/style.css  Design tokens, layout, components and CSS-drawn project thumbnails
assets/js/main.js     Intro, menu, theme toggle, clock, hover previews, case studies, copy email
404.html              Standalone "page not found" page
favicon.svg           JH monogram
robots.txt            Allows all crawlers
```

## Make it yours

Everything below is placeholder content. Search `index.html` for each item:

| What | Where |
| --- | --- |
| Name "Jordan Hale" and the "JH" monogram | `<title>`, meta tags, hero `<h1>`, header, footer, `favicon.svg`, `404.html` |
| Tagline, intro, quote, hobbies | Hero and Chapter I |
| Location and time zone | `data-timezone="Asia/Singapore"` on `<main>` (any [IANA time zone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)), plus the "GMT+8" and "Singapore" labels |
| Availability | Hero "Status" and the footer "Availability" block |
| Email | `mailto:` link and the `data-copy` value in the footer |
| Social links | Menu "Elsewhere" and footer "Social" |
| Projects | Work list rows in Chapter II and the matching `<dialog class="case">` blocks at the end of `<body>` |
| Services, toolbox, experience | Chapters III, IV and V |
| Domain | `canonical`, `og:url` and `og:image` in `<head>` (these must be full `https://` URLs) |
| Portrait | Replace the `.portrait-frame` placeholder with `<img src="…" alt="Portrait of …" width="…" height="…">` |

### Adding or changing a project

Each project has two parts that share an id (for example `kiln`):

1. **A row in the work list:** `<a class="work-link" href="#kiln" data-case="kiln">`.
2. **A case study dialog:** `<dialog class="case" id="kiln">`, containing the problem, approach, key decisions, a code excerpt and outcome metrics.

Update the `NN / 05` counter and the "Next project" button (`data-open="…"`) in each dialog so the projects link in a loop. Links like `yoursite.com/#kiln` open that case study directly.

### Thumbnails

Project thumbnails are drawn with CSS (`.cover--dash`, `--term`, `--shop`, `--board`, `--search`), so they weigh nothing and stay sharp at any size. To use screenshots instead, replace the `<span class="cover …">` markup with an `<img>` that has real `alt` text and explicit `width` and `height`.

### Colours and fonts

All colours are tokens at the top of `style.css`, with a light palette and a dark palette. The fonts are Archivo (display, using its width axis), IBM Plex Sans (body) and IBM Plex Mono (labels and code).

## Behaviour notes

- The intro plays once per visit and is skipped when the visitor prefers reduced motion.
- Theme follows the system setting. The menu has a System / Light / Dark toggle, which is saved in `localStorage`.
- Scroll reveals use CSS scroll-driven animations. Browsers without support show everything immediately.
- Tablets work in both orientations. There is no "rotate your screen" lock.
- The menu and case studies close with Escape, trap focus while open, and return focus to where you were.

## Deploy

Any static host works. For **GitHub Pages**: Settings → Pages → Deploy from a branch → select the branch and `/ (root)`. Netlify, Vercel and Cloudflare Pages also work with no build command and the repository root as the output directory.
