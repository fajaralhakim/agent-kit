export type Stack = "nextjs" | "vite-react" | "django" | "unknown";

export type Harness = "cursor" | "opencode" | "claude-code" | "antigravity" | "copilot";

export interface ProjectProfile {
  name: string;
  stack: Stack;
  packageManager: string;
  devCommand: string;
  paths: {
    features: string[];
    services: string[];
    components: Record<string, boolean>;
    appRouter?: boolean;
    appDir?: string;
    srcRoot?: string;
  };
  conventions: {
    featureNaming: string;
    componentNaming: string;
    hasThinRoutes: boolean;
    pathAlias?: string;
  };
  rules: {
    featureGlob?: string;
    serviceGlob?: string;
    componentGlob?: string;
    appGlob?: string;
    lintCommand?: string;
    typecheckCommand?: string;
  };
  hasExistingAgentsMd: boolean;
  scripts: Record<string, string>;
}

export interface GeneratedFile {
  path: string;
  content: string;
}
