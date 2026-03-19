# Plan: PR #6831 Fixes — Docs Version Switcher

## 1. PR Comment Review & Proposed Responses

### Category A: Config file paths/names are wrong (3 comments, 1 fix)

**Comments:**

- [r2909559737] bot: "`kilo.json` as the recommended file contradicts the actual default path"
- [r2938161681] bot: "supported CLI config filenames table drops JSONC and repeats `kilo.json`"
- [r2938993847] @marius-kilocode: "Yes isn't it `~/.config/kilo/opencode.json`? This is incorrect."
- [r2956230682] @lambertjosh: asks about `.jsonc` versions and `~/.config/opencode/`

**Research findings:**

- The CLI does **NOT** read from `~/.config/opencode/`. It only reads from `~/.config/kilo/`.
- **Recommend `kilo.json`**: The MCP `resolveConfigPath` defaults to `kilo.json` when creating new configs, and at the project level `kilo.json` has higher merge priority than `kilo.jsonc`. While `globalConfigFile()` prefers `kilo.jsonc`, the MCP command is the primary user-facing entry point.
- Global config files supported (in `~/.config/kilo/`): `config.json`, `kilo.json`, `kilo.jsonc`, `opencode.json`, `opencode.jsonc`
- Project config files supported (root or `.kilo/`): `kilo.jsonc`, `kilo.json`, `opencode.jsonc`, `opencode.json`

**Fix:** Replace the config table in `using-in-kilo-code.md:40-43` with:

```
| Scope       | Recommended Path                      | Also supported                                                     |
| ----------- | ------------------------------------- | ------------------------------------------------------------------ |
| **Global**  | `~/.config/kilo/kilo.json`            | `kilo.jsonc`, `opencode.json`, `opencode.jsonc`, `config.json`     |
| **Project** | `./kilo.json` or `./.kilo/kilo.json`  | `kilo.jsonc`, `opencode.jsonc`, `opencode.json`                    |
```

On Windows the global path is `%USERPROFILE%\.config\kilo\kilo.json`.

---

### Category B: Broken anchor link (1 comment, 1 fix)

**Comment:** [r2909559738] bot: "Renaming heading breaks anchor — `server-transports.md` links to `#understanding-transport-types`"

**Research:** The original heading was `### Understanding Transport Types`. The PR renamed it to `## Transport Types` — a stylistic change that wasn't needed for the tab work. It breaks the existing anchor link in `server-transports.md:199`.

**Fix:** Revert the heading back to `### Understanding Transport Types`. This is simpler than chasing the rename by updating `server-transports.md`, and avoids an unnecessary change.

---

### Category C: KiloClaw nav links use redirect paths (1 comment, defer)

**Comment:** [r2938161665] bot: "KiloClaw hrefs at `/automate/kiloclaw/*` will not show as active in SideNav"

**Research:** The nav links in `automate.ts` use `/automate/kiloclaw/*` paths. Actual pages live under `/kiloclaw/*`. This causes SideNav active-state mismatches.

**Action:** Skip in this PR — it's out of scope. Note it for a follow-up.

---

### Category D: Agent Manager inaccuracies (8 comments from @marius-kilocode)

These all relate to `agent-manager.md` and fall into sub-categories:

#### D1: "Parallel mode does not exist anymore" — PARTIALLY WRONG

**Comments:** [r2939006176] and [r2939045250]

**Research:** Parallel mode **does** still exist but is now called "multi-version mode." It creates 1-4 worktrees in parallel, optionally with different models ("Compare Models"). The i18n strings say "worktrees will run in parallel."

**Fix:**

- Line 13: Remove "Parallel Mode" from shared capabilities list
- Lines 95-159: Rewrite the "Parallel Mode and Worktrees" section for the "Pre-release VSCode" tab:
  - Worktrees are the core concept (no "parallel mode" toggle)
  - Users create worktrees from the New Worktree dialog
  - Multi-version mode: create 1-4 worktrees with same prompt (optionally different models)
  - Worktree path: `.kilo/worktrees/`
  - There is also a "local" card representing the user's actual workspace

#### D2: "No automated cleanup" — CORRECT

**Comment:** [r2939041676]

**Research:** Code at `AgentManagerProvider.ts:183-184` explicitly says "Do not auto-remove stale worktrees on load." Users remove worktrees manually.

**Fix:** Lines 110-113 and 145-149: Change "cleaned up automatically" to "must be removed manually by the user (trash icon with confirmation)."

#### D3: "Agent manager manages only worktrees" — PARTIALLY CORRECT

**Comment:** [r2939030966]

**Research:** The Agent Manager has two modes: `worktree` and `local`. The LOCAL card represents the user's workspace. Sessions can exist without worktrees (local sessions). Users can also "promote" a session to create a worktree for it.

