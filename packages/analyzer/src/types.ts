export type StackFamily = "frontend-web" | "mobile" | "backend" | "fullstack" | "unknown";

export type Stack =
  | "nextjs"
  | "vite-react"
  | "react-native"
  | "expo"
  | "flutter"
  | "express"
  | "nest"
  | "fastify"
  | "fastapi"
  | "django"
  | "go"
  | "rust"
  | "unknown";

export type Language = "typescript" | "javascript" | "python" | "go" | "rust" | "dart" | "unknown";

export type Harness = "cursor" | "opencode" | "claude-code" | "antigravity" | "copilot";

export type LayerRole =
  | "modules"
  | "ui"
  | "data-layer"
  | "routes"
  | "handlers"
  | "screens"
  | "navigation"
  | "shared"
  | "config";

export interface DetectedLayer {
  role: LayerRole;
  label: string;
  path: string;
  glob: string;
  subpaths: string[];
}

export interface ProjectConventions {
  folderNaming: string;
  fileNaming: string;
  pathAlias?: string;
  entryPattern?: string;
}

export interface VerificationCommands {
  dev?: string;
  lint?: string;
  test?: string;
  typecheck?: string;
  build?: string;
}

export interface ProjectProfile {
  name: string;
  stack: Stack;
  stackFamily: StackFamily;
  language: Language;
  packageManager: string;
  devCommand: string;
  layers: DetectedLayer[];
  conventions: ProjectConventions;
  verification: VerificationCommands;
  hasExistingAgentsMd: boolean;
  scripts: Record<string, string>;
  srcRoot?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}
