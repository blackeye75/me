import type { SectionKey } from '@/lib/content';

/**
 * What the admin panel can edit, section by section. The editor renders forms
 * from these descriptions, so a new field in the content model needs one line
 * here to become editable.
 */

type Base = { key: string; label: string; hint?: string };

export type Field =
  | (Base & { kind: 'text'; multiline?: boolean; mono?: boolean; rows?: number })
  | (Base & { kind: 'number' })
  | (Base & { kind: 'select'; options: { value: string; label: string }[] })
  /** A picture: { src, alt, width, height }, with upload. */
  | (Base & { kind: 'image' })
  /** A file address (logo, video), with upload. */
  | (Base & { kind: 'media'; accept?: string })
  /** A list of short texts, one per line. */
  | (Base & { kind: 'lines' })
  | (Base & { kind: 'group'; fields: Field[] })
  | (Base & { kind: 'list'; item: ListItem });

export type ListItem = {
  /** Singular name shown on the add button, e.g. "project". */
  noun: string;
  /** Field whose value titles each item in the list. */
  titleKey: string;
  fields: Field[];
  /** A new, empty item. */
  empty: () => unknown;
};

export type Section = {
  key: SectionKey;
  title: string;
  group: string;
  description: string;
} & ({ fields: Field[] } | { list: ListItem });

const text = (key: string, label: string, hint?: string): Field => ({ kind: 'text', key, label, hint });
const para = (key: string, label: string, hint?: string, rows = 3): Field => ({ kind: 'text', key, label, hint, multiline: true, rows });
const lines = (key: string, label: string, hint?: string): Field => ({ kind: 'lines', key, label, hint });
const image = (key: string, label: string, hint?: string): Field => ({ kind: 'image', key, label, hint });

const emptyImage = () => ({ src: '', alt: '', width: 1600, height: 1000 });
const link = { noun: 'link', titleKey: 'label', fields: [text('label', 'Label'), text('href', 'Address', 'A full URL, e.g. https://github.com/you')], empty: () => ({ label: '', href: '' }) };

