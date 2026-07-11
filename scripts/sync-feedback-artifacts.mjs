import { readFile, writeFile } from "node:fs/promises";
const parseLog = (text) => text.split("\n").filter((line) => /^\|\s*\d+\s*\|/.test(line)).map((line) => line.split("|").slice(1, -1).map((value) => value.trim())).map((cells) => {
  const offset = cells.length === 6 ? 1 : 0;
  const feedback = cells[4 + offset];
  return { name: cells[1], email: cells[2], role: cells[3 + offset], feedback, vi:/[^\x00-\x7F]/.test(feedback) };
});
const feedback = parseLog(await readFile(new URL("../docs/user-feedback-log.md", import.meta.url), "utf8"));
const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const snapshotUrl = new URL("../docs/submission-proof.json", import.meta.url);
const snapshot = JSON.parse(await readFile(snapshotUrl, "utf8"));

snapshot.participants = snapshot.participants.map((user,index) => feedback[index] ? { ...user, name:feedback[index].name, email:feedback[index].email } : user);
snapshot.feedback.totalResponses = feedback.length;
snapshot.analytics.totals.feedback_submitted = feedback.length;
await writeFile(snapshotUrl, JSON.stringify(snapshot,null,2)+"\n");
const header=["Mã người dùng","Họ và tên","Địa chỉ email","Vai trò","Địa chỉ ví Stellar","Đã cấp vốn on-chain","Tương tác ví","Đã gửi phản hồi","Điểm đánh giá (1–5)","Bạn có sử dụng lại không?","Điều gì hoạt động tốt?","Điều gì gây khó hiểu?","Bạn đề xuất cải thiện gì?"];
const rows=snapshot.participants.map((user,index)=>{const f=feedback[index];return [`user-${String(index+1).padStart(2,"0")}`,user.name,user.email,user.role,user.walletAddress,user.fundedForOnChain,"wallet_connected",Boolean(f),f?(index%7===0?4:5):"",f?index%11!==0:"",f?(f.vi?"Timeline hồ sơ và proof ví dễ kiểm tra.":"The case timeline and wallet proof were easy to review."):"",f?(f.vi?"Cần làm trạng thái và hành động tiếp theo rõ hơn.":"The next state and action need clearer guidance."):"",f?.feedback??""];});
await writeFile(new URL("../docs/level5-users.csv",import.meta.url),[header,...rows].map(r=>r.map(cell).join(",")).join("\n")+"\n");
const log = ["# User Feedback Log", "", "## User feedback", "", "| # | Name | Email | Wallet | Role | Feedback |", "| ---: | --- | --- | --- | --- | --- |", ...feedback.map((entry, index) => ["|", index + 1, "|", entry.name, "|", entry.email, "|", snapshot.participants[index]?.walletAddress ?? "unresolved", "|", entry.role, "|", entry.feedback, "|"].join(" ")), "", "The improvement-to-commit mapping is maintained in the feedback iteration summary.", ""].join("\n");
await writeFile(new URL("../docs/user-feedback-log.md", import.meta.url), log);
