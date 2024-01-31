import { Context } from "https://deno.land/x/oak@v13.0.0/mod.ts";
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const JWKS_URL = "https://dev-....us.auth0.com/.well-known/jwks.json";
const ISSUER = "https://dev-.....us.auth0.com/";
const AUDIENCE = "https://localhost:7027";

let cachedPublicKey: CryptoKey | null = null;

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

async function authMiddleware(ctx: Context, next: () => Promise<unknown>) {
  try {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No Authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const publicKey = await getPublicKey();

    const jwtOptions = { issuer: ISSUER, audience: AUDIENCE };
    await verify(token, publicKey, jwtOptions);

    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Get out of here", error: error.message };
  }
}

export { authMiddleware };