**Fix:** Update line 97 and surrounding content to reflect: worktrees + local card architecture, session promotion flow.

#### D4: "CLI prerequisite not needed" — CORRECT

**Comment:** [r2939011995] + lambertjosh's empty suggestion [r2956239960]

**Research:** The pre-release extension bundles the CLI binary — users don't need to install it separately.

**Fix:** Remove line 29 ("Install/update the Kilo Code CLI") from the "Pre-release VSCode" prerequisites tab.

#### D5: "Code review is built in" — ALREADY DOCUMENTED

**Comment:** [r2939056196]

**Research:** Lines 161-180 already document the built-in diff panel and code review. The comment seems to confirm the docs are correct but notes that the button-based flow should be mentioned.

**Fix:** Minor — add that users click the "Review" button to open a tab with changes where they can leave inline comments.

#### D6: "Shortcuts are incomplete" — CORRECT

**Comment:** [r2939058998]

**Research:** The shortcut table at lines 201-206 only lists 3 shortcuts. The actual list from `package.json` has 15+ shortcuts. There's a shortcut helper dialog (`Cmd+Shift+/`).

**Fix:** Expand the shortcuts table to include all shortcuts from the keybinding map, or at minimum reference the shortcut helper: "Press `Cmd+Shift+/` to see all shortcuts."

#### D7: "Remove worktree path `.kilocode/`" — CORRECT

**Comment:** [r2939063815] — suggestion to delete the `.kilocode/worktrees/` path reference.

**Research:** The new extension uses `.kilo/worktrees/`, not `.kilocode/worktrees/`. The `.kilocode/` reference at line 124-135 is wrong.

**Fix:** Change `.kilocode/worktrees/` to `.kilo/worktrees/` throughout.

---

### Category E: VersionContext fallback (1 comment, defer)

**Comment:** [r2909147050] bot (outdated): "Version selection doesn't fall back to current page's platform"

**Research:** Despite initially appearing outdated, the API confirms this comment is NOT marked outdated, and the issue is still valid. There is no global platform/version context — no `VersionContext`, no `usePlatform` hook, no persisted state. Each page's `Tabs` component starts on the first tab (Classic/VSCode). Users on the pre-release extension must re-select their tab on every page navigation. The `platform` frontmatter is only used by `PageVersionSwitcher` to show a banner on platform-specific pages — it's not connected to `Tabs` at all.

**Action:** Add to follow-up plan — implement a persisted platform preference (e.g., localStorage) that `Tabs` reads to default to the user's chosen platform.

---

### Category F: Other bot observations (from summary comment)

- Stale links to `/docs/automate/mcp/using-in-cli` in `automate/index.md:39` and `cli.md:171` — **fix these links to point to `/docs/automate/mcp/using-in-kilo-code`**
- ChatGPT Plus/Pro guidance conflict — **defer**, not related to version switcher

---

### Category G: Resolved comments (already handled)

- [r2938161670] Typo "Demostrating" — resolved
- [r2939004550] Worktree `.git/info/exclude` wording — resolved
- [r2939014377] "git enabled project" — resolved
- [r2939019884] and [r2939022256] — resolved
- [r2939064782] — resolved

---

## 2. Config Directory Research Answer

**Does the CLI read from `~/.config/opencode/`?** **No.**

The app name is hardcoded to `"kilo"` in `packages/opencode/src/global/index.ts:7`. The base config path is always `$XDG_CONFIG_HOME/kilo` (defaults to `~/.config/kilo/`).

The CLI does read filenames with "opencode" in them (`opencode.json`, `opencode.jsonc`) for upstream compatibility, but these files must be inside `~/.config/kilo/`, not `~/.config/opencode/`.

It also searches for `.opencode/` subdirectories in the project tree and home directory (alongside `.kilo/` and `.kilocode/`), reading `opencode.json`/`opencode.jsonc` from within them.

---

## 3. Rename "Classic" / "New Extension" to "VSCode" / "VSCode (Pre-release)"

### Tab label mapping

| Current               | New                          | Notes                                                                 |
| --------------------- | ---------------------------- | --------------------------------------------------------------------- |
| `Classic Extension`   | `VSCode`                     | Current GA release extension                                          |
| `New Extension`       | `VSCode (Pre-release)`       | Pre-release extension on marketplace (standalone tab, extension-only) |
| `New Extension & CLI` | `VSCode (Pre-release) & CLI` | Compound tab — shared behavior/config (31 instances across 13 files)  |
| `New CLI & Extension` | `VSCode (Pre-release) & CLI` | Normalize to same compound format                                     |
| `CLI`                 | `CLI`                        | No change — the CLI is stable, not pre-release                        |

### At GA, the mapping becomes

