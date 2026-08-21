import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("exports a self-contained GitHub Pages entry point", async () => {
  const html = await readFile(new URL("../github-pages-dist/index.html", import.meta.url), "utf8");

  assert.match(html, /<title>Driver and Navigator Guide<\/title>/i);
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /src="\.\/assets\/[^"/]+\.js"/);
  assert.match(html, /href="\.\/assets\/[^"/]+\.css"/);
  assert.doesNotMatch(html, /\b(?:src|href)="\/(?!\/)/);
  assert.doesNotMatch(html, /url\(\/(?!\/)/);

  await Promise.all([
    access(new URL("../github-pages-dist/.nojekyll", import.meta.url)),
    access(new URL("../github-pages-dist/404.html", import.meta.url)),
  ]);
});
