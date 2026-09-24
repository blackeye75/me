import type { AboutPage, WorksPage } from './types';

const hobby = (name: string, alt: string) => ({ src: `/assets/shots/hobby-${name}.webp`, alt, width: 800, height: 1000 });

/** The About page (/about). The name and photo-free portrait come from the profile. */
export const aboutPage: AboutPage = {
  label: 'About me',
  intro: 'Hi, I’m Priyanshu — a software engineer based in India, with years of experience building web products, APIs and developer tools. I write software that is fast, clear and built to last.',
  portraitAlt: 'Portrait placeholder with the Priyanshu Raj logo',
  statement: 'I build software focused on clarity, performance and careful engineering — products that feel fast, stay accessible and are easy for the next person to change.',
  paragraphs: [
    'Good software should feel calm, quick and predictable. Every detail shapes how a product is used, trusted and maintained.',
    'Across frontends, APIs and infrastructure, readable code and honest trade-offs stay central to how I work.',
  ],
  philosophy: {
    label: 'Philosophy',
    quote: '“Readable code is a kindness to the next developer.”',
  },
  career: {
    title: ['Career', 'Journey'],
    note: '❋ A timeline of the roles, teams and projects that have shaped how I think, build and solve problems.',
    items: [
      { period: '2023 — Now', role: 'Senior Engineer', company: 'Bluefin Payments' },
      { period: '2021 — 2023', role: 'Software Engineer', company: 'Northstar Labs' },
      { period: '2019 — 2021', role: 'Frontend Engineer', company: 'Studio Ferro' },
      { period: '2017 — 2019', role: 'Web Developer', company: 'Freelance' },
      { period: '2016 — 2017', role: 'Junior Developer', company: 'Kestrel Digital' },
    ],
  },
  beyond: {
    lead: 'Beyond code:',
    hobbies: [
      { label: 'climbing', image: hobby('climbing', 'A climbing wall with coloured holds') },
      { label: 'film cameras', image: hobby('camera', 'A film camera') },
      { label: 'mechanical keyboards', image: hobby('keyboard', 'A mechanical keyboard') },
      { label: 'long Sunday runs', image: hobby('running', 'A running track') },
    ],
    tail: '— quiet interests that shape my perspective and approach to work.',
    image: { src: '/assets/shots/about-desk.webp', alt: 'A desk with a monitor showing a dashboard', width: 1000, height: 1300 },
    availability: 'Open for\ncollaborations',
    emailLabel: 'Email',
  },
};

/** The works list (/works) and the case study pages (/works/<slug>). */
export const worksPage: WorksPage = {
  title: 'All work',
  intro: 'Products, tools and platforms, each with a full case study.',
  labels: {
    back: 'Back',
    overview: 'Overview',
    details: 'Details',
    client: 'Client',
    year: 'Year',
    role: 'Role',
    stack: 'Stack',
    preview: 'Preview',
    problem: 'The problem',
    approach: 'Approach',
    decisions: 'Key decisions',
    code: 'In the code',
    outcome: 'Outcome',
    next: 'Next project',
  },
};