| Pre-GA                       | Post-GA         |
| ---------------------------- | --------------- |
| `VSCode`                     | `Legacy VSCode` |
| `VSCode (Pre-release)`       | `VSCode`        |
| `VSCode (Pre-release) & CLI` | `VSCode & CLI`  |

### Files to change

Global find-and-replace across all `.md` files in `packages/kilo-docs/pages/` plus `SideNav.tsx` badges:

1. `"New Extension & CLI"` → `"VSCode (Pre-release) & CLI"` (do this FIRST — compound label, 31 instances)
2. `"New CLI & Extension"` → `"VSCode (Pre-release) & CLI"` (normalize variant, if any)
3. `"New Extension"` → `"VSCode (Pre-release)"` (standalone tab labels, AFTER compound is done)
4. `"Classic Extension"` → `"VSCode"` (tab labels)
5. SideNav `PlatformBadge`: "Classic" pill → "VSCode" pill, "New" pill → "Pre-release" pill
6. `PLAN-docs-version-switcher.md` tab naming convention table

### Prose references — MINIMAL CHANGE STRATEGY

**Both extensions are referred to as "the VSCode extension" in prose** (not "the Classic extension" or "the Pre-release extension"). The only place the distinction appears is:

- **Tab headings**: `VSCode` vs `VSCode (Pre-release)` vs `VSCode (Pre-release) & CLI`
- **Installation instructions**: Where users are told specifically to install the pre-release version from the marketplace

This means at GA, only the tab headings need to change (`VSCode` → `Legacy VSCode`, `VSCode (Pre-release)` → `VSCode`). No prose changes needed at GA.

Prose changes to make now:

**Generic prose (inside tabs, no distinction needed):**

- `"the Classic extension"` → `"the VSCode extension"`
- `"the New extension"` → `"the VSCode extension"`

**Contrastive prose (outside tabs, intro paragraphs and callouts that explain why tabs exist):**
Reference the tab labels directly since they sit right above the tab blocks:

- `"In the **Classic Extension**..."` → `"In the **VSCode** version..."`
- `"In the **New Extension & CLI**..."` → `"In the **VSCode (Pre-release) & CLI** version..."`
- `"The Classic Extension calls these **modes**"` → `"The **VSCode** version calls these **modes**"`
- `"the New Extension and CLI call them **agents**"` → `"the **VSCode (Pre-release) & CLI** version calls them **agents**"`

All ~15 contrastive references are outside tabs (intro paragraphs, callout boxes, shared sections between tab blocks). They introduce/explain the tabbed content below, so referencing tab labels is natural.

**Migration context:**

- `"from the Classic extension"` → `"from the VSCode extension"` (refers to current GA)

**Meta descriptions (frontmatter):**

- `"(Classic)"` → `"(VSCode)"`
- `"(New Extension & CLI)"` → `"(VSCode (Pre-release) & CLI)"`

---

## 4. Minimal Change Strategy

To keep this PR focused, the plan is:

### DO in this PR:

1. Fix config table (Category A) — factually wrong, small change
2. Fix broken anchor (Category B) — 1 line
3. Fix stale links to `/using-in-cli` (Category F) — 2 lines
4. Fix Agent Manager factual errors (Category D) — required for accuracy
5. Rename tab labels globally (item 3 above) — mechanical find-replace
6. Remove CLI prerequisite line from agent-manager.md

### DEFER to follow-up:

- KiloClaw nav path fix (Category C) — pre-existing, separate issue
- ChatGPT Plus/Pro guidance conflict — separate concern
- VersionContext fallback (Category E) — already outdated
- Expanding keyboard shortcuts table fully — low priority, can reference helper dialog for now

---

## Full Diff Review — Additional Factual Errors Found

Beyond the PR review comments, a thorough code-verified audit found **30+ additional factual errors**. Organized by severity:

### HIGH — Config/command won't work as documented

