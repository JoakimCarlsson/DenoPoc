import { Context } from "https://deno.land/x/oak@v13.0.0/mod.ts";

const JWKS_URL = "https://dev-....us.auth0.com/.well-known/jwks.json";
const ISSUER = "https://dev-....us.auth0.com/";
const AUDIENCE = "https://localhost:7027";

let cachedPublicKey: CryptoKey | null = null;

async function authMiddleware(ctx: Context, next: () => Promise<unknown>) {
  try {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No Authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const publicKey = await getPublicKey();

    const isVerified = await verifyJWT(token, publicKey);
    if (!isVerified) {
      throw new Error("Invalid token");
    }

    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Get out of here", error: error.message };
  }
}

async function getPublicKey(): Promise<CryptoKey> {
  if (cachedPublicKey) return cachedPublicKey;

  const jwksResponse = await fetch(JWKS_URL);
  const jwks = await jwksResponse.json();
  const jwk = jwks.keys[0];

  cachedPublicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
    false,
    ["verify"],
  );

  return cachedPublicKey;
}

function decodeJWT(token: string) {
  const parts = token.split('.').map(part => atob(base64urlToBase64(part)));
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token');
  }

  const header = JSON.parse(parts[0]);
  const payload = JSON.parse(parts[1]);
  const signature = parts[2];

  return { header, payload, signature };
}

function base64urlToBase64(base64url: string): string {
  base64url = base64url.replace(/-/g, '+').replace(/_/g, '/');

  while (base64url.length % 4) {
    base64url += '=';
  }

  return base64url;
}

async function verifyJWT(token: string, publicKey: CryptoKey): Promise<boolean> {
  const { header, payload, signature } = decodeJWT(token);

  const signedContent = new TextEncoder().encode(token.split('.').slice(0, 2).join('.'));

  const decodedSignature = new Uint8Array(Array.from(signature).map(c => c.charCodeAt(0)));

  const isVerified = await crypto.subtle.verify(
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" },
      },
      publicKey,
      decodedSignature,
      signedContent
  );

  //check exp, iat, nbf here. 
  //exp should be greater than Date.now()
  //iat should be less than Date.now()
  //nbf should be less than Date.now()
  return isVerified && payload.iss === ISSUER && payload.aud === AUDIENCE;
}

export { authMiddleware };
