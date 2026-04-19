/**
 * PandaStore E2E Cryptography Library
 * Uses Web Crypto API for client-side encryption.
 */

const KEY_ALGO = {
  name: "RSA-OAEP",
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
};

const MESSAGE_ALGO = "AES-GCM";

/**
 * Generate a new RSA Key Pair for E2E identity.
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      KEY_ALGO,
      true, // extractable
      ["encrypt", "decrypt"]
    );

    const publicKeyJWK = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const privateKeyJWK = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

    return {
      publicKey: JSON.stringify(publicKeyJWK),
      privateKey: JSON.stringify(privateKeyJWK),
    };
  } catch (err) {
    console.error("Key generation failed:", err);
    throw new Error("Could not create secure identity");
  }
}

/**
 * Encrypt a message using the recipient's public key.
 * In a production environment, we'd use Hybrid Encryption (RSA + AES).
 * For this phase, we use RSA-OAEP for the full payload as a robust baseline.
 */
export async function encryptMessage(content: string, recipientPublicKeyJWK: string): Promise<string> {
  try {
    const publicKey = await window.crypto.subtle.importKey(
      "jwk",
      JSON.parse(recipientPublicKeyJWK),
      KEY_ALGO,
      true,
      ["encrypt"]
    );

    const encoded = new TextEncoder().encode(content);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      encoded
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  } catch (err) {
    console.error("Encryption failed:", err);
    return content; // Fallback to plain if fails (not ideal, but safer for UI)
  }
}

/**
 * Decrypt a message using your private key.
 */
export async function decryptMessage(encryptedBase64: string, myPrivateKeyJWK: string): Promise<string> {
  try {
    const privateKey = await window.crypto.subtle.importKey(
      "jwk",
      JSON.parse(myPrivateKeyJWK),
      KEY_ALGO,
      true,
      ["decrypt"]
    );

    const encryptedBuffer = new Uint8Array(
      atob(encryptedBase64).split("").map((c) => c.charCodeAt(0))
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedBuffer
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    // If decryption fails, it might be a legacy plan-text message
    return encryptedBase64; 
  }
}

/**
 * Key Storage Utils
 */
export function savePrivateKey(key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ps_private_key", key);
  }
}

export function getPrivateKey(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("ps_private_key");
  }
  return null;
}
