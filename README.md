# Priyanshu Raj — portfolio

A horizontal-scroll developer portfolio built with **Next.js 16** (App Router), **React 19** and **TypeScript**.

The site has four kinds of page:

- **Home** (`/`): one horizontal story on desktop. Scrolling moves a pinned strip of full-screen panels sideways. The strip holds still twice: once while a window between "The" and "Work" opens onto the work reel, and once for the darkroom in Chapter V.
- **About** (`/about`): a shorter horizontal story. It has five panels: the introduction, the approach, the philosophy (which lights up letter by letter), the career timeline, and life beyond code.
- **Works** (`/works`): every project as a card. On desktop the row of cards slides sideways as you scroll.
- **Project** (`/works/<slug>`): one case study per project. The facts stay on the left while the pictures and the write-up scroll past on the right.

On phones every page stacks vertically with the same reveals. Moving between pages plays a curtain transition.

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
  app/                 Routes: home, about/, works/, works/[slug]/, admin/, plus layout (fonts, metadata, boot script), 404, icon, robots, sitemap
  content/             All site content, typed. Edit these files to change what the site says
  lib/content.ts       getContent(): the one place pages read content from (Supabase over the defaults)
  lib/supabase/        Supabase connection settings and clients
  cms/schema.ts        What the admin panel can edit, section by section
  components/          One folder per component, each with its own CSS Module
    shell/             What every page shares: rail, menu, page curtain, motion
    story/             The pinned strip and the Panel wrapper every sideways section uses
    rail/  menu/       Navigation rail and full-screen menu
    hero/ about/ the-work/ work/ services/ experience/ darkroom/ footer/   Home page chapters
    about-page/        The About page's five panels
    works/             The works page's card row
    case-study/        A project page and its code block
    portrait/          The drawn portrait with the logo in the head circle
    image/             next/image for pictures that come from the content
    admin/             The admin panel: sign-in, editor, forms, uploads
    copy-email/        The copy-email button (client)
    motion/            <Motion />: starts the motion layer after hydration
  motion/              Scroll and hover motion (GSAP, ScrollTrigger, SplitText, Lenis)
public/assets/         Logo, experience logos, work reel videos, rendered pictures (shots/)
tools/reel/            Source and render script for the work reel videos
tools/shots/           Source and render script for the project, service and About pictures
supabase/migrations/   Database tables, security rules and storage for the admin panel
```

### Components and motion

Sections are **server components**. They render plain markup from content and mark the moving parts with `data-*` attributes (`data-reveal`, `data-rise`, `data-work-item`, …). The motion layer in `src/motion` finds those attributes after hydration, so components stay simple and the motion can be changed without touching markup.

`initMotion()` in `src/motion/index.ts` wires everything together and returns a cleanup function that undoes every tween, trigger and listener. Each page gets only the effects whose markup it contains.

Links between pages are plain `<a>` elements rather than `next/link`, so every page change is a full load. The curtain covers the change and the motion layer always starts fresh.

| Module | Responsibility |
| --- | --- |
| `scroll.ts` | Lenis smooth scrolling and scroll locking |
| `transitions.ts` | The curtain between pages |
| `enter.ts` | Titles, text, the lead picture and cards arriving on a page |
| `story.ts` | The horizontal strip (desktop) and pinned sections (phones) |
| `work-window.ts` | "The Work" window opening from the centre |
| `darkroom.ts` | Chapter V: negative, focus, gear, timer and aperture |
| `intro.ts` | Years counter, loading bar and name reveal on every load |
| `reveals.ts` | Reveals for text, pictures and lists; each replays whenever it comes back into view |
| `rail.ts` | Rail colours per panel and scroll progress |
| `menu.ts` | Menu open/close and section navigation |
| `hovers.ts` | Work previews, experience logos (on phones, the row in focus), service backgrounds |
| `works.ts` | The works page's sliding row (desktop) and card reveals (phones) |
| `about.ts` | The philosophy quote lighting up and the hobby pictures |
| `clock.ts` | Live local time |

Visitors who prefer reduced motion get plain sideways scrolling with no smoothing, intro or reveals. If JavaScript doesn't load, the page falls back to a readable vertical layout.

### Styling

Global tokens (colours, fonts, the `--s` scale unit) and a few shared utilities live in `src/app/globals.css`. Everything else is a CSS Module next to its component. Sizes use `--s`, which is 1/144 of the viewport width on desktop and 1/39 on phones, so the composition scales with the screen.

Fonts are loaded with `next/font`: Instrument Serif (display), Geist (body) and Geist Mono (labels and code).

## Editing content

There are two ways to change what the site says.

**In the admin panel** (`/admin`), once Supabase is connected (see below). Every section can be edited there: profile, menu, each home page chapter, projects with their pictures and case studies, the About page and the works page labels. Lists can be added to, reordered, duplicated and deleted, and pictures and videos can be uploaded. Saving publishes straight away.

**In the code**, in `src/content`. These files are also the defaults: any section never saved in the admin panel comes from here.

| File | Contains |
| --- | --- |
| `profile.ts` | Name, tagline, location and time zone, email, socials, logo, intro years, menu |
| `projects.ts` | Projects, their pictures and full case studies (problem, approach, decisions, code, metrics) |
| `sections.ts` | Home page copy: about, work, services, experience, darkroom and footer |
| `pages.ts` | The About page (statement, philosophy, career, hobbies) and the works page labels |
| `types.ts` | The content model every file above follows |

Line breaks in short copy are written as `\n`. The `slug` of a project is its page address (for example `/works/kiln`). Old links such as `/#kiln` forward to the project page.

