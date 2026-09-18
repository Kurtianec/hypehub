import { randomBytes, scryptSync } from "node:crypto";
import { argv } from "node:process";

const password = argv[2];
if (!password || password.length < 12) {
  console.error("Usage: npm run password:hash -- \"a-password-of-at-least-12-chars\"");
  process.exit(1);
}
const salt = randomBytes(16);
console.log(`scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`);
