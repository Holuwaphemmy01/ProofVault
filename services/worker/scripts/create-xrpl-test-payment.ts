import * as xrpl from "xrpl";

const XRPL_TESTNET_URL = "wss://s.altnet.rippletest.net:51233";
const PAYMENT_AMOUNT_XRP = "1";

const client = new xrpl.Client(XRPL_TESTNET_URL);

try {
  await client.connect();

  const sender = await client.fundWallet();
  const receiver = await client.fundWallet();
  const payment: xrpl.Payment = {
    TransactionType: "Payment",
    Account: sender.wallet.address,
    Destination: receiver.wallet.address,
    Amount: xrpl.xrpToDrops(PAYMENT_AMOUNT_XRP),
  };
  const prepared = await client.autofill(payment);
  const signed = sender.wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  if (!isValidatedSuccess(result)) {
    throw new Error(`XRPL Testnet payment failed with result: ${getTransactionResult(result) ?? "unknown"}`);
  }

  const transactionHash = String(result.result.hash ?? signed.hash).toUpperCase();

  if (!/^[0-9A-F]{64}$/.test(transactionHash)) {
    throw new Error("XRPL Testnet payment returned an invalid transaction hash");
  }

  console.log(JSON.stringify({
    network: "XRPL Testnet",
    transactionHash,
    destination: receiver.wallet.address,
    validated: true,
  }, null, 2));
} finally {
  await client.disconnect();
}

function isValidatedSuccess(result: xrpl.TxResponse<xrpl.SubmittableTransaction>) {
  return Boolean(result.result.validated) && getTransactionResult(result) === "tesSUCCESS";
}

function getTransactionResult(result: xrpl.TxResponse<xrpl.SubmittableTransaction>) {
  const metadata = result.result.meta;

  if (!metadata || typeof metadata === "string") {
    return undefined;
  }

  return metadata.TransactionResult;
}
