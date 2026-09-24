import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import Script from 'next/script';
import 'lenis/dist/lenis.css';
import './globals.css';
import { getContent } from '@/lib/content';

const serif = Instrument_Serif({ weight: '400', subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const sans = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  const title = `${profile.name} · ${profile.role}`;
  return {
    metadataBase: new URL(profile.siteUrl),
    title,
    description: profile.summary,
    alternates: { canonical: '/' },
    openGraph: { type: 'website', url: '/', title, description: profile.tagline },
    twitter: { card: 'summary_large_image', title, description: profile.tagline },
  };
}

export const viewport: Viewport = {
  themeColor: '#262220',
  viewportFit: 'cover',
};

/*
 * Runs before first paint: sets the layout and motion classes on <html> so
 * nothing flashes. The home page starts with its intro; other pages start
 * behind the curtain, which lifts once the motion layer is ready. If the
 * motion script never arrives, the safety timer removes it all.
 */
const bootScript = `(function () {
  var root = document.documentElement;
  var path = location.pathname.replace(/\\/+$/, '') || '/';
  var home = path === '/';
  var sideways = home || path === '/about' || path === '/works';
  if (!sideways && !/^\\/works\\/[^/]+$/.test(path)) return;
  root.classList.add('js');
  if (sideways) root.classList.add('has-h');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('motion', home && !location.hash ? 'is-intro' : 'is-entering');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }
  setTimeout(function () {
    if (!root.classList.contains('motion-ready')) root.classList.remove('is-intro', 'is-entering', 'motion', 'has-h');
  }, 4000);
})();`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <Script id="boot" strategy="beforeInteractive">{bootScript}</Script>
        {children}
      </body>
    </html>
  );
}
