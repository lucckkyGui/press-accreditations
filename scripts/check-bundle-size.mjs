import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DIST_DIR = path.resolve("dist");
const DEFAULT_LIMIT_KB = 6_500;
const LIMIT_KB = Number(process.env.BUNDLE_SIZE_LIMIT_KB ?? DEFAULT_LIMIT_KB);
const INCLUDED_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".ico",
  ".js",
  ".json",
  ".png",
  ".svg",
  ".webmanifest",
  ".woff",
  ".woff2",
]);

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(entryPath);
    }

    return [entryPath];
  });
};

if (!fs.existsSync(DIST_DIR)) {
  throw new Error("Missing dist directory. Run npm run build before npm run bundle:size.");
}

const files = walk(DIST_DIR).filter((filePath) => INCLUDED_EXTENSIONS.has(path.extname(filePath)));
const totalBytes = files.reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0);
const totalKb = totalBytes / 1024;
const largestFiles = files
  .map((filePath) => ({
    filePath: path.relative(DIST_DIR, filePath),
    sizeKb: fs.statSync(filePath).size / 1024,
  }))
  .sort((left, right) => right.sizeKb - left.sizeKb)
  .slice(0, 8);

console.log(`Bundle size gate: ${totalKb.toFixed(1)} KiB / ${LIMIT_KB.toFixed(1)} KiB`);
console.log("Largest emitted assets:");
largestFiles.forEach((file) => {
  console.log(`- ${file.filePath}: ${file.sizeKb.toFixed(1)} KiB`);
});

if (!Number.isFinite(LIMIT_KB) || LIMIT_KB <= 0) {
  throw new Error("BUNDLE_SIZE_LIMIT_KB must be a positive number.");
}

if (totalKb > LIMIT_KB) {
  throw new Error(
    `Bundle size ${totalKb.toFixed(1)} KiB exceeds limit ${LIMIT_KB.toFixed(1)} KiB. ` +
      "Raise BUNDLE_SIZE_LIMIT_KB intentionally or reduce emitted assets."
  );
}
