import * as Crypto from "expo-crypto";

/**
 * // Hache un mot de passe avec SHA-256 avant envoi à l'API. Le hash est retourné en hexadécimal.
 */
export async function hashPassword(password: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
}
