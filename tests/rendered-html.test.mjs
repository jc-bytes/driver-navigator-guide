import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Driver and Navigator guide", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Driver and Navigator Guide<\/title>/i);
  assert.match(html, /One computer\. Two helpers\./);
  assert.match(html, /Only the Driver touches the computer\./);
  assert.match(html, /Student 1 starts as Driver/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("contains both turns, the switch, and all three reflection prompts", async () => {
  const [page, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /driver="Student 1" navigator="Student 2"/);
  assert.match(page, /driver="Student 2" navigator="Student 1"/);
  assert.match(page, /Switch jobs/);
  assert.match(page, /What are the two jobs\?/);
  assert.match(page, /How did you respond to feedback\?/);
  assert.match(page, /How did you work together\?/);
  assert.match(page, /disabled=\{!allDone\}/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
