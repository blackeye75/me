// Renders reel.html to public/assets/video: the landscape reel (1600x900) and a
// portrait one for phones (720x1280), 12 s at 30 fps, as WebM and MP4 (plus a poster for the landscape one).
// Needs: npx playwright (npm i -D playwright) and ffmpeg with libx264 and libvpx on your PATH.
// Run from the repository root:   node tools/reel/render.mjs
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const variants = [
  { name: 'work-reel', width: 1600, height: 900, query: '', poster: true },
  { name: 'work-reel-portrait', width: 720, height: 1280, query: '?portrait' },
];

const browser = await chromium.launch();
for (const v of variants) {
  const frames = mkdtempSync(join(tmpdir(), 'reel-'));
  const page = await browser.newPage({ viewport: { width: v.width, height: v.height } });
  await page.goto('file://' + resolve('tools/reel/reel.html') + v.query);
  await page.evaluate(() => document.fonts.ready);

  const fps = 30;
  const total = await page.evaluate(() => window.TOTAL);
  const count = Math.round(total * fps);
  for (let i = 0; i < count; i++) {
    await page.evaluate((t) => window.render(t), i / fps);
    await page.screenshot({ path: join(frames, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 95 });
  }
  await page.close();

  const out = `public/assets/video/${v.name}`;
  const input = ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(frames, 'f%04d.jpg')];
  execFileSync(ffmpeg, [...input, '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', `${out}.mp4`], { stdio: 'inherit' });
  execFileSync(ffmpeg, [...input, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an', `${out}.webm`], { stdio: 'inherit' });
  if (v.poster) execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', join(frames, 'f0048.jpg'), '-q:v', '5', `${out}-poster.jpg`], { stdio: 'inherit' });
  rmSync(frames, { recursive: true, force: true });
  console.log(`Rendered ${count} frames to ${out}.webm and .mp4`);
}
await browser.close();
