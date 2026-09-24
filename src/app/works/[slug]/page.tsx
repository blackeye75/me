import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CaseStudy } from '@/components/case-study/CaseStudy';
import { Shell } from '@/components/shell/Shell';
import { getContent } from '@/lib/content';

/** Every project page is built ahead of time. */
export async function generateStaticParams() {
  const { projects } = await getContent();
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<'/works/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const { profile, projects } = await getContent();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} · ${profile.name}`,
    description: project.caseStudy.overview,
    alternates: { canonical: `/works/${project.slug}` },
    openGraph: { images: [{ url: project.images.hero.src, width: project.images.hero.width, height: project.images.hero.height }] },
  };
}

export default async function Work({ params }: PageProps<'/works/[slug]'>) {
  const { slug } = await params;
  const content = await getContent();
  const index = content.projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = content.projects[index];
  const next = content.projects[(index + 1) % content.projects.length];

  return (
    <Shell content={content} path={`/works/${slug}`}>
      <CaseStudy project={project} next={next} labels={content.worksPage.labels} />
    </Shell>
  );
}
