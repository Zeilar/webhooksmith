import { base58 } from "base-id";

export function randomBase58(): string {
  return base58.generateToken(16);
}
