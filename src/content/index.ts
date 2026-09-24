import { aboutPage, worksPage } from './pages';
import { intro, nav, profile } from './profile';
import { projects } from './projects';
import { about, darkroom, experience, footer, services, work } from './sections';
import type { SiteContent } from './types';

/** The site's content as stored in this repository. */
export const localContent: SiteContent = {
  profile,
  intro,
  nav,
  about,
  work,
  projects,
  services,
  experience,
  darkroom,
  footer,
  aboutPage,
  worksPage,
};

export type * from './types';
