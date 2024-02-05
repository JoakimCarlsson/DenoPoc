import {
    Application,
    Context,
    Router,
} from "https://deno.land/x/oak@v12.6.2/mod.ts";

const app = new Application();
const router = new Router();

router.post("/", async (context) => {
    if (!context.request.hasBody) {
        context.response.status = 400;
        context.response.body = "No body found";
        return;
    }

    try {
        await Deno.stat("./uploads");
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            await Deno.mkdir("uploads", { recursive: true });
        } else {
            throw error;
        }
    }

    const result = context.request.body({ type: "form-data" });
    const formData = await result.value.read();

    if (!formData.files || formData.files.length === 0) {
        context.response.status = 400;
        context.response.body = "No file found in the request";
        return;
    }

    const file = formData.files[0];
    const filePath = `./uploads/${file.originalName}`;

    if (file.content && file.content.length > 100_000_000) {
        context.response.status = 400;
        context.response.body = "File size exceeds limit";
        return;
    }

    if (file.contentType !== 'video/mp4') {
        context.response.status = 400;
        context.response.body = "Invalid file type";
        return;
    }

    if (file.content) {
        await Deno.writeFile(filePath, file.content);
    } else if (file.filename) {
        const tempPath = file.filename;
        await Deno.copyFile(tempPath, filePath);
    } else {
        context.response.status = 400;
        context.response.body = "File data not found";
        return;
    }

    context.response.status = 200;
    context.response.body = { message: "File uploaded successfully", fileName: file.originalName };
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({port: 9907});
