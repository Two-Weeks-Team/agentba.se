import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../app/api/intake/route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("intake delivery after public-contact cleanup", () => {
  it("preserves both founder recipients without making a network request", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-only");
    const send = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", send);
    const response = await POST(new Request("https://agentba.se/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.0.2.1" },
      body: JSON.stringify({ email: "reader@example.com", line: "Example workload", website: "", t: 3000 }),
    }));
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledOnce();
    const payload = JSON.parse(send.mock.calls[0]![1].body);
    expect(payload.to).toEqual(["sangguen@agentba.se", "sejun@agentba.se"]);
    expect(payload.reply_to).toBe("reader@example.com");
  });
});
