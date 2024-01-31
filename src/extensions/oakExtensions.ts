import { Context } from "https://deno.land/x/oak@v13.0.0/mod.ts";

Context.prototype.toJsonResponse = function (this: Context, statusCode: number, messageOrBody: string | object): void {
    this.response.type = "application/json";
    this.response.status = statusCode;

    if (typeof messageOrBody === 'string') {
        this.response.body = { message: messageOrBody };
    } else {
        this.response.body = messageOrBody;
    }
};