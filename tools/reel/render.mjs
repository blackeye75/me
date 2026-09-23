// Renders reel.html to assets/video/work-reel.webm and .mp4 (12 s, 30 fps, 1600x900).
// Needs: npm i -D playwright   and ffmpeg with libx264 on your PATH.
// Run from the repository root:   node tools/reel/render.mjs
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const frames = mkdtempSync(join(tmpdir(), 'reel-'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto('file://' + resolve('tools/reel/reel.html'));
await page.evaluate(() => document.fonts.ready);

const fps = 30;
const total = await page.evaluate(() => window.TOTAL);
const count = Math.round(total * fps);
for (let i = 0; i < count; i++) {
  await page.evaluate((t) => window.render(t), i / fps);
  await page.screenshot({ path: join(frames, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 95 });
}
await browser.close();

execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(frames, 'f%04d.jpg'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
  'assets/video/work-reel.mp4'], { stdio: 'inherit' });
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(frames, 'f%04d.jpg'),
  '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an',
  'assets/video/work-reel.webm'], { stdio: 'inherit' });
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(frames, 'f0048.jpg'), '-q:v', '5',
  'assets/video/work-reel-poster.jpg'], { stdio: 'inherit' });
rmSync(frames, { recursive: true, force: true });
console.log(`Rendered ${count} frames to assets/video/work-reel.webm and .mp4`);
