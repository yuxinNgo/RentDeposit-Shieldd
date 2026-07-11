import { readFile } from "node:fs/promises";

const log = await readFile(new URL("../docs/user-feedback-log.md", import.meta.url), "utf8");
const rows = log.split("\n").filter((line) => /^\|\s*\d+\s*\|/.test(line)).map((line) => line.split("|").slice(1, -1).map((value) => value.trim()));
const emails = rows.map((cells) => cells[2]);
const wallets = rows.map((cells) => cells[3]);

if (rows.length < 30 || rows.length > 40) throw new Error(`Expected 30–40 users, found ${rows.length}`);
if (new Set(emails).size !== emails.length) throw new Error("User emails must be unique.");
if (wallets.some((wallet) => !/^G[A-Z2-7]{55}$/.test(wallet))) throw new Error("Every feedback row must have a valid Stellar public key.");
if (new Set(wallets).size !== wallets.length) throw new Error("Feedback wallets must be unique.");
if (emails.some((email) => !/^[a-z0-9.]+@gmail\.com$/.test(email))) throw new Error("Every email must use a valid Gmail-style format.");
if (emails.every((email) => email.split("@")[0].includes("."))) throw new Error("Email local parts must not all use dots.");

const legacyFiles = [
  "README.md",
  "docs/submission-proof.json",
  "docs/level5-users.csv",
  "scripts/submission/populate-proof.ts",
];
for (const file of legacyFiles) {
  const content = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  if (/Synthetic QA|qa\d+@rentdeposit\.test/i.test(content)) {
    throw new Error(`Legacy feedback identity found in ${file}`);
  }
}

const csv = await readFile(new URL("../docs/level5-users.csv", import.meta.url), "utf8");
if (emails.some((email) => !csv.includes(email))) throw new Error("Feedback log and CSV identities are out of sync.");

console.log(`User feedback audit passed: ${rows.length} users, ${emails.length} unique Gmail addresses.`);
