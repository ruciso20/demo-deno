export function helloRoute(request: Request): Response {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") ?? "Profes";
  return new Response(`Hola, ${name}!`, {
    headers: { "content-type": "text/plain" },
  });
}
