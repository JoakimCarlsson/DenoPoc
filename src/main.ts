import {
    Application,
    Context,
    Router,
} from "https://deno.land/x/oak@v12.6.2/mod.ts";

const app = new Application();
const router = new Router();

router.post("/", async (context: Context) => {
    if (context.request.hasBody) {
        const result = context.request.body();
        if (result.type === "form-data") {
            const formData = await result.value.read();
            console.log(formData);
        }
    } else {
        context.response.status = 400; // Bad Request
        context.response.body = "No body found";
    }
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({port: 9907});
