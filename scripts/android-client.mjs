import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const project = path.join(root, "android-client");
const windows = process.platform === "win32";
const gradle = path.join(project, windows ? "gradlew.bat" : "gradlew");
const task = process.argv[2] === "release" ? "assembleRelease" : "assembleDebug";
const result = spawnSync(gradle, [task], { cwd: project, stdio: "inherit", shell: windows });
if (result.status !== 0) process.exit(result.status ?? 1);

if (process.argv[2] === "publish") {
  const source = path.join(project, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
  if (!existsSync(source)) throw new Error(`APK не найден: ${source}`);
  const destinationDir = path.join(root, "public", "downloads");
  await mkdir(destinationDir, { recursive: true });
  const destination = path.join(destinationDir, "hypehub-android.apk");
  await copyFile(source, destination);
  console.log(`APK сайта готов: ${destination}`);
}
