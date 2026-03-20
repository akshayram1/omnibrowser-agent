import { build, context } from "esbuild";
import { cp, mkdir } from "node:fs/promises";

const watch = process.argv.includes("--watch");
const outdir = "dist";

const common = {
  bundle: true,
  format: "esm",
  target: "es2022",
  sourcemap: true,
  logLevel: "info"
};

const entries = [
  { in: "src/background/index.ts", out: "background" },
  { in: "src/content/index.ts", out: "content" },
  { in: "src/popup/index.ts", out: "popup" },
  { in: "src/lib/index.ts", out: "lib" }
];

await mkdir(outdir, { recursive: true });
await cp("public/manifest.json", `${outdir}/manifest.json`);
await cp("src/popup/index.html", `${outdir}/popup.html`);

if (watch) {
  const contexts = await Promise.all(
    entries.map((entry) =>
      context({
        ...common,
        entryPoints: [entry.in],
        outfile: `${outdir}/${entry.out}.js`
      })
    )
  );

  await Promise.all(contexts.map((ctx) => ctx.watch()));
  console.log("Watching for changes...");
} else {
  for (const entry of entries) {
    await build({
      ...common,
      entryPoints: [entry.in],
      outfile: `${outdir}/${entry.out}.js`
    });
  }
}
