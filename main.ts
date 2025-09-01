import { helloRoute } from "./routes/hello.ts";

Deno.serve((req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/hello") {
    return helloRoute(req);
  }

  return new Response("Ruta no encontrada, debe ser /hello", { status: 404 });
});

