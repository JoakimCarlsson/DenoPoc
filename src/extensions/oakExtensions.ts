import { Context } from "https://deno.land/x/oak@v13.0.0/mod.ts";

Context.prototype.toJsonResponse = function (
  this: Context,
  statusCode: number,
  json: string | object,
): void {
  this.response.type = "application/json";
  this.response.status = statusCode;

  if (typeof json === "string") {
    this.response.body = { message: json };
  } else {
    this.response.body = json;
  }
};
