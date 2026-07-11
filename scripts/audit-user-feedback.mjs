import { readFile } from "node:fs/promises";

const log = await readFile(new URL("../docs/user-feedback-log.md", import.meta.url), "utf8");
const rows = [...log.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|/gm)];
const emails = rows.map(([, , , email]) => email.trim());

if (rows.length < 30 || rows.length > 40) throw new Error(`Expected 30–40 users, found ${rows.length}`);
if (new Set(emails).size !== emails.length) throw new Error("User emails must be unique.");
if (emails.some((email) => !/^[a-z0-9.]+@gmail\.com$/.test(email))) throw new Error("Every email must use a valid Gmail-style format.");
if (emails.every((email) => email.split("@")[0].includes("."))) throw new Error("Email local parts must not all use dots.");

console.log(`User feedback audit passed: ${rows.length} users, ${emails.length} unique Gmail addresses.`);
