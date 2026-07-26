import dotenv from "dotenv";
import { verifyProof } from "./verify-proof.js";

dotenv.config();

const port = Number(process.env.WORKER_PORT || 5000);
const verification = verifyProof();

console.log(
  JSON.stringify(
    {
      service: "proofvault-worker",
      port,
      verification,
    },
    null,
    2,
  ),
);
