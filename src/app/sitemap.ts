import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { profile } = await getContent();
  return [{ url: profile.siteUrl, changeFrequency: 'monthly', priority: 1 }];
}
