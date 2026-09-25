import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';
import { getContent } from '@/lib/content';
import { bootScript } from '@/motion/boot';

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

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs while the page is parsed, before the first paint: see motion/boot.ts. */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
