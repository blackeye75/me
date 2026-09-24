import { About } from '@/components/about/About';
import { Darkroom } from '@/components/darkroom/Darkroom';
import { Experience } from '@/components/experience/Experience';
import { Footer } from '@/components/footer/Footer';
import { Hero } from '@/components/hero/Hero';
import { Services } from '@/components/services/Services';
import { Shell } from '@/components/shell/Shell';
import { Story } from '@/components/story/Story';
import { TheWork } from '@/components/the-work/TheWork';
import { Work } from '@/components/work/Work';
import { getContent } from '@/lib/content';

export default async function Home() {
  const content = await getContent();
  const { profile } = content;

  return (
    <Shell content={content} path="/">
      <Story>
        <Hero profile={profile} intro={content.intro} />
        <About about={content.about} logo={profile.logo} />
        <TheWork work={content.work} />
        <Work work={content.work} projects={content.projects} />
        <Services services={content.services} />
        <Experience experience={content.experience} />
        <Darkroom darkroom={content.darkroom} logo={profile.logo} />
        <Footer footer={content.footer} profile={profile} year={new Date().getFullYear()} />
      </Story>
    </Shell>
  );
}
