import type { About, DarkroomSection, ExperienceSection, FooterSection, ServicesSection, WorkSection } from './types';

export const about: About = {
  chapter: 'Chapter I',
  label: 'Quick intro',
  intro: 'Hi, I’m Priyanshu. I’m a software engineer with ten years of experience building web products, APIs and developer tools that are fast, accessible and easy to change.',
  quote: '“Readable code is a kindness\nto the next developer.”',
  hobbies: 'Off the keyboard: climbing, film cameras, mechanical keyboards and long Sunday runs.',
  moreLabel: 'More about me',
  portraitAlt: 'Portrait placeholder with the Priyanshu Raj logo',
};

export const work: WorkSection = {
  intro: { before: 'The', after: 'Work' },
  reel: {
    webm: '/assets/video/work-reel.webm',
    mp4: '/assets/video/work-reel.mp4',
    poster: '/assets/video/work-reel-poster.jpg',
  },
  chapter: 'Chapter II',
  label: 'Selected work',
  note: '❋ Each project opens a full case study',
  cta: 'Start reading',
};

export const services: ServicesSection = {
  chapter: 'Chapter III',
  label: 'What I do',
  lead: 'Building software with clarity, speed and care.',
  items: [
    {
      title: ['Frontend', 'engineering'],
      description: 'Interfaces that load fast, stay accessible and hold up as the product grows.',
      tools: 'React · Next.js · Astro · TypeScript',
      cover: { variant: 'dash' },
    },
    {
      title: ['Backend', '& APIs'],
      description: 'Typed, documented services with data models that still make sense a year later.',
      tools: 'Go · Node.js · Python · PostgreSQL',
      cover: { variant: 'search', query: 'GET /v1/payments?status=failed', tags: ['200', '38 ms', 'JSON'] },
    },
    {
      title: ['Performance', '& accessibility'],
      description: 'Audits and fixes for slow or hard-to-use products, from Core Web Vitals to screen readers.',
      tools: 'Lighthouse · axe · WCAG 2.2',
      cover: { variant: 'shop' },
    },
    {
      title: ['Infrastructure', '& delivery'],
      description: 'CI pipelines, containers and edge deploys, so shipping on a Friday is uneventful.',
      tools: 'Docker · GitHub Actions · Cloudflare · AWS',
      cover: {
        variant: 'term',
        lines: [
          { command: '$ git push origin main' },
          { text: '✓ lint   ✓ test   ✓ build' },
          { stamp: 'deploy', text: 'edge · 42 regions' },
          { tag: 'live', tone: 'warn', text: 'in 38s' },
        ],
      },
    },
  ],
};

export const experience: ExperienceSection = {
  chapter: 'Chapter IV',
  label: 'Selected experience',
  note: 'Teams, products and\nclients since 2016.',
  moreLabel: 'And more',
  items: [
    { company: 'Bluefin Payments', role: 'Senior Engineer', period: '2023 — Now', logo: '/assets/logos/bluefin.svg' },
    { company: 'Northstar Labs', role: 'Software Engineer', period: '2021 — 23', logo: '/assets/logos/northstar.svg' },
    { company: 'Studio Ferro', role: 'Frontend Engineer', period: '2019 — 21', logo: '/assets/logos/studio-ferro.svg' },
    { company: 'Freelance', role: 'Web Developer', period: '2017 — 19', logo: '/assets/logos/freelance.svg' },
    { company: 'Kestrel Digital', role: 'Junior Developer', period: '2016 — 17', logo: '/assets/logos/kestrel.svg' },
  ],
};

export const darkroom: DarkroomSection = {
  chapter: 'Chapter V',
  words: ['Darkroom', 'Engineering'],
  note: 'Exposed under safelight,\ndeveloped by scroll.',
  timerSeconds: 90,
};

export const footer: FooterSection = {
  titleLines: ['Next', 'Chapter'],
  contactLabel: 'Say hello at',
  sign: 'Where ideas become\nshipped software',
  credit: 'Designed and built by hand',
};
