export async function withLogging(
  req: Request,
  handler: (req: Request) => Promise<Response> | Response,
): Promise<Response> {
  const start = Date.now();
  console.log(`[REQ] ${req.method} ${new URL(req.url).pathname}`);
  try {
    const res = await handler(req);
    const ms = Date.now() - start;
    console.log(`[RES] ${res.status} (${ms}ms)`);
    return res;
  } catch (err) {
    console.error("[ERROR]", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}
