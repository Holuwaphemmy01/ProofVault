import crypto from "node:crypto";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

console.log("Development keys only. Do not use in production.");
console.log("");
console.log("WORKER_ENCRYPTION_PUBLIC_KEY:");
console.log(publicKey);
console.log("WORKER_ENCRYPTION_PRIVATE_KEY:");
console.log(privateKey);
