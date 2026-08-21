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
  assert.match(html, /Enter both names to begin/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("contains both turns, the switch, and the paper poster example", async () => {
  const [page, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /driver=\{student1\} navigator=\{student2\}/);
  assert.match(page, /driver=\{student2\} navigator=\{student1\}/);
  assert.match(page, /<RoleBadge job="Driver"/);
  assert.match(page, /<RoleBadge job="Navigator"/);
  assert.match(page, /Student 1 name/);
  assert.match(page, /Student 2 name/);
  assert.match(page, /Your names stay on this page\. They are not saved\./);
  assert.match(page, /Switch jobs/);
  assert.match(page, /Watch how it sounds/);
  assert.match(page, /Which key does it use\?/);
  assert.match(page, /Driver \(\{driver\}\) says/);
  assert.match(page, /Navigator \(\{navigator\}\) says/);
  assert.match(page, /Driver \(\$\{student1\}\) says/);
  assert.match(page, /Navigator \(\$\{student2\}\) says/);
  assert.match(page, /I am showing Sprite __\./);
  assert.match(page, /Okay\. Which key does it use\?/);
  assert.match(page, /Thank you for checking\. I am ready to switch\./);
  assert.match(page, /conversationStep/);
  assert.match(page, /exampleStep/);
  assert.match(page, /Read or do this step\. Then choose Next\./);
  assert.match(page, /Read this line aloud\. Then choose Next\./);
  assert.match(page, /It works because I saw the sprite move and the score change\./);
  assert.match(page, /disabled=\{conversationStep === 5 && !allDone\}/);
  assert.match(page, /useCountdown\(4 \* 60\)/);
  assert.match(page, /useCountdown\(5 \* 60\)/);
  assert.match(page, /Time is up/);
  assert.match(page, /timeUpAction="Switch roles"/);
  assert.match(page, /timeUpAction="Go to poster"/);
  assert.match(page, /Make your teamwork poster/);
  assert.match(page, /driver-navigator-poster-example\.png/);
  assert.match(page, /answers about the two jobs, responding to feedback, and working with a partner/);
  assert.match(page, /Use the three questions\. Change the answers to match what you and your partner did\./);
  assert.match(page, /We finished our poster/);
  assert.doesNotMatch(page, /<textarea/);
  assert.doesNotMatch(page, /Write your own answer/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
