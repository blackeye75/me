// Renders every scene in scenes.mjs to public/assets/shots/<file>.webp.
// Needs: npx playwright (npm i -D playwright) and ffmpeg with libwebp on your PATH.
// Run from the repository root:   node tools/shots/render.mjs [name-filter]
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { scenes } from './scenes.mjs';

const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const only = process.argv[2];
const out = 'public/assets/shots';
mkdirSync(out, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'shots-'));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1600 } });
await page.goto('file://' + resolve('tools/shots/shots.html'));
await page.evaluate(() => document.fonts.ready);

for (const s of scenes.filter((x) => !only || x.file.includes(only))) {
  await page.setViewportSize({ width: s.w, height: s.h });
  await page.evaluate((spec) => window.draw(spec), s);
  await page.evaluate(() => document.fonts.ready);
  const png = join(tmp, `${s.file}.png`);
  await page.screenshot({ path: png });
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', png, '-c:v', 'libwebp', '-quality', '80', '-compression_level', '6', join(out, `${s.file}.webp`)]);
  console.log(`${s.file}.webp`);
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
