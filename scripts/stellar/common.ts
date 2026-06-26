import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { Keypair } from "@stellar/stellar-sdk";
import {
  STELLAR_FRIENDBOT_URL,
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_RPC_URL,
} from "../../src/lib/stellar/network";

const execFileAsync = promisify(execFile);

const repoRoot = process.cwd();
export const contractManifestPath = path.join(repoRoot, "contracts", "rent_deposit_escrow", "Cargo.toml");
export const contractWasmPath = path.join(
  repoRoot,
  "contracts",
  "target",
  "wasm32v1-none",
  "release",
  "rent_deposit_escrow.wasm",
);

export interface ContractBuildResult {
  wasmHash: string;
  wasmPath: string;
}

export async function runStellarCommand(args: string[]) {
  const { stdout, stderr } = await execFileAsync("stellar", args, {
    cwd: repoRoot,
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}

export async function buildContract(): Promise<ContractBuildResult> {
  const { stdout, stderr } = await runStellarCommand([
    "contract",
    "build",
    "--manifest-path",
    contractManifestPath,
  ]);
  const output = `${stdout}\n${stderr}`;
  const hashMatch = output.match(/Wasm Hash:\s*([0-9a-f]+)/i);

  if (!hashMatch) {
    throw new Error("Could not parse Wasm hash from `stellar contract build` output.");
  }

  return {
    wasmHash: hashMatch[1],
    wasmPath: contractWasmPath,
  };
}

export async function ensureWasmFile() {
  try {
    await fs.access(contractWasmPath);
  } catch {
    await buildContract();
  }

  return contractWasmPath;
}

export async function fundTestnetAccount(publicKey: string) {
  const response = await fetch(`${STELLAR_FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`, {
    method: "GET",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Friendbot funding failed for ${publicKey}: ${body}`);
  }
}

export async function installContractCode(secretKey: string) {
  const wasmPath = await ensureWasmFile();
  const { stdout } = await runStellarCommand([
    "contract",
    "upload",
    "--wasm",
    wasmPath,
    "--source-account",
    secretKey,
    "--rpc-url",
    STELLAR_RPC_URL,
    "--network-passphrase",
    STELLAR_NETWORK_PASSPHRASE,
    "--quiet",
  ]);

  if (!stdout) {
    throw new Error("`stellar contract upload` did not return a Wasm hash.");
  }

  return stdout;
}

export function createFundedTestAccount() {
  return Keypair.random();
}
