import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "Demo",
    version: "1.0.0",
  });

  async init() {
    this.server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
      content: [{ type: "text", text: String(a + b) }],
    }));

    // --- Final Attempt: 'subtract' tool matching 'add' pattern ---
    this.server.tool(
      "subtract", // Tool name
      { // Raw Zod shape for parameters
        minuend: z.number().describe("The number to subtract from"),
        subtrahend: z.number().describe("The number to subtract"),
      },
      // Implementation function receives validated args destructured
      async ({ minuend, subtrahend }) => {
        return {
          content: [{ type: "text", text: String(minuend - subtrahend) }],
        };
      }
    );
    // --- End of 'subtract' tool ---
  }
}

// Export the OAuth handler as the default
export default new OAuthProvider({
  apiRoute: "/sse",
  // TODO: fix these types
  // @ts-ignore
  apiHandler: MyMCP.mount("/sse"),
  // @ts-ignore
  defaultHandler: app,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});
