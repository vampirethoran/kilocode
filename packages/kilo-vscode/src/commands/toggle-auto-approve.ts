import * as vscode from "vscode"
import type { KiloClient, PermissionConfig, PermissionActionConfig } from "@kilocode/sdk/v2/client"
import type { KiloConnectionService } from "../services/cli-backend/connection-service"

const KNOWN_TOOLS = [
  "read",
  "edit",
  "glob",
  "grep",
  "list",
  "bash",
  "task",
  "external_directory",
  "lsp",
  "skill",
  "todowrite",
  "todoread",
  "question",
  "webfetch",
  "websearch",
  "codesearch",
  "doom_loop",
] as const

export function registerToggleAutoApprove(
  context: vscode.ExtensionContext,
  connectionService: KiloConnectionService,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("kilo-code.new.toggleAutoApprove", async () => {
      let client: KiloClient | undefined
      try {
        client = connectionService.getClient()
      } catch {
        vscode.window.showErrorMessage("Kilo backend is not connected. Please wait for the connection to establish.")
        return
      }
      if (!client) {
        vscode.window.showErrorMessage("Kilo backend is not connected. Please wait for the connection to establish.")
        return
      }

      try {
        const dir = getWorkspaceDirectory()
        const { data: config } = await client.config.get({ directory: dir }, { throwOnError: true })

        const perm = config.permission
        const target = isAutoApproveOn(perm) ? "ask" : "allow"
        const updated = buildToggled(perm, target)

        await client.global.config.update({ config: { permission: updated } }, { throwOnError: true })
        vscode.window.showInformationMessage(target === "allow" ? "Auto-approve enabled" : "Auto-approve disabled")
      } catch (err) {
        console.error("[Kilo New] toggleAutoApprove: failed:", err)
        vscode.window.showErrorMessage("Failed to toggle auto-approve")
      }
    }),
  )
}

function isAutoApproveOn(perm: PermissionConfig | undefined): boolean {
  if (perm === undefined || perm === null) return false
  if (typeof perm === "string") return perm === "allow"
  if (typeof perm !== "object") return false
  return KNOWN_TOOLS.every((key) => {
    const val = perm[key]
    if (val === undefined || val === null) return false
    if (typeof val === "string") return val === "allow"
    if (typeof val === "object" && val !== null) return (val as Record<string, string>)["*"] === "allow"
    return false
  })
}

function buildToggled(perm: PermissionConfig | undefined, target: PermissionActionConfig): PermissionConfig {
  // When currently a scalar or absent, toggling produces a scalar
  if (perm === undefined || perm === null || typeof perm === "string") {
    return target
  }

  // Build updated permission object preserving pattern-level exceptions
  const updated: Record<string, unknown> = {}
  for (const key of KNOWN_TOOLS) {
    const val = perm[key]
    if (val === undefined || val === null || typeof val === "string") {
      updated[key] = target
    } else if (typeof val === "object") {
      updated[key] = { ...(val as Record<string, string>), "*": target }
    }
  }
  // Handle extra keys (MCP/custom tools) already in config
  for (const [key, val] of Object.entries(perm)) {
    if (key === "__originalKeys") continue
    if (updated[key] !== undefined) continue
    if (val === undefined || val === null || typeof val === "string") {
      updated[key] = target
    } else if (typeof val === "object" && !Array.isArray(val)) {
      updated[key] = { ...(val as Record<string, string>), "*": target }
    }
  }

  return updated as PermissionConfig
}

function getWorkspaceDirectory(): string {
  const folders = vscode.workspace.workspaceFolders
  if (folders && folders.length > 0) {
    return folders[0].uri.fsPath
  }
  return process.cwd()
}
