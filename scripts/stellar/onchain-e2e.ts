import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { buildContract, createFundedTestAccount, fundTestnetAccount, installContractCode } from "./common";
import {
  deployEscrowContractClient,
  getEscrowContractClient,
  onChainStatusToAppStatus,
  readOnChainCase,
  submitContractWrite,
} from "../../src/lib/stellar/escrow-contract";
import { sha256Buffer } from "../../src/lib/stellar/crypto";
import { STELLAR_CONTRACT_WASM_HASH, STELLAR_NETWORK_PASSPHRASE } from "../../src/lib/stellar/network";

async function assertStatus(label: string, contractId: string, expectedStatus: string, publicKey: string, signTransaction: ReturnType<typeof basicNodeSigner>["signTransaction"]) {
  const client = await getEscrowContractClient({
    contractId,
    publicKey,
    signTransaction,
  });
  const snapshot = await readOnChainCase(client);
  const status = onChainStatusToAppStatus(snapshot.status);

  if (status !== expectedStatus) {
    throw new Error(`${label} expected ${expectedStatus} but received ${status}.`);
  }

  console.log(`[ok] ${label}: ${status}`);
}

async function main() {
  const { wasmHash } = await buildContract();

  if (wasmHash !== STELLAR_CONTRACT_WASM_HASH) {
    throw new Error(
      `The checked-in app hash (${STELLAR_CONTRACT_WASM_HASH}) does not match the freshly built contract (${wasmHash}). Update the hash before running the e2e flow.`,
    );
  }

  const landlord = createFundedTestAccount();
  const tenant = createFundedTestAccount();
  const mediator = createFundedTestAccount();

  await Promise.all([
    fundTestnetAccount(landlord.publicKey()),
    fundTestnetAccount(tenant.publicKey()),
    fundTestnetAccount(mediator.publicKey()),
  ]);

  const installedHash = await installContractCode(landlord.secret());

  if (installedHash !== wasmHash) {
    throw new Error(`Installed Wasm hash mismatch. Expected ${wasmHash}, got ${installedHash}.`);
  }

  const landlordSigner = basicNodeSigner(landlord, STELLAR_NETWORK_PASSPHRASE);
  const tenantSigner = basicNodeSigner(tenant, STELLAR_NETWORK_PASSPHRASE);
  const mediatorSigner = basicNodeSigner(mediator, STELLAR_NETWORK_PASSPHRASE);

  const { client: deployedClient, txHash: deployTxHash } = await deployEscrowContractClient({
    publicKey: landlord.publicKey(),
    signTransaction: landlordSigner.signTransaction,
  });
  const contractId = deployedClient.options.contractId;

  console.log(`[ok] deploy: ${contractId} (${deployTxHash})`);

  const initialize = await submitContractWrite(
    deployedClient.initialize_case({
      tenant: tenant.publicKey(),
      landlord: landlord.publicKey(),
      mediator: mediator.publicKey(),
      asset_code: "USDC",
      amount: BigInt(1800),
    }),
  );
  console.log(`[ok] initialize_case: ${initialize.txHash}`);
  await assertStatus("initialize_case", contractId, "CREATED", landlord.publicKey(), landlordSigner.signTransaction);

  const tenantClient = await getEscrowContractClient({
    contractId,
    publicKey: tenant.publicKey(),
    signTransaction: tenantSigner.signTransaction,
  });

  const fund = await submitContractWrite(
    tenantClient.fund_deposit({
      actor: tenant.publicKey(),
      amount: BigInt(1800),
    }),
  );
  console.log(`[ok] fund_deposit: ${fund.txHash}`);
  await assertStatus("fund_deposit", contractId, "FUNDED", tenant.publicKey(), tenantSigner.signTransaction);

  const moveIn = await submitContractWrite(
    tenantClient.confirm_move_in({
      actor: tenant.publicKey(),
    }),
  );
  console.log(`[ok] confirm_move_in: ${moveIn.txHash}`);
  await assertStatus("confirm_move_in", contractId, "MOVE_IN_CONFIRMED", tenant.publicKey(), tenantSigner.signTransaction);

  const requestRefund = await submitContractWrite(
    tenantClient.request_refund({
      actor: tenant.publicKey(),
    }),
  );
  console.log(`[ok] request_refund: ${requestRefund.txHash}`);
  await assertStatus("request_refund", contractId, "REFUND_REQUESTED", tenant.publicKey(), tenantSigner.signTransaction);

  const landlordClient = await getEscrowContractClient({
    contractId,
    publicKey: landlord.publicKey(),
    signTransaction: landlordSigner.signTransaction,
  });

  const proposeDeduction = await submitContractWrite(
    landlordClient.propose_deduction({
      actor: landlord.publicKey(),
      deduction_amount: BigInt(300),
      reason_hash: await sha256Buffer("Cleaning and repaint charges."),
    }),
  );
  console.log(`[ok] propose_deduction: ${proposeDeduction.txHash}`);
  await assertStatus("propose_deduction", contractId, "DEDUCTION_PROPOSED", landlord.publicKey(), landlordSigner.signTransaction);

  const openDispute = await submitContractWrite(
    tenantClient.open_dispute({
      actor: tenant.publicKey(),
      reason_hash: await sha256Buffer("Tenant disputes the repaint amount."),
    }),
  );
  console.log(`[ok] open_dispute: ${openDispute.txHash}`);
  await assertStatus("open_dispute", contractId, "DISPUTED", tenant.publicKey(), tenantSigner.signTransaction);

  const mediatorClient = await getEscrowContractClient({
    contractId,
    publicKey: mediator.publicKey(),
    signTransaction: mediatorSigner.signTransaction,
  });

  const resolveDispute = await submitContractWrite(
    mediatorClient.resolve_dispute({
      actor: mediator.publicKey(),
      tenant_amount: BigInt(1500),
      landlord_amount: BigInt(300),
      resolution_hash: await sha256Buffer("Mediator accepted the documented cleaning deduction."),
    }),
  );
  console.log(`[ok] resolve_dispute: ${resolveDispute.txHash}`);
  await assertStatus("resolve_dispute", contractId, "CLOSED", mediator.publicKey(), mediatorSigner.signTransaction);

  console.log("On-chain flow completed successfully.");
  console.log(`Landlord: ${landlord.publicKey()}`);
  console.log(`Tenant:   ${tenant.publicKey()}`);
  console.log(`Mediator: ${mediator.publicKey()}`);
  console.log(`Contract: ${contractId}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
