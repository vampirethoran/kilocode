import type { KiloClient } from "@kilocode/sdk/v2/client"

/**
 * Handle permission response from the webview.
 * Calls saveAlwaysRules first (if any), then reply — sequentially to avoid races.
 */
export async function handlePermissionResponse(
  client: KiloClient,
  permissionId: string,
  response: "once" | "always" | "reject",
  approvedAlways: string[],
  deniedAlways: string[],
  workspaceDir: string,
): Promise<void> {
  // Save per-pattern rules before replying (reply deletes the pending request)
  if (approvedAlways.length > 0 || deniedAlways.length > 0) {
    await client.permission.saveAlwaysRules(
      {
        requestID: permissionId,
        directory: workspaceDir,
        approvedAlways,
        deniedAlways,
      },
      { throwOnError: true },
    )
  }

  await client.permission.reply(
    { requestID: permissionId, reply: response, directory: workspaceDir },
    { throwOnError: true },
  )
}

/**
 * Fetch all pending permissions from the backend and forward any that belong
 * to tracked sessions to the webview. Called after SSE reconnects and after
 * loading messages for a session so that missed permission.asked events are
 * recovered instead of leaving the server blocked indefinitely.
 */
export async function fetchPendingPermissions(
  client: KiloClient,
  workspaceDir: string,
  tracked: Set<string>,
  post: (msg: unknown) => void,
): Promise<void> {
  const { data } = await client.permission.list({ directory: workspaceDir })
  if (!data) return
  for (const perm of data) {
    if (!tracked.has(perm.sessionID)) continue
    post({
      type: "permissionRequest",
      permission: {
        id: perm.id,
        sessionID: perm.sessionID,
        toolName: perm.permission,
        patterns: perm.patterns,
        always: perm.always,
        args: perm.metadata,
        message: `Permission required: ${perm.permission}`,
        tool: perm.tool,
      },
    })
  }
}
