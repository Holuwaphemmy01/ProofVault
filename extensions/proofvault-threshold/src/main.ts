import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { hexToUtf8, stringToBytes32Hex, utf8ToHex } from "./encoding.js";
import { verifyReserveThreshold, type ThresholdRequest } from "./threshold.js";

const VERSION = "0.1.0";
const OP_TYPE = "PROOFVAULT_RESERVE";
const OP_COMMAND_VERIFY = "VERIFY_RESERVE_THRESHOLD";
const PORT = Number(process.env.EXTENSION_PORT ?? 8080);

type Action = {
  data: {
    id: string;
    type: string;
    submissionTag: string;
    message: string;
  };
};

type DataFixed = {
  opType: string;
  opCommand: string;
  originalMessage: string;
};

const server = createServer(async (request, response) => {
  let action: Action | undefined;
  let dataFixed: DataFixed | undefined;

  try {
    if (request.method === "GET" && request.url === "/state") {
      sendJson(response, 200, {
        stateVersion: stringToBytes32Hex(VERSION),
        state: {
          extension: "proofvault-threshold-extension",
          opType: OP_TYPE,
          opCommand: OP_COMMAND_VERIFY,
        },
      });
      return;
    }

    if (request.method !== "POST" || request.url !== "/action") {
      sendText(response, 404, "not found");
      return;
    }

    action = JSON.parse(await readBody(request)) as Action;
    dataFixed = JSON.parse(hexToUtf8(action.data.message)) as DataFixed;

    if (normalize(dataFixed.opType) !== normalize(stringToBytes32Hex(OP_TYPE))) {
      sendText(response, 501, `unsupported op type: ${dataFixed.opType}`);
      return;
    }

    if (normalize(dataFixed.opCommand) !== normalize(stringToBytes32Hex(OP_COMMAND_VERIFY))) {
      sendText(response, 501, `unsupported op command: ${dataFixed.opCommand}`);
      return;
    }

    const thresholdRequest = JSON.parse(hexToUtf8(dataFixed.originalMessage)) as ThresholdRequest;
    const result = verifyReserveThreshold(thresholdRequest);

    sendJson(response, 200, buildActionResult(action, dataFixed, utf8ToHex(JSON.stringify(result)), 1, "ok"));
  } catch (error) {
    if (action && dataFixed) {
      sendJson(response, 200, buildActionResult(
        action,
        dataFixed,
        "0x",
        0,
        `error: ${error instanceof Error ? error.message : "threshold execution failed"}`,
      ));
      return;
    }

    sendText(response, 400, error instanceof Error ? error.message : "bad request");
  }
});

server.listen(PORT, () => {
  console.log(`ProofVault threshold extension listening on ${PORT}`);
});

function buildActionResult(action: Action, dataFixed: DataFixed, data: string, status: number, log: string) {
  return {
    id: action.data.id,
    submissionTag: action.data.submissionTag,
    status,
    log,
    opType: dataFixed.opType,
    opCommand: dataFixed.opCommand,
    additionalResultStatus: "0x",
    version: VERSION,
    data,
  };
}

function readBody(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

function sendText(response: ServerResponse, status: number, body: string) {
  response.writeHead(status, { "Content-Type": "text/plain" });
  response.end(body);
}

function normalize(value: string) {
  return value.toLowerCase();
}
