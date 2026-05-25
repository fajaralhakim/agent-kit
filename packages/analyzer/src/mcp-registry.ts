import type { Harness } from "./types.js";

export interface McpHarnessConfig {
  type: "json";
  key: string;
  config: Record<string, unknown>;
}

export interface McpServerDefinition {
  id: string;
  name: string;
  description: string;
  url?: string;
  docsUrl?: string;
  placeholdersDoc?: string;
  envVars?: string[];
  harness: Partial<Record<Harness, McpHarnessConfig>>;
}

/**
 * Embedded MCP registry — mirrors mcp/registry.json at the repo root.
 * Kept inline so the bundled analyzer works without filesystem access to the package install path.
 */
export const MCP_REGISTRY: McpServerDefinition[] = [
  {
    id: "atlassian-rovo",
    name: "Atlassian Rovo",
    description: "Official Atlassian MCP for Jira and Confluence (OAuth 2.1 on first connect).",
    url: "https://mcp.atlassian.com/v1/mcp",
    docsUrl: "https://www.atlassian.com/platform/mcp",
    placeholdersDoc: ".agents/atlassian.md",
    harness: {
      cursor: {
        type: "json",
        key: "mcpServers.atlassian-rovo",
        config: {
          command: "npx",
          args: ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/mcp"],
        },
      },
      opencode: {
        type: "json",
        key: "mcp.atlassian-rovo",
        config: {
          type: "remote",
          url: "https://mcp.atlassian.com/v1/mcp",
        },
      },
      "claude-code": {
        type: "json",
        key: "mcpServers.atlassian-rovo",
        config: {
          url: "https://mcp.atlassian.com/v1/mcp",
        },
      },
    },
  },
  {
    id: "figma",
    name: "Figma",
    description: "Design context, components, and assets from Figma files.",
    docsUrl: "https://developers.figma.com/docs/figma-mcp-server/",
    placeholdersDoc: ".agents/figma.md",
    envVars: ["FIGMA_API_TOKEN"],
    harness: {
      cursor: {
        type: "json",
        key: "mcpServers.figma",
        config: {
          command: "npx",
          args: ["-y", "figma-developer-mcp", "--figma-api-key=YOUR_FIGMA_TOKEN"],
        },
      },
      opencode: {
        type: "json",
        key: "mcp.figma",
        config: {
          type: "local",
          command: ["npx", "-y", "figma-developer-mcp", "--figma-api-key=YOUR_FIGMA_TOKEN"],
        },
      },
      "claude-code": {
        type: "json",
        key: "mcpServers.figma",
        config: {
          command: "npx",
          args: ["-y", "figma-developer-mcp", "--figma-api-key=YOUR_FIGMA_TOKEN"],
        },
      },
    },
  },
  {
    id: "context7",
    name: "Context7",
    description: "Library and framework documentation lookup.",
    docsUrl: "https://context7.com",
    harness: {
      cursor: {
        type: "json",
        key: "mcpServers.context7",
        config: {
          url: "https://mcp.context7.com/mcp",
        },
      },
      opencode: {
        type: "json",
        key: "mcp.context7",
        config: {
          type: "remote",
          url: "https://mcp.context7.com/mcp",
        },
      },
      "claude-code": {
        type: "json",
        key: "mcpServers.context7",
        config: {
          url: "https://mcp.context7.com/mcp",
        },
      },
    },
  },
];

export function getMcpServer(id: string): McpServerDefinition | undefined {
  return MCP_REGISTRY.find((s) => s.id === id);
}
