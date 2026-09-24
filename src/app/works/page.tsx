import type { Metadata } from 'next';
import { Shell } from '@/components/shell/Shell';
import { WorksList } from '@/components/works/WorksList';
import { getContent } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const { profile, worksPage } = await getContent();
  return {
    title: `Works · ${profile.name}`,
    description: worksPage.intro,
    alternates: { canonical: '/works' },
  };
}

export default async function Works() {
  const content = await getContent();
  return (
    <Shell content={content} path="/works">
      <WorksList page={content.worksPage} projects={content.projects} />
    </Shell>
  );
}
