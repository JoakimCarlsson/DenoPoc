import { Context } from "https://deno.land/x/oak@v13.0.0/mod.ts"

declare module "https://deno.land/x/oak@v13.0.0/mod.ts" {
    interface Context {
        toJsonResponse: (statusCode: number, jsOrObj: string | object) => void;
    }
}