export const sections: Section[] = [
  // ---------- Site ----------
  {
    key: 'profile',
    title: 'Profile',
    group: 'Site',
    description: 'Your name, contact details and the bits that appear on every page.',
    fields: [
      text('name', 'Full name', 'Used in the rail, footer and page titles.'),
      lines('heroLines', 'Name in the hero', 'One line per row of the big name on the first screen.'),
      text('monogram', 'Monogram', 'Two letters shown in the phone header.'),
      text('edition', 'Running title', 'The small vertical title on the rail, e.g. "Folio — Edition".'),
      text('role', 'Role'),
      para('tagline', 'Tagline', 'Shown on the first screen and in link previews.'),
      para('summary', 'Summary', 'The page description for search engines.'),
      {
        kind: 'group', key: 'location', label: 'Location',
        fields: [
          text('label', 'Place', 'e.g. India'),
          text('offsetLabel', 'Time offset label', 'e.g. GMT+5:30'),
          text('timeZone', 'Time zone', 'IANA name for the live clock, e.g. Asia/Kolkata'),
        ],
      },
      text('availability', 'Availability', 'e.g. Open for collaborations'),
      text('email', 'Email'),
      { kind: 'list', key: 'socials', label: 'Social links', item: link },
      image('logo', 'Logo', 'Shown in the portrait head circle and the darkroom.'),
    ],
  },
  {
    key: 'intro',
    title: 'Intro',
    group: 'Site',
    description: 'The loading screen that counts through the years.',
    fields: [
      { kind: 'number', key: 'fromYear', label: 'From year' },
      { kind: 'number', key: 'toYear', label: 'To year' },
      text('journey', 'Line under the counter'),
      text('scrollHint', 'Scroll hint'),
    ],
  },
  {
    key: 'nav',
    title: 'Menu',
    group: 'Site',
    description: 'The entries in the full-screen menu, in order.',
    list: { noun: 'entry', titleKey: 'label', fields: [text('label', 'Label'), text('href', 'Link', 'A page ("/about") or a place on the home page ("/#contact").')], empty: () => ({ label: '', href: '/' }) },
  },

  // ---------- Home page ----------
  {
    key: 'about',
    title: 'Chapter I · Intro',
    group: 'Home page',
    description: 'The short introduction next to the portrait.',
    fields: [
      text('chapter', 'Chapter label'),
      text('label', 'Small heading'),
      para('intro', 'Introduction', undefined, 4),
      para('quote', 'Quote', 'Line breaks are kept.'),
      para('hobbies', 'Hobbies line', 'Bottom left on desktop.'),
      text('moreLabel', 'Link text', 'Links to the About page.'),
      text('portraitAlt', 'Portrait description', 'Read out by screen readers.'),
    ],
  },
  {
    key: 'work',
    title: 'Chapter II · Work',
    group: 'Home page',
    description: '"The Work" window, its reel and the project list heading.',
    fields: [
      { kind: 'group', key: 'intro', label: 'Window words', fields: [text('before', 'Left / top word'), text('after', 'Right / bottom word')] },
      {
        kind: 'group', key: 'reel', label: 'Work reel',
        hint: 'The video inside the window. Upload WebM and MP4 versions; phones use the portrait pair.',
        fields: [
          { kind: 'media', key: 'webm', label: 'Landscape WebM', accept: 'video/webm' },
          { kind: 'media', key: 'mp4', label: 'Landscape MP4', accept: 'video/mp4' },
          { kind: 'media', key: 'poster', label: 'Poster image', accept: 'image/*' },
          { kind: 'media', key: 'portraitWebm', label: 'Portrait WebM', accept: 'video/webm' },
          { kind: 'media', key: 'portraitMp4', label: 'Portrait MP4', accept: 'video/mp4' },
        ],
      },
      text('chapter', 'Chapter label'),
      text('label', 'Small heading'),
      text('note', 'Note'),
      text('allLabel', 'Link to all work'),
    ],
  },
  {
    key: 'services',
    title: 'Chapter III · Services',
    group: 'Home page',
    description: 'What you do, one card per service.',
    fields: [
      text('chapter', 'Chapter label'),
      text('label', 'Small heading'),
      para('lead', 'Lead'),
      {
        kind: 'list', key: 'items', label: 'Services',
        item: {
          noun: 'service', titleKey: 'title',
          fields: [
            lines('title', 'Title', 'One line per row.'),
            para('description', 'Description'),
            text('tools', 'Tools'),
            image('image', 'Picture', 'Portrait works best (about 5:7).'),
          ],
          empty: () => ({ title: ['New service'], description: '', tools: '', image: { ...emptyImage(), width: 1000, height: 1400 } }),
        },
      },
    ],
  },
  {
    key: 'experience',
    title: 'Chapter IV · Experience',
    group: 'Home page',
    description: 'Companies and clients, each with a logo.',
    fields: [
      text('chapter', 'Chapter label'),
      text('label', 'Small heading'),
      para('note', 'Note', 'Line breaks are kept.'),
      {
        kind: 'list', key: 'items', label: 'Experience',
        item: {
          noun: 'company', titleKey: 'company',
          fields: [
            text('company', 'Company'),
            text('role', 'Role'),
            text('period', 'Period', 'e.g. 2021 — 23'),
            { kind: 'media', key: 'logo', label: 'Logo', accept: 'image/*', hint: 'A square SVG or PNG.' },
          ],
          empty: () => ({ company: '', role: '', period: '', logo: '' }),
        },
      },
      text('moreLabel', 'Last line', 'e.g. And more'),
    ],
  },
  {
    key: 'darkroom',
    title: 'Chapter V · Darkroom',
    group: 'Home page',
    description: 'The darkroom scene.',
    fields: [
      text('chapter', 'Chapter label'),
      lines('words', 'Words', 'Exactly two lines: the top word and the bottom word.'),
      para('note', 'Note', 'Line breaks are kept.'),
      { kind: 'number', key: 'timerSeconds', label: 'Development timer (seconds)' },
    ],
  },
  {
    key: 'footer',
    title: 'Footer',
    group: 'Home page',
    description: 'The closing "Next chapter" panel.',
    fields: [
      lines('titleLines', 'Title', 'One line per row.'),
      text('contactLabel', 'Contact label'),
      text('socialLabel', 'Social label'),
      para('sign', 'Sign-off', 'Line breaks are kept.'),
      text('credit', 'Credit line'),
    ],
  },

  // ---------- Projects ----------
  {
    key: 'projects',
    title: 'Projects',
    group: 'Work',
    description: 'Every project, with its pictures and full case study. The order here is the order on the site.',
    list: {
      noun: 'project', titleKey: 'name',
      fields: [
        text('name', 'Name'),
        text('slug', 'Page address', 'Lowercase words and hyphens; the page lives at /works/<address>.'),
        text('category', 'Category'),
        { kind: 'number', key: 'year', label: 'Year' },
        { kind: 'select', key: 'status', label: 'Status', options: [{ value: 'live', label: 'Live' }, { value: 'oss', label: 'Open source' }, { value: 'archived', label: 'Archived' }] },
        text('statusLabel', 'Status label'),
        {
          kind: 'group', key: 'images', label: 'Pictures',
          fields: [
            image('hero', 'Landscape', 'Lists and the top of the case study (16:10).'),
            image('tall', 'Portrait', 'Tall cards on the works page (4:5).'),
            image('detail', 'Close-up', 'Further down the case study (16:10).'),
          ],
        },
        {
          kind: 'group', key: 'caseStudy', label: 'Case study',
          fields: [
            para('overview', 'Overview'),
            text('client', 'Client'),
            text('role', 'Role'),
            text('stack', 'Stack'),
            { kind: 'list', key: 'links', label: 'Links', item: link },
            para('problem', 'The problem', undefined, 4),
            para('approach', 'Approach', undefined, 4),
            {
              kind: 'list', key: 'decisions', label: 'Key decisions',
              item: { noun: 'decision', titleKey: 'title', fields: [text('title', 'Title'), para('body', 'Explanation')], empty: () => ({ title: '', body: '' }) },
            },
            { kind: 'text', key: 'code', label: 'Code excerpt', multiline: true, mono: true, rows: 8, hint: 'Line comments (// or --) are dimmed.' },
            {
              kind: 'list', key: 'metrics', label: 'Results',
              item: { noun: 'result', titleKey: 'value', fields: [text('value', 'Figure', 'e.g. −38%'), text('label', 'What it measures')], empty: () => ({ value: '', label: '' }) },
            },
            para('outcome', 'Outcome', undefined, 4),
          ],
        },
      ],
      empty: () => ({
        slug: 'new-project',
        name: 'New project',
        category: '',
        year: new Date().getFullYear(),
        status: 'live',
        statusLabel: 'Live',
        images: { hero: emptyImage(), tall: { ...emptyImage(), width: 1200, height: 1500 }, detail: emptyImage() },
        caseStudy: { overview: '', client: '', role: '', stack: '', links: [], problem: '', approach: '', decisions: [], code: '', metrics: [], outcome: '' },
      }),
    },
  },

  // ---------- Pages ----------
  {
    key: 'aboutPage',
    title: 'About page',
    group: 'Pages',
    description: 'Everything on /about.',
    fields: [
      text('label', 'Small heading'),
      para('intro', 'Introduction', undefined, 4),
      text('portraitAlt', 'Portrait description'),
      para('statement', 'Statement', undefined, 4),
      lines('paragraphs', 'Paragraphs', 'One paragraph per line.'),
      { kind: 'group', key: 'philosophy', label: 'Philosophy', fields: [text('label', 'Label'), para('quote', 'Quote')] },
      {
        kind: 'group', key: 'career', label: 'Career journey',
        fields: [
          lines('title', 'Title', 'One line per row.'),
          para('note', 'Note'),
          {
            kind: 'list', key: 'items', label: 'Roles',
            item: { noun: 'role', titleKey: 'company', fields: [text('period', 'Period', 'e.g. 2021 — 2023'), text('role', 'Role'), text('company', 'Company')], empty: () => ({ period: '', role: '', company: '' }) },
          },
        ],
      },
      {
        kind: 'group', key: 'beyond', label: 'Beyond code',
        fields: [
          text('lead', 'Opening words', 'e.g. Beyond code:'),
          {
            kind: 'list', key: 'hobbies', label: 'Hobbies',
            item: { noun: 'hobby', titleKey: 'label', fields: [text('label', 'Hobby'), image('image', 'Picture', 'Shown in the frame on hover (4:5).')], empty: () => ({ label: '', image: { ...emptyImage(), width: 800, height: 1000 } }) },
          },
          para('tail', 'Closing words'),
          image('image', 'Picture'),
          para('availability', 'Availability', 'Line breaks are kept.'),
          text('emailLabel', 'Email label'),
        ],
      },
    ],
  },
  {
    key: 'worksPage',
    title: 'Works page',
    group: 'Pages',
    description: 'The works list and the labels on every project page.',
    fields: [
      text('title', 'Title'),
      para('intro', 'Description', 'For search engines.'),
      {
        kind: 'group', key: 'labels', label: 'Project page labels',
        fields: ['back', 'overview', 'details', 'client', 'year', 'role', 'stack', 'preview', 'problem', 'approach', 'decisions', 'code', 'outcome', 'next']
          .map((key) => text(key, key.charAt(0).toUpperCase() + key.slice(1))),
      },
    ],
  },
];

export const sectionByKey = (key: string) => sections.find((s) => s.key === key);
