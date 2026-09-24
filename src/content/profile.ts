import type { Intro, NavItem, Profile } from './types';

/**
 * The site's public address. Uses NEXT_PUBLIC_SITE_URL when set, otherwise the
 * production domain Vercel provides. A missing https:// or a trailing slash is fixed.
 */
function siteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '').trim();
  if (!raw) return 'https://example.com';
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return url.replace(/\/+$/, '');
}

export const profile: Profile = {
  name: 'Priyanshu Raj',
  heroLines: ['Priyanshu', 'Raj'],
  monogram: 'PR',
  edition: 'Folio — Edition',
  role: 'Software Engineer',
  tagline: 'Independent software engineer building fast, careful web products, from the database to the last pixel.',
  summary: 'Priyanshu Raj is an independent software engineer building fast, careful web products, from the database to the last pixel.',
  location: {
    label: 'India',
    offsetLabel: 'GMT+5:30',
    timeZone: 'Asia/Kolkata',
  },
  availability: 'Open for collaborations',
  email: 'priyanshuraj22275@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    { label: 'X', href: 'https://x.com/' },
  ],
  logo: { src: '/assets/img/logo.webp', alt: 'Priyanshu Raj logo', width: 500, height: 500 },
  siteUrl: siteUrl(),
};

export const intro: Intro = {
  fromYear: 2019,
  toYear: 2026,
  journey: 'A journey through years of code',
  scrollHint: 'Scroll',
};

/** Menu entries: pages, or a place on the home page after "#". */
export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Works', href: '/works' },
  { label: 'Contact', href: '/#contact' },
];