| #   | File                                | Line(s)        | Error                                                                                                                                                               | Fix                                                     |
| --- | ----------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | `ai-providers/bedrock.md`           | 84-86          | Provider ID `"bedrock"` — actual is `"amazon-bedrock"`                                                                                                              | Change provider ID                                      |
| 2   | `ai-providers/vertex.md`            | 55-57          | Env var `GOOGLE_CLOUD_REGION` doesn't exist — actual is `GOOGLE_CLOUD_LOCATION` or `VERTEX_LOCATION` (NOT `GOOGLE_VERTEX_LOCATION` — that's a derived internal var) | Fix to `GOOGLE_CLOUD_LOCATION`                          |
| 3   | `ai-providers/sap-ai-core.md`       | 111-116        | Env vars wrong (`SAP_AI_CORE_*`) — actual vars: `AICORE_SERVICE_KEY` (JSON), `AICORE_DEPLOYMENT_ID`, `AICORE_RESOURCE_GROUP`                                        | Rewrite env var section with all 3 vars                 |
| 4   | `ai-providers/claude-code.md`       | 59             | `claude auth login` doesn't exist — actual is `claude setup-token`                                                                                                  | Fix command                                             |
| 5   | `ai-providers/ollama.md`            | 99-112         | No `"ollama"` provider in CLI; config won't load models                                                                                                             | Note custom provider setup or document correctly        |
| 6   | `kilocodeignore.md`                 | 128-129        | Says "first matching rule wins" — code uses `findLast()` (last-match-wins)                                                                                          | Reverse                                                 |
| 7   | `kilocodeignore.md`                 | 54-64, 152-163 | `watcher.ignore` wrongly nested under `"config"` — should be top-level                                                                                              | Remove wrapper                                          |
| 8   | `agent-manager.md`                  | 124-135        | New Extension worktree path says `.kilocode/` — actual is `.kilo/`                                                                                                  | Fix path + directory tree (Classic tab is out of scope) |
| 9   | `using-in-kilo-code.md`             | 235            | "SSE Transport (Classic Extension Only)" — CLI also supports SSE as fallback                                                                                        | Remove "Classic Only"                                   |
| 10  | `ai-providers/fireworks.md`         | CLI tab        | Provider ID `"fireworks"` — actual is `"fireworks-ai"`                                                                                                              | Fix provider ID                                         |
| 11  | `ai-providers/chutes-ai.md`         | CLI tab        | Provider ID `"chutes-ai"` — actual is `"chutes"`                                                                                                                    | Fix provider ID                                         |
| 12  | `ai-providers/moonshot.md`          | CLI tab        | Provider ID `"moonshot"` — actual is `"moonshotai"`                                                                                                                 | Fix provider ID                                         |
| 13  | `ai-providers/vercel-ai-gateway.md` | CLI tab        | Provider ID `"vercel-ai-gateway"` — actual is `"vercel"`. Env var `VERCEL_AI_GATEWAY_API_KEY` — actual is `AI_GATEWAY_API_KEY`                                      | Fix both                                                |
| 14  | `ai-providers/ovhcloud.md`          | CLI tab        | Env var `OVH_AI_ENDPOINTS_ACCESS_TOKEN` — actual is `OVHCLOUD_API_KEY`                                                                                              | Fix env var                                             |
| 15  | `ai-providers/glama.md`             | CLI tab        | Provider `"glama"` does not exist in CLI engine at all — config won't work                                                                                          | Remove CLI tab or note unsupported                      |
| 16  | `ai-providers/unbound.md`           | CLI tab        | Provider `"unbound"` does not exist in CLI engine at all — config won't work                                                                                        | Remove CLI tab or note unsupported                      |
| 17  | `auto-approving-actions.md`         | 460            | Says "first matching rule wins" — code uses `findLast()` (last-match-wins). Same bug as kilocodeignore.md                                                           | Reverse                                                 |

### MEDIUM — Misleading or functionally wrong

