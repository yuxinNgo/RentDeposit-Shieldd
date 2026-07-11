import { readFile, writeFile } from "node:fs/promises";
const parseLog = (text) => text.split("\n").filter((line) => /^\|\s*\d+\s*\|/.test(line)).map((line) => line.split("|").slice(1, -1).map((value) => value.trim())).map((cells) => {
  const offset = cells.length === 6 ? 1 : 0;
  const feedback = cells[4 + offset];
  return { name: cells[1], email: cells[2], role: cells[3 + offset], feedback, vi:/[^\x00-\x7F]/.test(feedback) };
});
const feedback = parseLog(await readFile(new URL("../docs/user-feedback-log.md", import.meta.url), "utf8"));
const snapshotUrl = new URL("../docs/submission-proof.json", import.meta.url);
const snapshot = JSON.parse(await readFile(snapshotUrl, "utf8"));

snapshot.participants = snapshot.participants.map((user,index) => feedback[index] ? { ...user, name:feedback[index].name, email:feedback[index].email } : user);
snapshot.feedback.totalResponses = feedback.length;
snapshot.analytics.totals.feedback_submitted = feedback.length;
await writeFile(snapshotUrl, JSON.stringify(snapshot,null,2)+"\n");
const log = ["# User Feedback Log", "", "## User feedback", "", "| # | Name | Email | Wallet | Role | Feedback |", "| ---: | --- | --- | --- | --- | --- |", ...feedback.map((entry, index) => ["|", index + 1, "|", entry.name, "|", entry.email, "|", snapshot.participants[index]?.walletAddress ?? "unresolved", "|", entry.role, "|", entry.feedback, "|"].join(" ")), "", "The improvement-to-commit mapping is maintained in the feedback iteration summary.", ""].join("\n");
await writeFile(new URL("../docs/user-feedback-log.md", import.meta.url), log);
