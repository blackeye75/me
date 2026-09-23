/**
 * Content model for the whole site.
 *
 * Every word, link and image on the page comes from an object of type
 * `SiteContent`. Today it is stored in the files next to this one; later a CMS
 * can return the same shape from `getContent()` in `src/lib/content.ts`
 * without any component changing.
 */

export type Link = {
  label: string;
  href: string;
};

export type Image = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Profile = {
  /** Full name, shown in the rail, footer and page title. */
  name: string;
  /** The name as it appears in the hero, one entry per line. */
  heroLines: string[];
  /** Two-letter mark shown in the phone top bar. */
  monogram: string;
  /** Running title on the rail, e.g. "Folio — Edition". */
  edition: string;
  role: string;
  tagline: string;
  /** Used for the page description and link previews. */
  summary: string;
  location: {
    label: string;
    /** Shown next to the clock, e.g. "GMT+5:30". */
    offsetLabel: string;
    /** IANA time zone for the live clock, e.g. "Asia/Kolkata". */
    timeZone: string;
  };
  availability: string;
  email: string;
  socials: Link[];
  logo: Image;
  /** Public URL of the deployed site, used for metadata and the sitemap. */
  siteUrl: string;
};

export type Intro = {
  /** The intro counter rolls from `fromYear` to `toYear`. */
  fromYear: number;
  toYear: number;
  journey: string;
  scrollHint: string;
};

export type About = {
  chapter: string;
  label: string;
  intro: string;
  quote: string;
  hobbies: string;
  moreLabel: string;
  portraitAlt: string;
};

/* ---------- Project covers (CSS-drawn thumbnails) ---------- */

export type TermLine =
  | { command: string }
  | { stamp?: string; tag?: string; tone?: 'error' | 'warn' | 'info'; text: string };

export type Cover =
  | { variant: 'dash' }
  | { variant: 'term'; lines: TermLine[] }
  | { variant: 'shop' }
  | { variant: 'board' }
  | { variant: 'search'; query: string; tags: string[] };

/* ---------- Projects and case studies ---------- */

export type ProjectStatus = 'live' | 'oss' | 'archived';

export type Metric = { value: string; label: string };

export type Decision = { title: string; body: string };

export type CaseStudy = {
  overview: string;
  client: string;
  role: string;
  stack: string;
  links: Link[];
  problem: string;
  approach: string;
  decisions: Decision[];
  /** A short excerpt. Line comments (// or --) are dimmed automatically. */
  code: string;
  metrics: Metric[];
  outcome: string;
};

export type Project = {
  /** Used as the URL hash that opens the case study, e.g. #kiln. */
  slug: string;
  name: string;
  category: string;
  year: number;
  status: ProjectStatus;
  statusLabel: string;
  cover: Cover;
  caseStudy: CaseStudy;
};

export type WorkSection = {
  intro: { before: string; after: string };
  reel: { webm: string; mp4: string; poster: string };
  chapter: string;
  label: string;
  note: string;
  cta: string;
};

export type Service = {
  /** One entry per line of the title. */
  title: string[];
  description: string;
  tools: string;
  cover: Cover;
};

export type ServicesSection = {
  chapter: string;
  label: string;
  lead: string;
  items: Service[];
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  /** Path to an SVG or image shown when the name is hovered. */
  logo: string;
};

export type ExperienceSection = {
  chapter: string;
  label: string;
  note: string;
  items: Experience[];
  moreLabel: string;
};

export type DarkroomSection = {
  chapter: string;
  words: [string, string];
  note: string;
  /** The development timer counts up to this many seconds. */
  timerSeconds: number;
};

export type FooterSection = {
  titleLines: string[];
  contactLabel: string;
  sign: string;
  credit: string;
};

export type NavItem = { label: string; target: string };

export type SiteContent = {
  profile: Profile;
  intro: Intro;
  nav: NavItem[];
  about: About;
  work: WorkSection;
  projects: Project[];
  services: ServicesSection;
  experience: ExperienceSection;
  darkroom: DarkroomSection;
  footer: FooterSection;
};
