import { About } from '@/components/about/About';
import { CaseStudies } from '@/components/case-study/CaseStudy';
import { Darkroom } from '@/components/darkroom/Darkroom';
import { Experience } from '@/components/experience/Experience';
import { Footer } from '@/components/footer/Footer';
import { Hero } from '@/components/hero/Hero';
import { Menu } from '@/components/menu/Menu';
import { Motion } from '@/components/motion/Motion';
import { Rail } from '@/components/rail/Rail';
import { Services } from '@/components/services/Services';
import { Story } from '@/components/story/Story';
import { TheWork } from '@/components/the-work/TheWork';
import { Work } from '@/components/work/Work';
import { getContent } from '@/lib/content';

export default async function Home() {
  const content = await getContent();
  const { profile } = content;
  const year = new Date().getFullYear();

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Rail profile={profile} year={year} />
      <Menu items={content.nav} socials={profile.socials} />

      <main id="main" data-timezone={profile.location.timeZone}>
        <Story>
          <Hero profile={profile} intro={content.intro} />
          <About about={content.about} logo={profile.logo} />
          <TheWork work={content.work} />
          <Work work={content.work} projects={content.projects} />
          <Services services={content.services} />
          <Experience experience={content.experience} />
          <Darkroom darkroom={content.darkroom} logo={profile.logo} />
          <Footer footer={content.footer} profile={profile} year={year} />
        </Story>
      </main>

      <CaseStudies projects={content.projects} />
      <Motion />
    </>
  );
}
