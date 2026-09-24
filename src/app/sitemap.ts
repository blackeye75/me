import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { profile, projects } = await getContent();
  const url = (path: string) => new URL(path, profile.siteUrl).toString();
  return [
    { url: url('/'), changeFrequency: 'monthly', priority: 1 },
    { url: url('/about'), changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/works'), changeFrequency: 'monthly', priority: 0.8 },
    ...projects.map((project) => ({ url: url(`/works/${project.slug}`), changeFrequency: 'yearly' as const, priority: 0.6 })),
  ];
}