## Admin panel and Supabase

Pages never import content directly. They call `getContent()` in `src/lib/content.ts`. With Supabase configured, it reads the saved sections from Supabase and lays them over the defaults in `src/content`. If Supabase isn't configured or can't be reached, the site uses the defaults.

Each section is one row in a `content` table, stored as JSON. Anyone can read it; only the email addresses in an `admins` table can change it, which Supabase enforces with row level security. Uploads go to a public `media` storage bucket.

**Setting it up**

1. Create a project at [supabase.com](https://supabase.com).
2. In its SQL editor, run the files in `supabase/migrations`, oldest first. They create the tables, the security rules and the `media` bucket.
3. Under **Authentication → Users**, add a user with your email and a password.
4. Allow that email to edit, in the SQL editor:
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
5. Copy the project URL and the anon (publishable) key from **Project Settings → API**. Set them as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (see `.env.example`) and in Vercel's environment variables, then redeploy.
6. Open `/admin` and sign in.

**How it works**

| Piece | Where |
| --- | --- |
| Admin page: sign-in, access check, loading saved sections | `src/app/admin/page.tsx` |
| Saving and resetting (server actions; they publish by expiring the content cache) | `src/app/admin/actions.ts` |
| What each section's form contains | `src/cms/schema.ts` |
| The editor, forms and uploads | `src/components/admin/` |
| Supabase clients, and the session refresh for `/admin` | `src/lib/supabase/`, `src/proxy.ts` |
| Tables, security rules and storage | `supabase/migrations/` |

The public pages stay static. Saving in the admin panel expires the cached content and the pages, so the next visit shows the change. A project added in the admin panel gets its page (`/works/<address>`) on its first visit. To make a new field editable, add it to the content model and one line to `src/cms/schema.ts`.

"Reset to default" deletes a section's saved copy, so the site goes back to what's in `src/content`.

## The work reel

The video inside "The Work" window is `public/assets/video/work-reel.webm` with an `.mp4` fallback (12 seconds, under 400 KB each) and a poster frame. Phones get a portrait version, `work-reel-portrait.webm`/`.mp4`. Both are drawn from `tools/reel/reel.html`. Edit the `projects` list there, then run `node tools/reel/render.mjs` from the repository root to render new ones (needs Playwright and ffmpeg with libx264 and libvpx). You can also drop in any other video. It fills the window with `object-fit: cover`, so keep text away from the edges.

## Pictures

The project, service and About pictures in `public/assets/shots` are drawn in the browser, not photographed. `tools/shots/shots.html` draws each scene (a laptop, monitor or phone showing the project, or a close-up of its screen), and `tools/shots/scenes.mjs` lists them. Run `node tools/shots/render.mjs` from the repository root to render them all as WebP (needs Playwright and ffmpeg with libwebp). Add a name to render just the matching ones, for example `node tools/shots/render.mjs kiln`. To use real photos instead, replace the files, or point the `images` of a project in `src/content/projects.ts` at new ones.

## Deploying

Set the environment variables in `.env.example`. `NEXT_PUBLIC_SITE_URL` is the site's public address, for example `https://priyanshuraj.dev` (used for metadata, `robots.txt` and `sitemap.xml`). A value without `https://` works too. On Vercel it is optional: without it the site uses the project's production domain.

- **Vercel**: import the repository. Add the Supabase variables to use the admin panel.
- **Any Node host**: `npm run build && npm run start`.
