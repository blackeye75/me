import type { Intro, NavItem, Profile } from './types';

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
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com',
};

export const intro: Intro = {
  fromYear: 2019,
  toYear: 2026,
  journey: 'A journey through years of code',
  scrollHint: 'Scroll',
};

/** Menu entries. `target` is the id of the section to scroll to. */
export const nav: NavItem[] = [
  { label: 'Home', target: 'top' },
  { label: 'About', target: 'about' },
  { label: 'Work', target: 'work' },
  { label: 'Experience', target: 'experience' },
  { label: 'Contact', target: 'contact' },
];
