import { createExpressApp } from "./app";

const port = Number(process.env.EXPRESS_PORT ?? "4000");

const app = createExpressApp();

app.listen(port, () => {
  console.log(`Anne Santé Express API listening on http://localhost:${port}`);
});
