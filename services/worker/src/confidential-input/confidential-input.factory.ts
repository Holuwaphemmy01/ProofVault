import { env } from "../lib/env.js";
import type { ConfidentialInputService } from "./confidential-input.interface.js";
import { FccInputService } from "./fcc-input.service.js";
import { LocalDevInputService } from "./local-dev-input.service.js";

export function getConfidentialInputService(): ConfidentialInputService {
  if (env.CONFIDENTIAL_INPUT_MODE === "local-dev") {
    return new LocalDevInputService();
  }

  return new FccInputService();
}
