import * as vscode from "vscode"
import type { KiloClient, Event } from "@kilocode/sdk/v2/client"
import type { KiloConnectionService } from "../services/cli-backend/connection-service"

/**
 * Runtime auto-accept toggle for permissions.
 *
 * Mirrors the desktop app pattern (packages/app/src/context/permission.tsx):
 * instead of writing to the config file, we intercept `permission.asked` SSE
 * events and auto-reply "once" to each. This avoids config-layer issues
 * (merged vs global, sparse defaults) and works even when the sidebar is closed.
 */
export function registerToggleAutoApprove(
  context: vscode.ExtensionContext,
  connectionService: KiloConnectionService,
): void {
  let active = false
  // Bumped on disable to invalidate in-flight enable drains
  let generation = 0

  const unsubscribe = connectionService.onEvent((event: Event) => {
    if (!active) return
    if (event.type !== "permission.asked") return
    const client = tryGetClient(connectionService)
    if (!client) return
    const dir = getWorkspaceDirectory()
    client.permission.reply({ requestID: event.properties.id, directory: dir, reply: "once" }).catch((err) => {
      console.error("[Kilo New] toggleAutoApprove: failed to auto-reply:", err)
    })
  })

  context.subscriptions.push({ dispose: unsubscribe })

  context.subscriptions.push(
    vscode.commands.registerCommand("kilo-code.new.toggleAutoApprove", async () => {
      active = !active
      generation++
      const snapshot = generation

      if (active) {
        vscode.window.showInformationMessage("Auto-approve enabled")
        // Drain any already-pending permission requests (same as desktop app's enable())
        const client = tryGetClient(connectionService)
        if (client) {
          const dir = getWorkspaceDirectory()
          try {
            const { data: pending } = await client.permission.list({ directory: dir }, { throwOnError: true })
            for (const req of pending) {
              // Bail if toggled off while draining
              if (generation !== snapshot) break
              await client.permission.reply({ requestID: req.id, directory: dir, reply: "once" }).catch((err) => {
                console.error("[Kilo New] toggleAutoApprove: failed to drain pending:", err)
              })
            }
          } catch (err) {
            console.error("[Kilo New] toggleAutoApprove: failed to list pending permissions:", err)
          }
        }
      } else {
        vscode.window.showInformationMessage("Auto-approve disabled")
      }
    }),
  )
}

function tryGetClient(connectionService: KiloConnectionService): KiloClient | undefined {
  try {
    return connectionService.getClient()
  } catch {
    return undefined
  }
}

function getWorkspaceDirectory(): string {
  const folder = vscode.workspace.workspaceFolders?.[0]
  return folder ? folder.uri.fsPath : process.cwd()
}
