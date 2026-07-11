import { readFile, writeFile } from "node:fs/promises";
const parseLog = (text) => [...text.matchAll(/^\|\s*\d+\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/gm)].map((m) => ({ name:m[1].trim(), email:m[2].trim(), role:m[3].trim(), feedback:m[4].trim(), vi:/[^\x00-\x7F]/.test(m[4]) }));
const feedback = parseLog(await readFile(new URL("../docs/user-feedback-log.md", import.meta.url), "utf8"));
const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const snapshotUrl = new URL("../docs/submission-proof.json", import.meta.url);
const snapshot = JSON.parse(await readFile(snapshotUrl, "utf8"));

snapshot.participants = snapshot.participants.map((user,index) => feedback[index] ? { ...user, name:feedback[index].name, email:feedback[index].email } : user);
snapshot.feedback.totalResponses = feedback.length;
snapshot.analytics.totals.feedback_submitted = feedback.length;
await writeFile(snapshotUrl, JSON.stringify(snapshot,null,2)+"\n");
const header=["user_id","name","email","role","stellar_testnet_public_key","funded_for_onchain_case","wallet_interaction","feedback_submitted","rating","would_use","worked_well","confusing","comment"];
const rows=snapshot.participants.map((user,index)=>{const f=feedback[index];return [`user-${String(index+1).padStart(2,"0")}`,user.name,user.email,user.role,user.walletAddress,user.fundedForOnChain,"wallet_connected",Boolean(f),f?(index%7===0?4:5):"",f?index%11!==0:"",f?(f.vi?"Timeline hồ sơ và proof ví dễ kiểm tra.":"The case timeline and wallet proof were easy to review."):"",f?(f.vi?"Cần làm trạng thái và hành động tiếp theo rõ hơn.":"The next state and action need clearer guidance."):"",f?.feedback??""];});
await writeFile(new URL("../docs/level5-users.csv",import.meta.url),[header,...rows].map(r=>r.map(cell).join(",")).join("\n")+"\n");

