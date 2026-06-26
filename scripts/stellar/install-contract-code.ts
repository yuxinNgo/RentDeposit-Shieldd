import { promises as fs } from "node:fs";
import path from "node:path";
import {
  buildContract,
  createFundedTestAccount,
  fundTestnetAccount,
  installContractCode,
} from "./common";
import {
  STELLAR_CONTRACT_WASM_HASH,
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_RPC_URL,
} from "../../src/lib/stellar/network";

async function maybeWriteEnv(hash: string) {
  if (!process.argv.includes("--write-env")) {
    return;
  }

  const envPath = path.join(process.cwd(), ".env.local");
  const nextLines = [
    `NEXT_PUBLIC_STELLAR_RPC_URL=${STELLAR_RPC_URL}`,
    `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=${STELLAR_NETWORK_PASSPHRASE}`,
    `NEXT_PUBLIC_STELLAR_CONTRACT_WASM_HASH=${hash}`,
  ];

  let existing = "";

  try {
    existing = await fs.readFile(envPath, "utf8");
  } catch {
    existing = "";
  }

  const filtered = existing
    .split(/\r?\n/)
    .filter(
      (line) =>
        !line.startsWith("NEXT_PUBLIC_STELLAR_RPC_URL=") &&
        !line.startsWith("NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=") &&
        !line.startsWith("NEXT_PUBLIC_STELLAR_CONTRACT_WASM_HASH="),
    )
    .filter(Boolean);

  const output = `${[...filtered, ...nextLines].join("\n")}\n`;
  await fs.writeFile(envPath, output, "utf8");
  console.log(`Updated ${envPath}`);
}

async function main() {
  const { wasmHash } = await buildContract();
  const uploader = createFundedTestAccount();

  await fundTestnetAccount(uploader.publicKey());
  const installedHash = await installContractCode(uploader.secret());

  if (installedHash !== wasmHash) {
    throw new Error(`Installed Wasm hash mismatch. Expected ${wasmHash}, got ${installedHash}.`);
  }

  console.log(`Build hash:      ${wasmHash}`);
  console.log(`Installed hash:  ${installedHash}`);
  console.log(`Default app hash:${STELLAR_CONTRACT_WASM_HASH}`);
  console.log(`Uploader wallet: ${uploader.publicKey()}`);

  if (installedHash !== STELLAR_CONTRACT_WASM_HASH) {
    console.log("Hash differs from the app default. Re-run with --write-env to override `.env.local`.");
  }

  await maybeWriteEnv(installedHash);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
