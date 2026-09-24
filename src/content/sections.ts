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
    portraitWebm: '/assets/video/work-reel-portrait.webm',
    portraitMp4: '/assets/video/work-reel-portrait.mp4',
  },
  chapter: 'Chapter II',
  label: 'Selected work',
  note: '❋ Each project opens a full case study',
  allLabel: 'View all work',
};

const serviceImage = (name: string, alt: string) => ({ src: `/assets/shots/service-${name}.webp`, alt, width: 1000, height: 1400 });

export const services: ServicesSection = {
  chapter: 'Chapter III',
  label: 'What I do',
  lead: 'Building software with clarity, speed and care.',
  items: [
    {
      title: ['Frontend', 'engineering'],
      description: 'Interfaces that load fast, stay accessible and hold up as the product grows.',
      tools: 'React · Next.js · Astro · TypeScript',
      image: serviceImage('frontend', 'A dashboard on a phone'),
    },
    {
      title: ['Backend', '& APIs'],
      description: 'Typed, documented services with data models that still make sense a year later.',
      tools: 'Go · Node.js · Python · PostgreSQL',
      image: serviceImage('backend', 'An API client on a laptop'),
    },
    {
      title: ['Performance', '& accessibility'],
      description: 'Audits and fixes for slow or hard-to-use products, from Core Web Vitals to screen readers.',
      tools: 'Lighthouse · axe · WCAG 2.2',
      image: serviceImage('performance', 'A storefront seen up close'),
    },
    {
      title: ['Infrastructure', '& delivery'],
      description: 'CI pipelines, containers and edge deploys, so shipping on a Friday is uneventful.',
      tools: 'Docker · GitHub Actions · Cloudflare · AWS',
      image: serviceImage('infrastructure', 'A deploy log on a monitor'),
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
  socialLabel: 'Social',
  sign: 'Where ideas become\nshipped software',
  credit: 'Designed and built by hand',
};