| #   | File                        | Line(s)  | Error                                                                                                   | Fix                                     |
| --- | --------------------------- | -------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 10  | `context-mentions.md`       | 142-143  | "Selection" and "Diagnostics" listed as automatic editor context — CONFIRMED neither in `EditorContext` | Remove rows or clarify code-action-only |
| 11  | `context-mentions.md`       | 128      | Claims "no special `@` syntax" — CONFIRMED both extension AND CLI TUI have `@`-mention autocomplete     | Acknowledge `@` mentions exist          |
| 12  | `chat-interface.md`         | 101      | Same `@`-mention claim                                                                                  | Same fix                                |
| 13  | `chat-interface.md`         | 115      | `--file` flag described generically — CONFIRMED only on `kilo run`, not TUI                             | Clarify "use `kilo run -f`"             |
| 14  | `context-mentions.md`       | 183      | Same `--file` issue                                                                                     | Same fix                                |
| 15  | `browser-use.md`            | 239      | Headless "(default: enabled)" — actual default is `false`                                               | Fix to "(default: disabled)"            |
| 16  | `using-in-kilo-code.md`     | 166, 230 | Timeout default "5000" — actual is 30000ms                                                              | Fix                                     |
| 17  | `using-in-kilo-code.md`     | 327-331  | MCP CLI commands table missing `logout` and `debug`                                                     | Add                                     |
| 18  | `claude-code.md`            | 70-86    | CLI tab shows Anthropic API config on Claude Code page                                                  | Clarify or fix                          |
| 19  | `agents-md.md`              | 186-189  | `KILO_DISABLE_EXTERNAL_SKILLS` described as disabling agent files — only disables skills                | Fix description                         |
| 20  | `custom-modes.md`           | 601, 816 | Claims `architect` has "native agent equivalent" — no such built-in                                     | Remove `architect`                      |
| 21  | `orchestrator-mode.md`      | 55       | Lists `docs` as built-in subagent — it's not                                                            | Fix examples                            |
| 22  | `auto-approving-actions.md` | defaults | Claims `.env` edit protection — only `read` has `.env` rules; edit is allowed by default                | Fix to say "reading .env files"         |
| 23  | `auto-approving-actions.md` | defaults | Missing `*.env.*` pattern and `*.env.example` allow-override from defaults description                  | Add full pattern list                   |
| 24  | `auto-approving-actions.md` | tables   | `question`, `plan_enter`, `plan_exit` permissions omitted from tool permission tables                   | Add (or note they're agent-internal)    |
| 25  | `auto-approving-actions.md` | example  | "Full Configuration Example" presented as defaults but is actually a custom config                      | Clarify it's an example, not defaults   |
| 26  | `auto-approving-actions.md` | n/a      | No mention of "ask" fallback when no rule matches at all                                                | Add note about fallback behavior        |
| 27  | `setup-authentication.md`   | intro    | "Opens your browser" — only OAuth providers do this; API key providers prompt in terminal               | Soften to "may open browser"            |

### LOW — Minor inaccuracies, omissions, inconsistencies

| #   | File                      | Line(s) | Error                                                                                                         | Fix                             |
| --- | ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 28  | `model-selection.md`      | 31      | Tab label `"New CLI"` vs `"CLI"`                                                                              | Fix label                       |
| 29  | `checkpoints.md`          | 43      | `config.snapshot` should be just `snapshot`                                                                   | Fix                             |
| 30  | `code-actions.md`         | 118-120 | Terminal action names abbreviated vs actual                                                                   | Use exact labels                |
| 31  | `using-modes.md`          | 149     | `mcp` listed as built-in tool — MCP tools come from servers                                                   | Replace with "MCP server tools" |
| 32  | `custom-instructions.md`  | 80-81   | `CONTEXT.md` listed without deprecation note                                                                  | Add note                        |
| 33  | `settings/index.md`       | new tab | Variable substitution example shows `provider.apiKey` but correct nesting is `provider.<name>.options.apiKey` | Fix nesting or add note         |
| 34  | `settings/index.md`       | new tab | Config precedence section copy-pasted between New Extension and CLI tabs (redundant)                          | Consider sharing outside tabs   |
| 35  | `setup-authentication.md` | shared  | "over 30 providers" weakened to "many providers" — unnecessary precision loss                                 | Revert to original              |
| 36  | `vscode.md`               | new tab | "Everything in the Classic extension, plus:" implies full parity — unverified                                 | Verify with PM or soften claim  |

### Note: `~/.config/kilo/` path is correct on ALL platforms

The CLI uses the `xdg-basedir` library which resolves to `~/.config/` on all platforms (macOS, Linux, Windows) unless `XDG_CONFIG_HOME` is set. On Windows this becomes `C:\Users\<username>\.config\kilo\`. The earlier concern about macOS using `~/Library/Application Support/` was wrong — that's the native macOS convention but `xdg-basedir` does NOT follow it. The documented `~/.config/kilo/` path is correct everywhere.

For Windows, we should add `C:\Users\<username>\.config\kilo\` alongside the `~/.config/kilo/` reference (or just note "On Windows: `%USERPROFILE%\.config\kilo\`").

---

### Removed from scope (Classic/legacy extension only)

These errors are in Classic Extension tabs — out of scope per the principle of not changing legacy content:

- `agent-manager.md:108` — Classic worktree path (says `.kilo/`, should be `.kilocode/`)
- `using-in-kilo-code.md:243-255` — Classic SSE example missing `"type": "sse"` field
- `auto-approving-actions.md:412` — "Most tools default to allow" claim (CONFIRMED CORRECT — `agent.ts` ships `"*": "allow"` base)

### Removed: not 100% confident or out-of-scope

- `ai-providers/claude-code.md:59` — `claude auth login` vs `claude setup-token` (external tool, not our codebase)
- `ai-providers/ollama.md:99-112` — unclear if custom provider setup is documented intentionally
- `ai-providers/anthropic.md:49-56` — `"env"` config technically works, just suboptimal

---

## Legacy Content Changes Found in Diff (Principle Violation)

The full diff review found **97 unnecessary changes** beyond tab-wrapping. These should all be reverted to keep the PR focused on adding new content only.

### A. Character encoding bugs (MUST FIX — 3 instances)

| File             | Lines                               | Issue                                                               |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------- |
| `checkpoints.md` | 35, new tab content, shared section | `→` corrupted to `â` and `—` corrupted to `â`. Appears in 3 places. |

### B. Heading renames (~25 instances — REVERT ALL)

These headings were renamed without any tab-related reason. Renames break existing anchor links and bookmarks.

| File                     | Original                                          | Changed to                                                                                                              |
| ------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `using-in-kilo-code.md`  | `### Understanding Transport Types`               | `## Transport Types`                                                                                                    |
| `using-in-kilo-code.md`  | `## Configuring MCP Servers`                      | `## Configuration Location`                                                                                             |
| `using-in-kilo-code.md`  | `#### STDIO Transport`                            | `### STDIO / Local Servers`                                                                                             |
| `using-in-kilo-code.md`  | `#### Streamable HTTP Transport`                  | `### Streamable HTTP / Remote Servers`                                                                                  |
| `using-in-kilo-code.md`  | `## Platform-Specific MCP Configuration Examples` | `## Examples`                                                                                                           |
| `using-in-kilo-code.md`  | Title: `Using MCP in Kilo Code`                   | `Configuring MCP Servers`                                                                                               |
| `agent-manager.md`       | `## Sending messages, approvals, and control`     | `## Sending Messages and Controls`                                                                                      |
| `agent-manager.md`       | `## Resuming an existing session`                 | `## Resuming Sessions`                                                                                                  |
| `agent-manager.md`       | `## Parallel Mode`                                | `## Parallel Mode and Worktrees`                                                                                        |
| `agent-manager.md`       | `### Resuming Sessions`                           | `### Resuming Parallel Sessions`                                                                                        |
| `agent-manager.md`       | `## Remote sessions (Cloud)`                      | `## Remote Sessions (Cloud)`                                                                                            |
| `agent-manager.md`       | `## Related features`                             | `## Related Features`                                                                                                   |
| `custom-modes.md`        | Title: `Custom Modes`                             | `Custom Modes & Agents`                                                                                                 |
| `custom-modes.md`        | `## Why Use Custom Modes?`                        | `## Why Customize?`                                                                                                     |
| `custom-modes.md`        | `## YAML Configuration Format (Preferred)`        | `## Configuration Format` + `### YAML Format (Preferred)`                                                               |
| `custom-modes.md`        | `## YAML/JSON Property Details`                   | `## Property Reference`                                                                                                 |
| `custom-modes.md`        | `## Understanding Regex in Custom Modes`          | `## Understanding Regex & File Permissions`                                                                             |
| `code-actions.md`        | `## Kilo Code's Code Actions`                     | `## Available Code Actions`                                                                                             |
| `code-actions.md`        | `### 1. From the Lightbulb (💡)`                  | `### 1. From the Lightbulb`                                                                                             |
| `custom-instructions.md` | `#### Mode-Specific Instructions`                 | `### Mode-Specific Instructions`                                                                                        |
| `custom-instructions.md` | `## Mode-Specific Instructions from Files`        | `### Mode-Specific Instructions from Files`                                                                             |
| `custom-rules.md`        | `## Managing Rules Through the UI`                | `## Managing Rules`                                                                                                     |
| `using-modes.md`         | `### Understanding /newtask vs /smol`             | `#### Understanding /newtask vs /smol`                                                                                  |
| `context-condensing.md`  | `### When to Condense`                            | `### When to Condense or Compact`                                                                                       |
| `skills.md`              | `## Using Symlinks`                               | `### Using Symlinks`                                                                                                    |
| `quickstart.md`          | `## Conclusion`                                   | `## Next Steps`                                                                                                         |
| `settings/index.md`      | `## Export/Import/Reset Settings` (each `##`)     | Demoted to `###` — **ACCEPTABLE**: structurally necessary (content now nested under `## Managing Settings` tab heading) |

### C. Content deletion — existing content removed (REVERT)

| File                      | What was deleted                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `groq.md`                 | "Tips and Notes" section (4 bullet points about Groq performance/pricing) — entire section gone               |
| `agent-manager.md`        | Cancel vs Stop explanation (cooperative stop vs force-terminate)                                              |
| `agent-manager.md`        | "If a session is not currently running, the Agent Manager will spawn a new CLI process" detail                |
| `agent-manager.md`        | BYOK troubleshooting bullet                                                                                   |
| `chat-interface.md`       | Detailed "Direct Selection" and "Edit Before Sending" numbered instructions for suggested responses           |
| `chat-interface.md`       | "This feature streamlines the interaction" concluding sentence                                                |
| `code-actions.md`         | "This can save you time and help you write better code."                                                      |
| `code-actions.md`         | "(More details below.)" from Add to Context bullet                                                            |
| `code-actions.md`         | "Kilo Code provides the following Code Actions:" intro sentence                                               |
| `installing.md`           | Feature parity tracking link and "Current Status" section                                                     |
| `quickstart.md`           | "Conclusion" learning summary (what you learned: natural language, approval, iteration)                       |
| `custom-rules.md`         | "Rules can be managed through both the file system and the built-in UI interface."                            |
| `custom-rules.md`         | UI Support callout (moved into Classic tab — borderline)                                                      |
| `kilocodeignore.md`       | "If no .kilocodeignore file exists, Kilo Code can access all files in the workspace."                         |
| `using-modes.md`          | "Users often confuse `/newtask` and `/smol`. Here's the key difference:"                                      |
| `skills.md`               | "after adding it or reloading VSCode" from verification tip                                                   |
| `autocomplete/index.md`   | "It offers both automatic and manual triggering options."                                                     |
| `setup-authentication.md` | Original intro: "When you install Kilo Code, you'll be prompted to sign in..." (replaced with different text) |

### D. Wording changes to existing content (REVERT)

| File                      | Original                                                                                                                       | Changed to                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `agent-manager.md`        | "dedicated control panel for running and supervising Kilo Code agents as interactive CLI processes"                            | "dedicated panel for running, supervising, and orchestrating multiple Kilo Code agent sessions from within VS Code" |
| `chat-interface.md`       | "lives in VS Code"                                                                                                             | Removed                                                                                                             |
| `chat-interface.md`       | "Use @ mentions - Reference files and code directly with `@filename`"                                                          | "Reference files - Point Kilo to the files you're working with"                                                     |
| `chat-interface.md`       | "Use `@` to reference specific files"                                                                                          | "Reference specific files so Kilo knows where to look"                                                              |
| `chat-interface.md`       | "Open the chat panel"                                                                                                          | "Open the chat"                                                                                                     |
| `shell-integration.md`    | "is a key feature that enables...bidirectional communication"                                                                  | Rewritten to generic tab-intro                                                                                      |
| `code-actions.md`         | "a powerful feature of VS Code"                                                                                                | "a VS Code feature"                                                                                                 |
| `context-condensing.md`   | "**Context Condensing** is a feature that"                                                                                     | "Context management features"                                                                                       |
| `custom-modes.md`         | "custom modes"                                                                                                                 | "custom behavioral profiles"                                                                                        |
| `custom-modes.md`         | "modes" in 4 bullets                                                                                                           | "profiles"                                                                                                          |
| `custom-modes.md`         | "Conceptual Description" column header                                                                                         | "Description"                                                                                                       |
| `custom-modes.md`         | "YAML is now the preferred"                                                                                                    | "YAML is the preferred"                                                                                             |
| `custom-instructions.md`  | "specific Extension behaviors"                                                                                                 | "specific behaviors"                                                                                                |
| `custom-instructions.md`  | "basic role definition"                                                                                                        | "default role definition"                                                                                           |
| `custom-rules.md`         | "primarily loaded from"                                                                                                        | "loaded from"                                                                                                       |
| `custom-rules.md`         | "may be subject to change"                                                                                                     | "may be removed"                                                                                                    |
| `setup-authentication.md` | "over 30 providers"                                                                                                            | "many providers"                                                                                                    |
| `autocomplete/index.md`   | "Autocomplete analyzes"                                                                                                        | "Autocomplete uses a ghost text service to analyze"                                                                 |
| `browser-use.md`          | "a built-in browser"                                                                                                           | "a built-in Puppeteer browser"                                                                                      |
| `checkpoints.md`          | "Git commits"                                                                                                                  | "Git tree objects"                                                                                                  |
| `checkpoints.md`          | "Checkpoint Service"                                                                                                           | "Snapshot Service"                                                                                                  |
| `checkpoints.md`          | "uses the `simple-git` library, which relies on Git command-line tools"                                                        | "uses Git command-line tools"                                                                                       |
| `using-modes.md`          | Slash commands: `/architect, /ask, /debug, /code`                                                                              | Reordered to `/code, /architect, /ask, /debug`                                                                      |
| `using-modes.md`          | "Toggle command/Keyboard shortcut: Use the keyboard shortcut below, applicable to your operating system. Each press cycles..." | "Keyboard shortcut: Each press cycles through available modes in sequence."                                         |

### E. Formatting/style changes (REVERT)

| File                     | Change                                                                          |
| ------------------------ | ------------------------------------------------------------------------------- |
| `code-actions.md`        | 💡 emoji removed (2 instances)                                                  |
| `custom-modes.md`        | 💻🪲❓🏗️🪃 emojis removed from built-in modes list                              |
| `custom-modes.md`        | `mode—and` → `mode — and` (em-dash spacing)                                     |
| `custom-instructions.md` | Indentation reformatted (4-space indent → no indent), `*` bullets → `-` bullets |
| `skills.md`              | `-` hyphens → `—` em-dashes in priority rules (2 instances)                     |
| `skills.md`              | "VS" → "VSCode"                                                                 |
| `browser-use.md`         | `browser_action` gained backtick formatting                                     |

### F. Content reordering (review case-by-case)

| File                    | What moved                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `using-in-kilo-code.md` | "Editing MCP Settings Files" moved to later "Managing" section. Troubleshooting callout moved to top. SSE deprecation text → callout box. |
| `orchestrator-mode.md`  | YouTube video moved into Classic tab. Numbered list restructured under new heading.                                                       |
| `using-modes.md`        | YouTube video moved into Classic tab. "Custom Modes" section moved after tabs.                                                            |
| `checkpoints.md`        | "Limitations" section moved from within content to after tabs. "Automatic Cleanup" (new-platform-only) added to shared section.           |
| `installing.md`         | CLI and JetBrains tabs reordered.                                                                                                         |

### Summary

The principle for this PR should be: **wrap existing content in tabs, add new tabs, change nothing else.** The 97 findings break down as:

- ~3 encoding bugs (must fix)
- ~25 heading renames (revert)
- ~17 content deletions (revert)
- ~24 wording changes (revert)
- ~7 formatting/style changes (revert)
- ~5 content reorderings (review case-by-case, some may be needed for tab structure)

---

## Follow-Up Plan (post-PR)

Items deferred from this PR for separate follow-up:

1. KiloClaw nav path active-state issue (pre-existing)
2. ChatGPT Plus/Pro guidance conflict between pages
3. Full keyboard shortcuts audit for Agent Manager
4. Review all 30 AI provider pages for provider ID / env var accuracy (only 6 checked in depth)
5. Verify Classic extension content wasn't unintentionally changed in the generalizations flagged above
6. Agent Manager `Cmd+Shift+/` "Show Shortcuts" keybinding conflicts with macOS system "Show Help menu" shortcut — the keybinding is correct in `package.json` and `format-keybinding.ts:68`, but macOS intercepts it before it reaches VS Code. File as a bug.
7. Implement persisted platform/version preference — currently no global context exists; each page's Tabs component defaults to the first tab (VSCode/Classic). Users must re-select their tab on every page navigation. A `localStorage`-backed preference that `Tabs` reads would fix this.

---

## Implementation Steps

### Step 1: Global tab label rename (mechanical find-replace)

Order matters — do compound labels first to avoid partial matches:

1. `{% tab label="New Extension & CLI" %}` → `{% tab label="VSCode (Pre-release) & CLI" %}` (31 instances)
2. `{% tab label="New CLI & Extension" %}` → `{% tab label="VSCode (Pre-release) & CLI" %}` (if any)
3. `{% tab label="New Extension" %}` → `{% tab label="VSCode (Pre-release)" %}` (remaining standalone)
4. `{% tab label="Classic Extension" %}` → `{% tab label="VSCode" %}` (all instances)
5. SideNav `PlatformBadge` in `SideNav.tsx`: "Classic" → "VSCode", "New" → "Pre-release"

### Step 2: Prose references (~30 instances)

- Update contrastive intro paragraphs to reference tab labels: "the **VSCode** version" / "the **VSCode (Pre-release) & CLI** version"
- Update generic in-tab prose: "the Classic/New extension" → "the VSCode extension"
- Update migration references: "from the Classic extension" → "from the VSCode extension"
- Update frontmatter descriptions

### Step 3: Fix config table (`using-in-kilo-code.md:38-43`)

Replace with correct filenames: `kilo.jsonc` as recommended, list all supported names, confirm `~/.config/kilo/`

### Step 4: Fix broken anchor (`server-transports.md:199`)

`#understanding-transport-types` → `#transport-types`

### Step 5: Fix stale links

- `automate/index.md` and `cli.md`: `/using-in-cli` → `/using-in-kilo-code`

### Step 6: Rewrite `agent-manager.md` VSCode (Pre-release) tab content

- Remove CLI prerequisite (line 29) — CLI is bundled
- Fix worktree paths: `.kilocode/worktrees/` → `.kilo/worktrees/`
- Replace "Parallel Mode" with worktree-centric architecture:
  - Users create worktrees from New Worktree dialog
  - Multi-version mode: 1-4 worktrees with same prompt, optional model comparison ("Compare Models")
  - Local card: represents user's actual workspace (sessions without worktrees)
  - Session promotion: create a worktree from an existing session
- Fix cleanup: "cleaned up automatically" → manual removal (trash icon with confirmation), stale detection via poller
- Code review: mention button-based flow to open review tab with inline commenting, `Cmd+Enter` to send comments to chat
- Shortcuts: expand table OR add reference to shortcut helper dialog (`Cmd+Shift+/`)
- Remove shared intro line about "Parallel Mode" (line 13)

### Step 7: Update `PLAN-docs-version-switcher.md` tab naming convention
