import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { profile } = await getContent();
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: new URL('/sitemap.xml', profile.siteUrl).toString(),
  };
}
