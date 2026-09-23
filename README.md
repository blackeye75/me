# Priyanshu Raj — portfolio

A horizontal-scroll developer portfolio built with **Next.js 16** (App Router), **React 19** and **TypeScript**.

On desktop the page is one horizontal story. Scrolling moves a pinned strip of full-screen panels sideways. The strip holds still twice: once while a window between "The" and "Work" opens onto the work reel, and once for the darkroom in Chapter V. On phones the same panels stack vertically with the same reveals.

The layout and motion are modelled on [khanhnguyen.design](https://khanhnguyen.design/). The code, content and fonts here are original or openly licensed.

## Getting started

Requires Node.js 20.9 or later.

```sh
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (the page is prerendered as static HTML) |
| `npm run start` | Serves the production build |
| `npm run lint` | ESLint (Next.js core web vitals and TypeScript rules) |
| `npm run typecheck` | TypeScript, no emit |

## How it's organised

```
src/
  app/                 Routes: layout (fonts, metadata, boot script), page, 404, icon, robots, sitemap
  content/             All site content, typed. Edit these files to change what the site says
  lib/content.ts       getContent(): the one place pages read content from (the CMS seam)
  components/          One folder per component, each with its own CSS Module
    story/             The pinned strip and the Panel wrapper every section uses
    rail/  menu/       Navigation rail and full-screen menu
    hero/ about/ the-work/ work/ services/ experience/ darkroom/ footer/
    case-study/        Full-screen case study dialogs and the code block
    cover/             CSS-drawn project thumbnails
    copy-email/        The only interactive React component (client)
    motion/            <Motion />: starts the motion layer after hydration
  motion/              Scroll and hover motion (GSAP, ScrollTrigger, SplitText, Lenis)
public/assets/         Logo, experience logos, work reel video
tools/reel/            Source and render script for the work reel video
```

### Components and motion

Sections are **server components**. They render plain markup from content and mark the moving parts with `data-*` attributes (`data-reveal`, `data-rise`, `data-work-item`, …). The motion layer in `src/motion` finds those attributes after hydration, so components stay simple and the motion can be changed without touching markup.

`initMotion()` in `src/motion/index.ts` wires everything together and returns a cleanup function that undoes every tween, trigger and listener.

| Module | Responsibility |
| --- | --- |
| `scroll.ts` | Lenis smooth scrolling and scroll locking |
| `story.ts` | The horizontal strip (desktop) and pinned sections (phones) |
| `work-window.ts` | "The Work" window opening from the centre |
| `darkroom.ts` | Chapter V: negative, focus, gear, timer and aperture |
| `intro.ts` | Years counter, loading bar and name reveal on every load |
| `reveals.ts` | Line-by-line text reveals per section |
| `rail.ts` | Rail colours per panel and scroll progress |
| `menu.ts` | Menu open/close and section navigation |
| `hovers.ts` | Work previews, experience logos, service backgrounds |
| `case-studies.ts` | Case study dialogs and `#slug` deep links |
| `clock.ts` | Live local time |

Visitors who prefer reduced motion get plain sideways scrolling with no smoothing, intro or reveals. If JavaScript doesn't load, the page falls back to a readable vertical layout.

### Styling

Global tokens (colours, fonts, the `--s` scale unit) and a few shared utilities live in `src/app/globals.css`. Everything else is a CSS Module next to its component. Sizes use `--s`, which is 1/144 of the viewport width on desktop and 1/39 on phones, so the composition scales with the screen.

Fonts are loaded with `next/font`: Instrument Serif (display), Geist (body) and Geist Mono (labels and code).

## Editing content

All text, links and images come from `src/content`:

| File | Contains |
| --- | --- |
| `profile.ts` | Name, tagline, location and time zone, email, socials, logo, intro years, menu |
| `projects.ts` | Projects and their full case studies (problem, approach, decisions, code, metrics) |
| `sections.ts` | About, work section, services, experience, darkroom and footer copy |
| `types.ts` | The content model every file above follows |

Line breaks in short copy are written as `\n`. The `slug` of a project is the URL hash that opens its case study (for example `/#kiln`).

## Adding a CMS (next phase)

Pages never import content directly. They call `getContent()` in `src/lib/content.ts`, which returns a `SiteContent` object. To connect a CMS:

1. Model the CMS collections on the types in `src/content/types.ts`.
2. In `getContent()`, fetch from the CMS and map the response to `SiteContent`.
3. Choose how updates reach the site: time-based revalidation, or on-demand revalidation from a CMS webhook.

No component needs to change.

## The work reel

The video inside "The Work" window is `public/assets/video/work-reel.webm` with an `.mp4` fallback (12 seconds, under 400 KB each) and a poster frame. It is drawn from `tools/reel/reel.html`. Edit the `projects` list there, then run `node tools/reel/render.mjs` from the repository root to render a new one (needs Playwright and ffmpeg with libx264 and libvpx). You can also drop in any other video; it fills the window with `object-fit: cover`, so keep text away from the edges.

## Deploying

Set `NEXT_PUBLIC_SITE_URL` to the site's public address (used for metadata, `robots.txt` and `sitemap.xml`).

- **Vercel**: import the repository; no configuration needed.
- **Any Node host**: `npm run build && npm run start`.
