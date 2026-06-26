import { access, cp, mkdir } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, ".next", "standalone");
const standaloneNextDir = path.join(standaloneDir, ".next");

async function exists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyIfPresent(sourcePath, destinationPath) {
  if (!(await exists(sourcePath))) {
    return;
  }

  await mkdir(path.dirname(destinationPath), { recursive: true });
  await cp(sourcePath, destinationPath, {
    force: true,
    recursive: true,
  });
}

await copyIfPresent(path.join(rootDir, ".next", "static"), path.join(standaloneNextDir, "static"));
await copyIfPresent(path.join(rootDir, "public"), path.join(standaloneDir, "public"));
