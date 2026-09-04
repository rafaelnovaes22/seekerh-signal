import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, describe, it } from "node:test";

import { routeRequest } from "../src/server.js";

const server = createServer(routeRequest);
let baseUrl = "";

before(async () => {
  process.env.NODE_ENV = "test";
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not expose a TCP address");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe("HTTP API", () => {
  it("reports a ready health check", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = (await response.json()) as { status: string };

    assert.equal(response.status, 200);
    assert.equal(body.status, "ready");
  });

  it("returns the evidence-backed executive demo", async () => {
    const response = await fetch(`${baseUrl}/api/demo`);
    const body = (await response.json()) as { candidateName: string; matches: unknown[] };

    assert.equal(response.status, 200);
    assert.equal(body.candidateName, "Rafael Novaes");
    assert.equal(body.matches.length, 5);
  });
});
