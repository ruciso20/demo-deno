import { usersRoute } from "./routes/users.ts";
import { assignmentsRoute } from "./routes/assignments.ts";
import { projectsRoute } from "./routes/projects.ts";
import { helloRoute } from "./routes/hello.ts";
import { notFoundRoute } from "./routes/notfound.ts";

// Logging simple
function withLogging(req: Request, handler: (r: Request) => Promise<Response>): Promise<Response> {
  console.log(`${req.method} ${req.url}`);
  return handler(req);
}

// Archivos estáticos
async function serveStatic(pathname: string): Promise<Response | null> {
  try {
    const filePath = pathname === "/" ? "/index.html" : pathname;
    const file = await Deno.readFile(`./public${filePath}`);
    const ext = filePath.split(".").pop() ?? "";
    const mimeTypes: Record<string, string> = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
    };
    return new Response(file, {
      headers: {
        "Content-Type": mimeTypes[ext] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return null;
  }
}

Deno.serve((req: Request) =>
  withLogging(req, async (r) => {
    const url = new URL(r.url);

    if (url.pathname.startsWith("/users")) return usersRoute(r);
    if (url.pathname.startsWith("/assignments")) return assignmentsRoute(r);
    if (url.pathname.startsWith("/projects")) return projectsRoute(r);
    if (url.pathname === "/hello") return helloRoute(r);

    const staticFile = await serveStatic(url.pathname);
    if (staticFile) return staticFile;

    return notFoundRoute();
  }),
);

