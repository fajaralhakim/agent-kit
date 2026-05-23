/**
 * Optional OpenCode global plugin — registers Agent Kit workflow skills.
 * Primary install: fetch docs/install/opencode.md from project root.
 */
export default function agentKitPlugin({ client }) {
  const skillsPath = new URL("../../skills/", import.meta.url).pathname;

  client.skills.register({
    name: "agent-kit",
    path: skillsPath,
    description: "Agent Kit workflow skills (Jira, PR, Confluence, project context)",
  });
}
