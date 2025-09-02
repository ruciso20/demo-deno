import { usersRoute } from "./routes/users.ts";
import { assignmentsRoute } from "./routes/assignments.ts";
import { helloRoute } from "./routes/hello.ts";
import { notFoundRoute } from "./routes/notfound.ts";

// Middleware simple con logging
async function withLogging(req: Request, handler: (r: Request) => Promise<Response>): Promise<Response> {
  console.log(`${req.method} ${req.url}`);
  return await handler(req);
}

// Servir archivos estáticos desde ./public
async function serveStatic(pathname: string): Promise<Response | null> {
  try {
    // Si es la raíz, servimos index.html
    const filePath = pathname === "/" ? "/index.html" : pathname;

    // Leemos archivo cada vez (no cache del servidor)
    const file = await Deno.readFile(`./public${filePath}`);
    const ext = filePath.split(".").pop() ?? "";
    const mimeTypes: Record<string, string> = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      svg: "image/svg+xml",
    };

    // Cabecera para evitar cache en el navegador
    return new Response(file, {
      headers: {
        "Content-Type": mimeTypes[ext] ?? "application/octet-stream",
        "Cache-Control": "no-store", // evita cache del navegador
      },
    });
  } catch {
    return null;
  }
}

// Servidor principal
Deno.serve((req: Request) =>
  withLogging(req, async (r) => {
    const url = new URL(r.url);

    // Rutas dinámicas
    if (url.pathname === "/hello") return helloRoute(r);
    if (url.pathname === "/users") return usersRoute(r);
    if (url.pathname === "/assignments") return assignmentsRoute(r);

    // Archivos estáticos
    const staticFile = await serveStatic(url.pathname);
    if (staticFile) return staticFile;

    // 404 por defecto
    return notFoundRoute();
  }),
);
