import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the CodeQuest dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>CodeQuest — Learn\. Practice\. Level up\.<\/title>/);
  assert.match(html, /Help center/);
  assert.match(html, /Settings/);
  assert.match(html, /aria-label="Open quest details"/);
  assert.match(html, /Browse challenges/);
});

test("server-renders the Python roadmap route", async () => {
  const response = await render("/learn/python");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Your Python roadmap\./);
  assert.match(html, /PYTHON .* FOUNDATIONS/);
});

test("implements usable help, settings, and challenge controls", async () => {
  const [page, css, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /setPanel\("help"\)/);
  assert.match(page, /setPanel\("settings"\)/);
  assert.match(page, /function Dialog/);
  assert.match(page, /role="dialog"/);
  assert.match(page, /const runChallenge = async/);
  assert.match(page, /expectedOutput/);
  assert.match(page, /aria-label="Challenge workspace"/);
  assert.match(page, /onFindChallenge/);
  assert.match(page, /setStage\("roadmap"\); router\.push\("\/learn\/python"\)/);
  assert.match(page, /setStage\("languages"\); router\.push\("\/learn"\)/);
  assert.match(css, /\.dialog-backdrop/);
  assert.match(css, /\.challenge-editor/);
  assert.match(css, /\.setting-switch/);
  assert.match(layout, /export const metadata/);
  assert.doesNotMatch(layout, /next\/headers/);
});
