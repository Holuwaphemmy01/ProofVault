export function utf8ToHex(value: string) {
  return `0x${Buffer.from(value, "utf8").toString("hex")}`;
}

export function hexToUtf8(value: string) {
  return Buffer.from(value.replace(/^0x/i, ""), "hex").toString("utf8");
}

export function stringToBytes32Hex(value: string) {
  const buffer = Buffer.alloc(32);
  const encoded = Buffer.from(value, "utf8");

  if (encoded.length > 32) {
    throw new Error(`string too long for bytes32: ${value}`);
  }

  encoded.copy(buffer);
  return `0x${buffer.toString("hex")}`;
}
