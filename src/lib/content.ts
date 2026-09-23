import { cache } from 'react';
import { localContent, type SiteContent } from '@/content';

/**
 * The single place the site reads its content from.
 *
 * Today it returns the typed data in `src/content`. To move to a CMS, fetch
 * from it here and map the response to `SiteContent`; pages and components
 * already await this function, so nothing else needs to change.
 */
export const getContent = cache(async (): Promise<SiteContent> => localContent);
