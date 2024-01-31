import { Application, Router } from "https://deno.land/x/oak@v13.0.0/mod.ts";
import { authMiddleware } from "./common/middlewares/authMiddleware.ts";

const app = new Application();
const router = new Router();

router.get("/", (context) => {
  context.response.body = "Hello, World!";
});

app.use(authMiddleware);

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
