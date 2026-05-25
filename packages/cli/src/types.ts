export interface ProfileManifest {
  id: string;
  name: string;
  version: string;
  type?: "stack" | "addon";
  detect?: {
    dependencies?: string[];
    files?: string[];
  };
  requires?: string[];
  conflicts?: string[];
  files: ProfileFile[];
  mcpRecommendations?: string[];
  mcpServers?: Record<string, McpServerConfig>;
}

export interface ProfileFile {
  src: string;
  dest: string;
  merge?: "append" | "marker";
  template?: boolean;
}

export interface McpServerConfig {
  url?: string;
  headers?: Record<string, string>;
}

export interface DetectedStack {
  stack: string | null;
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
  devCommand: string;
  isEmpty: boolean;
  isExisting: boolean;
}

export interface LockFile {
  version: string;
  agentKitVersion: string;
  installedAt: string;
  profiles: string[];
  detected: Partial<DetectedStack>;
  files: LockFileEntry[];
}

export interface LockFileEntry {
  path: string;
  checksum: string;
  profile: string;
}

export interface InstallContext {
  targetDir: string;
  detected: DetectedStack;
  variables: Record<string, string>;
}
