import type { Metadata } from 'next';
import { AboutBeyond } from '@/components/about-page/AboutBeyond';
import { AboutCareer } from '@/components/about-page/AboutCareer';
import { AboutIntro } from '@/components/about-page/AboutIntro';
import { AboutPhilosophy } from '@/components/about-page/AboutPhilosophy';
import { AboutStatement } from '@/components/about-page/AboutStatement';
import { Shell } from '@/components/shell/Shell';
import { Story } from '@/components/story/Story';
import { getContent } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const { profile, aboutPage } = await getContent();
  return {
    title: `About · ${profile.name}`,
    description: aboutPage.intro,
    alternates: { canonical: '/about' },
  };
}

export default async function About() {
  const content = await getContent();
  const { profile, aboutPage } = content;

  return (
    <Shell content={content} path="/about">
      <Story>
        <AboutIntro page={aboutPage} profile={profile} />
        <AboutStatement page={aboutPage} />
        <AboutPhilosophy page={aboutPage} />
        <AboutCareer page={aboutPage} />
        <AboutBeyond page={aboutPage} profile={profile} />
      </Story>
    </Shell>
  );
}
