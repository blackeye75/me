# Folio — developer edition

A developer portfolio in plain HTML, CSS and JavaScript, with no build step.

On desktop the whole page is one horizontal story. Scrolling down moves a pinned strip of full-screen panels sideways. Halfway along, the strip pauses while a small rectangle between the words "The" and "Work" grows to fill the screen, then the journey continues. On phones the same panels stack vertically with the same reveals.

The layout and motion are modelled on [khanhnguyen.design](https://khanhnguyen.design/): chapters, the side rail that changes colour with each panel, line-by-line text reveals and the expanding "The Work" transition. The code, content and fonts here are original or openly licensed.

## Libraries

Loaded from CDNs in `index.html`, all free to use:

- [GSAP](https://gsap.com/) 3.13 with ScrollTrigger (pinning, scroll-linked timelines) and SplitText (line reveals)
- [Lenis](https://lenis.darkroom.engineering/) 1.3 for smooth scrolling (`lerp: 0.085`)

Fonts: Instrument Serif (display), Geist (body) and Geist Mono (labels and code), from Google Fonts.

If the libraries fail to load, the page falls back to a normal vertical layout with everything visible.

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

```
index.html            All page content, including the five case studies
assets/css/style.css  Palette, layout, panels, CSS-drawn project thumbnails, case studies
assets/js/main.js     Horizontal story, reveals, intro, hover effects, rail, menu, case studies
404.html              Standalone "page not found" page
assets/img/logo.webp  Logo (portrait head and Chapter V)
assets/video/         Work reel (WebM and MP4) and its poster frame
tools/reel/           Source and render script for the work reel
favicon.svg           PR monogram
robots.txt            Allows all crawlers
```

## Make it yours

Everything below is placeholder content. Search `index.html` for each item:

| What | Where |
| --- | --- |
| Name "Priyanshu Raj" and the "PR" monogram | `<title>`, meta tags, hero `<h1>`, rail, footer, `favicon.svg`, `404.html` |
| Tagline, intro, quote, hobbies | Hero and Chapter I |
| Years in the intro counter | `.hero-years-strip` (one `<span>` per year) |
| Location and time zone | `data-timezone="Asia/Kolkata"` on `<main>` (any [IANA time zone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)), plus the "GMT+5:30" and "India" labels |
| Availability | Hero "Open for collaborations" |
| Email | `mailto:` link and the `data-copy` value in the footer (currently priyanshuraj22275@gmail.com) |
| Social links | Menu and footer |
| Projects | Work list rows in Chapter II and the matching `<dialog class="case">` blocks at the end of `<body>` |
| Services | Chapter III (`.svc` articles) |
| Experience | Chapter IV (`.client` rows); each row's `.client-logo` holds the SVG shown on hover |
| Domain | `canonical`, `og:url` and `og:image` in `<head>` (these must be full `https://` URLs) |
| Portrait | `.about-portrait`: the logo sits in `.portrait-head`; the body shape is drawn in CSS. Replace the whole `.portrait-ph` with a photo if you prefer |
| Logo | `assets/img/logo.webp`, used in the portrait and Chapter V |

### Adding or changing a project

Each project has two parts that share an id (for example `kiln`):

1. **A row in the work list:** `<a class="work-link" href="#kiln" data-case="kiln">`, plus a matching `.work-img` preview in the same position inside `.work-preview`.
2. **A case study dialog:** `<dialog class="case" id="kiln">`, containing the problem, approach, key decisions, a code excerpt and outcome metrics.

Update the `NN / 05` counter and the "Next project" button (`data-open="…"`) in each dialog so the projects link in a loop. Links like `yoursite.com/#kiln` open that case study directly.

### The work reel

The video inside "The Work" window is `assets/video/work-reel.webm` with an `.mp4` fallback (12 seconds, under 400 KB each), and `work-reel-poster.jpg` as its still frame. It is drawn from `tools/reel/reel.html`: edit the `projects` list there, then run `node tools/reel/render.mjs` (needs Playwright and ffmpeg) to render a new one. You can also drop in any other video; it fills the window with `object-fit: cover`, so keep text away from the edges.

### Thumbnails

Project thumbnails are drawn with CSS (`.cover--dash`, `--term`, `--shop`, `--board`, `--search`), so they weigh nothing and stay sharp at any size. To use screenshots instead, replace the `<span class="cover …">` markup with an `<img>` that has real `alt` text and explicit `width` and `height`.

### Colours and type

Panel colours are tokens at the top of `style.css`. Each panel also carries `data-rail-bg`, `data-rail-fg` and `data-rail-line`, which the rail switches to when that panel is underneath it.

Sizes use `--s`, which is 1/144 of the viewport width on desktop and 1/39 on phones, so the composition scales with the screen.

## Motion reference

| Effect | Where | Timing |
| --- | --- | --- |
| Smooth scroll | Lenis | `lerp: 0.085`, `wheelMultiplier: 1.08` |
| Horizontal story | `main.js`, desktop `matchMedia` block | Pinned, scrubbed, linear. Pauses for one screen height at "The Work" |
| "The Work" window | Same timeline | A centred window (clip-path) opens from nothing to full screen; the words move with its edges |
| Line reveals | `revealLines()` | Lines rise from 102% below a mask, 1.7s, `power3.out`, 0.07s stagger |
| Portrait reveal | `revealImage()` | Colour block wipes in, image slides in 0.2s later, 0.7s, `power2.out` |
| Work hover | `showWork()` | Preview scales from 0, 0.45s, `power3.out`; other names fade to 25% |
| Service hover | Chapter III block | Background wipes up, 0.8s, `power3.out`; exits upwards |
| Darkroom (Chapter V) | Second hold in the story (1.6 screens) | Starts as a red-lit negative. Letters of DARKROOM rise and fall into place, ENGINEERING tightens from wide spacing, the logo turns like a gear while coming into focus, a timer counts to 01:30, then a circular aperture opens onto the print (f/22 to f/2.8) |
| Intro | Every load | First year rises (1.7s), years roll (2.85s) as a bar fills along the bottom, the year slides away (1.78s) and the name rises word by word (1.7s, 0.2s apart); the bar then grows into the hero background |
| Menu | Toggle in the rail | Panel wipes open left to right (0.88s, `power3.out`); links rise 0.15s apart; closes right to left |

Visitors who prefer reduced motion get plain sideways scrolling with no smoothing, no intro and no reveals.

## Deploy

Any static host works. For **GitHub Pages**: Settings → Pages → Deploy from a branch → select the branch and `/ (root)`. Netlify, Vercel and Cloudflare Pages also work with no build command and the repository root as the output directory.
