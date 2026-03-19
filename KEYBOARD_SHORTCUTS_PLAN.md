# Keyboard Shortcuts Integration Plan

> Issue: [#6973](https://github.com/Kilo-Org/kilocode/issues/6973) — Make sure all shortcuts from the old extension are ported
> Closed bot PR: [#6993](https://github.com/Kilo-Org/kilocode/pull/6993) — feat(vscode): add missing keybindings from legacy extension (not merged)
> Date: 2026-03-19

---

## Table of Contents

1. [Current State of the Extension](#1-current-state-of-the-extension)
2. [What the Legacy Extension Had](#2-what-the-legacy-extension-had)
3. [What the Desktop App / TUI Have](#3-what-the-desktop-app--tui-have)
4. [Gap Analysis](#4-gap-analysis)
5. [Bot PR #6993 Review — What It Got Right and Wrong](#5-bot-pr-6993-review--what-it-got-right-and-wrong)
6. [Integration Plan](#6-integration-plan)
7. [Detailed Implementation Specs](#7-detailed-implementation-specs)
8. [Conflict Analysis](#8-conflict-analysis)
9. [Out of Scope / Deferred](#9-out-of-scope--deferred)

---

## 1. Current State of the Extension

### 1.1 Existing Keybindings (26 total)

| Shortcut          | Mac             | Command                          | When                                            | Category      |
| ----------------- | --------------- | -------------------------------- | ----------------------------------------------- | ------------- |
| `Ctrl+Shift+A`    | `Cmd+Shift+A`   | `focusChatInput`                 | _(always)_                                      | Global        |
| `Ctrl+Shift+M`    | `Cmd+Shift+M`   | `agentManagerOpen`               | _(always)_                                      | Global        |
| `Ctrl+K Ctrl+A`   | `Cmd+K Cmd+A`   | `addToContext`                   | `editorTextFocus && editorHasSelection`         | Editor        |
| `Ctrl+Alt+Up`     | `Cmd+Alt+Up`    | `agentManager.previousSession`   | Agent Manager panel                             | Agent Manager |
| `Ctrl+Alt+Down`   | `Cmd+Alt+Down`  | `agentManager.nextSession`       | Agent Manager panel                             | Agent Manager |
| `Ctrl+Alt+Left`   | `Cmd+Alt+Left`  | `agentManager.previousTab`       | Agent Manager panel                             | Agent Manager |
| `Ctrl+Alt+Right`  | `Cmd+Alt+Right` | `agentManager.nextTab`           | Agent Manager panel                             | Agent Manager |
| `Ctrl+/`          | `Cmd+/`         | `agentManager.showTerminal`      | Agent Manager panel                             | Agent Manager |
| `Ctrl+D`          | `Cmd+D`         | `agentManager.toggleDiff`        | Agent Manager panel                             | Agent Manager |
| `Ctrl+Shift+/`    | `Cmd+Shift+/`   | `agentManager.showShortcuts`     | Agent Manager panel                             | Agent Manager |
| `Ctrl+.`          | `Cmd+.`         | `agentManager.focusPanel`        | `terminalFocus && kilo-code.agentTerminalFocus` | Agent Manager |
| `Ctrl+T`          | `Cmd+T`         | `agentManager.newTab`            | Agent Manager panel                             | Agent Manager |
| `Ctrl+W`          | `Cmd+W`         | `agentManager.closeTab`          | Agent Manager panel                             | Agent Manager |
| `Ctrl+N`          | `Cmd+N`         | `agentManager.newWorktree`       | Agent Manager panel                             | Agent Manager |
| `Ctrl+Shift+O`    | `Cmd+Shift+O`   | `agentManager.openWorktree`      | Agent Manager panel                             | Agent Manager |
| `Ctrl+Shift+W`    | `Cmd+Shift+W`   | `agentManager.closeWorktree`     | Agent Manager panel                             | Agent Manager |
| `Ctrl+Shift+N`    | `Cmd+Shift+N`   | `agentManager.advancedWorktree`  | Agent Manager panel                             | Agent Manager |
| `Ctrl+1`–`Ctrl+9` | `Cmd+1`–`Cmd+9` | `agentManager.jumpTo1`–`jumpTo9` | Agent Manager panel                             | Agent Manager |

### 1.2 Commands With No Keybinding (22 total)

These commands exist in code but have no keyboard shortcut:

| Command ID                                       | Access                           | Notes                                      |
| ------------------------------------------------ | -------------------------------- | ------------------------------------------ |
| `plusButtonClicked`                              | Sidebar toolbar button           | New task                                   |
| `historyButtonClicked`                           | Sidebar toolbar button           | Session history                            |
| `cloudHistoryButtonClicked`                      | Sidebar toolbar button           | Cloud history                              |
| `profileButtonClicked`                           | Sidebar toolbar button           | Profile                                    |
| `settingsButtonClicked`                          | Sidebar toolbar button           | Settings                                   |
| `marketplaceButtonClicked`                       | Sidebar toolbar button           | Marketplace                                |
| `openInTab`                                      | Editor title button              | Open sidebar in tab                        |
| `openMigrationWizard`                            | Command palette                  | Legacy migration                           |
| `showChanges`                                    | Command palette                  | Show diff viewer                           |
| `openSubAgentViewer`                             | Programmatic only                | Internal                                   |
| `generateCommitMessage`                          | SCM toolbar button               | **No keybinding**                          |
| `explainCode`                                    | Editor context menu              | Right-click only                           |
| `fixCode`                                        | Editor context menu + CodeAction | Right-click / lightbulb                    |
| `improveCode`                                    | Editor context menu              | Right-click only                           |
| `terminalAddToContext`                           | Terminal context menu            | Right-click only                           |
| `terminalFixCommand`                             | Terminal context menu            | Right-click only                           |
| `terminalExplainCommand`                         | Terminal context menu            | Right-click only                           |
| `autocomplete.reload`                            | Programmatic                     | Internal                                   |
| `autocomplete.codeActionQuickFix`                | No-op stub                       | Dead code                                  |
| `autocomplete.generateSuggestions`               | Command palette only             | **No keybinding** (was `Ctrl+L` in legacy) |
| `autocomplete.showIncompatibilityExtensionPopup` | Programmatic                     | Internal                                   |
| `autocomplete.disable`                           | Programmatic                     | Internal                                   |

### 1.3 Webview Action Handlers (sidebar)

The sidebar webview (`App.tsx`) currently handles these `action` messages:

| Action                      | Effect                                                        |
| --------------------------- | ------------------------------------------------------------- |
| `plusButtonClicked`         | Dispatches `newTaskRequest` event, navigates to new task view |
| `marketplaceButtonClicked`  | Navigates to marketplace view                                 |
| `historyButtonClicked`      | Navigates to history view                                     |
| `cloudHistoryButtonClicked` | Navigates to cloud history view                               |
| `profileButtonClicked`      | Navigates to profile view                                     |
| `settingsButtonClicked`     | Navigates to settings view                                    |
| `focusInput`                | Focuses the prompt textarea (handled in PromptInput.tsx)      |

**Not handled**: `cycleAgentMode`, `cyclePreviousAgentMode`, `toggleAutoApprove`, `generateTerminalCommand`. None of these actions exist in the current webview.

### 1.4 Webview Keyboard Handlers

| Component       | Key                   | Effect                                |
| --------------- | --------------------- | ------------------------------------- |
| ChatView.tsx    | `Escape` (global)     | Aborts active session                 |
| PromptInput.tsx | `Ctrl+Z`/`Cmd+Z`      | Undoes prompt enhancement             |
| PromptInput.tsx | `ArrowUp`/`ArrowDown` | Cycles prompt history                 |
| PromptInput.tsx | `Tab`                 | Accepts ghost text autocomplete       |
| PromptInput.tsx | `Escape`              | Dismisses ghost text / aborts session |
| PromptInput.tsx | `Enter`               | Sends message                         |

### 1.5 Autocomplete State

| Feature                                        | Status                                               |
| ---------------------------------------------- | ---------------------------------------------------- |
| Auto-triggered inline completions              | Working                                              |
| `generateSuggestions` command (manual trigger) | Registered, no keybinding, auto-inserts (no preview) |
| `cancelSuggestions` command                    | **Not registered**                                   |
| `hasSuggestions` context key                   | **Never set**                                        |
| `enableSmartInlineTaskKeybinding` context key  | Set but nothing consumes it                          |
| Suggestion navigation (next/prev)              | **Not implemented** (i18n strings exist)             |

### 1.6 Permission System

| Feature                                                 | Status                                           |
| ------------------------------------------------------- | ------------------------------------------------ |
| Full per-tool permission config (Allow/Ask/Deny)        | Settings tab "Auto-Approve"                      |
| Granular pattern exceptions (bash commands, file globs) | Working for bash, read, edit, external_directory |
| In-chat permission request UI (PermissionDock)          | Working                                          |
| Global toggle shortcut                                  | **Not implemented**                              |
| Per-agent permission overrides                          | Supported in config                              |

---

## 2. What the Legacy Extension Had

### 2.1 Missing Keybindings

| Shortcut       | Mac           | Command                                          | When                                | Status                                   |
| -------------- | ------------- | ------------------------------------------------ | ----------------------------------- | ---------------------------------------- |
| `Ctrl+Alt+A`   | `Cmd+Alt+A`   | `toggleAutoApprove`                              | _(always)_                          | **Missing** — no command or keybinding   |
| `Ctrl+Shift+G` | `Cmd+Shift+G` | `generateTerminalCommand`                        | _(always)_                          | **Missing** — no command or keybinding   |
| `Escape`       | `Escape`      | `autocomplete.cancelSuggestions`                 | `editorTextFocus && hasSuggestions` | **Missing** — no command, no context key |
| `Ctrl+L`       | `Cmd+L`       | `autocomplete.generateSuggestions`               | `enableSmartInlineTask && !copilot` | **Missing keybinding** (command exists)  |
| `Ctrl+L`       | `Cmd+L`       | `autocomplete.showIncompatibilityExtensionPopup` | `enableSmartInlineTask && copilot`  | **Missing keybinding** (command exists)  |

### 2.2 Missing Commands (no keybinding in legacy either)

| Command                             | Description                             | Relevance                        |
| ----------------------------------- | --------------------------------------- | -------------------------------- |
| `newTask`                           | Start a new task (separate from button) | Low — `plusButtonClicked` exists |
| `acceptInput`                       | Submit current input                    | Low — Enter key works            |
| `setCustomStoragePath`              | Change storage directory                | Low — niche                      |
| `importSettings` / `exportSettings` | Settings portability                    | Low — migration wizard exists    |
| `focusPanel`                        | Focus sidebar panel                     | Low — `focusChatInput` exists    |
| `popoutButtonClicked`               | Open in editor tab                      | Low — `openInTab` exists         |

### 2.3 Missing Menu Contributions

| Menu                              | Legacy                            | Current     | Impact                                    |
| --------------------------------- | --------------------------------- | ----------- | ----------------------------------------- |
| `scm/input` (SCM input box icon)  | `generateCommitMessage`           | **Missing** | Medium — icon only in `scm/title` toolbar |
| `editor/title` (tab mode buttons) | New Task, History, Settings, Help | **Missing** | Low — sidebar buttons accessible          |

---

## 3. What the Desktop App / TUI Have

### 3.1 Agent Cycling

| Feature                | Desktop App                      | TUI                    | VS Code Extension                     |
| ---------------------- | -------------------------------- | ---------------------- | ------------------------------------- |
| Cycle forward          | `Cmd/Ctrl+.`                     | `Tab`                  | **Not implemented**                   |
| Cycle backward         | `Shift+Cmd/Ctrl+.`               | `Shift+Tab`            | **Not implemented**                   |
| Agent filter           | `mode !== "subagent" && !hidden` | Same                   | N/A                                   |
| Wrap-around            | Yes                              | Yes                    | N/A                                   |
| Model propagation      | Inline in `move()`               | Via `createEffect`     | N/A                                   |
| UI widget              | `<Select>` dropdown              | `<DialogAgent>` dialog | `<ModeSwitcher>` popover (click only) |
| `/agent` slash command | Yes (forward cycle)              | Yes (opens dialog)     | Not implemented                       |

### 3.2 Cycling Algorithm

```
1. Filter agents: mode !== "subagent" && !hidden
2. Find current agent index in filtered list
3. Add direction (+1 or -1)
4. Wrap: < 0 → last; >= length → first
5. Update current agent name
6. Propagate model/variant if agent has a pinned model
```

---

## 4. Gap Analysis

### Priority Matrix

| Feature                                    | Legacy Parity     | Desktop Parity | Functionality Exists                                                                            | Effort  | Priority |
| ------------------------------------------ | ----------------- | -------------- | ----------------------------------------------------------------------------------------------- | ------- | -------- |
| Agent cycling (`Ctrl+.`/`Ctrl+Shift+.`)    | N/A               | Yes            | Backend ready, webview needs handler                                                            | Medium  | **P0**   |
| Toggle auto-approve (`Ctrl+Alt+A`)         | Yes               | N/A            | Permission system exists                                                                        | Medium  | **P1**   |
| Autocomplete cancel (`Escape`)             | Yes               | N/A            | Need `hasSuggestions` context key + command                                                     | Low     | **P1**   |
| Autocomplete generate (`Ctrl+L`)           | Yes               | N/A            | Command exists, needs keybinding                                                                | Low     | **P1**   |
| Generate terminal command (`Ctrl+Shift+G`) | Yes               | N/A            | **No backend support** — legacy used its own AI; new extension would need to route through chat | High    | **P2**   |
| SCM input menu entry                       | Yes               | N/A            | `generateCommitMessage` command exists                                                          | Trivial | **P2**   |
| Generate commit message keybinding         | No legacy binding | N/A            | Command exists, no keybinding                                                                   | Trivial | **P3**   |

---

## 5. Bot PR #6993 Review — What It Got Right and Wrong

### Correct

1. Used the VS Code-native pattern: `package.json` keybinding → `registerCommand` in `extension.ts` → `postMessage({ type: "action" })` → webview handler
2. Agent cycling algorithm matches the desktop app: filter subagent/hidden, `findIndex + direction`, wrap-around
3. `cancelSuggestions` correctly delegates to `editor.action.inlineSuggest.hide`
4. `hasSuggestions` context key tracking in `provideInlineCompletionItems`

### Issues

| Issue                                                   | Detail                                                                                                                                                                                     | Severity |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| **`Ctrl+.` conflict**                                   | `cycleAgentMode` bound to `Ctrl+.` with `when: activeViewlet == sidebar`. This conflicts conceptually with `agentManager.focusPanel` (same key, different context). Reviewer flagged this. | High     |
| **`toggleAutoApprove` flattens permissions**            | Bot code toggles all permission keys to flat `"allow"` or `"ask"`, destroying per-pattern granularity (e.g., `bash: { "*": "ask", "git *": "allow" }` becomes `bash: "allow"`).            | High     |
| **`generateTerminalCommand` webview case is dead code** | `case "generateTerminalCommand": break;` does nothing — all logic is in `extension.ts`. Harmless but messy.                                                                                | Low      |
| **`Ctrl+L` remapped**                                   | Bot mapped `Ctrl+L` to `generateCommitMessage` (when `scmInputIsFocused`) instead of restoring legacy `autocomplete.generateSuggestions` binding. These are different commands.            | Medium   |
| **Missing autocomplete `Ctrl+L` bindings**              | The legacy `Ctrl+L` with `enableSmartInlineTaskKeybinding && !copilot` when clause was not restored.                                                                                       | Medium   |

---

## 6. Integration Plan

### Phase 1: Agent Cycling (P0)

**Goal**: Bring feature parity with Desktop app / TUI for agent mode switching.

#### Keybinding Choice

The Desktop app uses `Cmd/Ctrl+.` but this conflicts with the Agent Manager's `focusPanel` command (same physical key, different `when` context). Options:

| Option                         | Forward  | Reverse        | Pros                        | Cons                                                                                                 |
| ------------------------------ | -------- | -------------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| **A: Match Desktop**           | `Ctrl+.` | `Ctrl+Shift+.` | Consistency across products | Conceptual overlap with `agentManager.focusPanel` (different `when` clauses prevent actual conflict) |
| **B: Unique keys**             | `Ctrl+]` | `Ctrl+[`       | No overlap at all           | Users need to learn different keys per product                                                       |
| **C: Desktop keys + remap AM** | `Ctrl+.` | `Ctrl+Shift+.` | Full consistency            | Requires changing Agent Manager's `focusPanel` keybinding                                            |

**Recommendation: Option A** — Use `Ctrl+.` / `Ctrl+Shift+.` with proper `when` clauses. The `when` conditions are mutually exclusive:

- Agent cycling: `view == kilo-code.SidebarProvider && focusedView == kilo-code.SidebarProvider` (sidebar is focused)
- Agent Manager focusPanel: `terminalFocus && kilo-code.agentTerminalFocus` (Agent Manager terminal is focused)
- No active keybinding: When editor, file explorer, or other panels are focused

#### Implementation

1. **`package.json`**: Add commands `cycleAgentMode` and `cyclePreviousAgentMode` with keybindings
2. **`extension.ts`**: Register command handlers that post `{ type: "action", action: "cycleAgentMode" }` and `cyclePreviousAgentMode` to the sidebar webview
3. **`App.tsx`**: Add cases in `handleViewAction()` that call a `cycleAgent(direction)` function
4. **`session.tsx`**: The `selectAgent()` method already exists and handles model propagation
5. **Cycling logic**: Filter `session.agents()` by `mode !== "subagent" && !hidden`, use `findIndex + direction + wrap`

#### When Clause

```json
{
  "command": "kilo-code.new.cycleAgentMode",
  "key": "ctrl+.",
  "mac": "cmd+.",
  "when": "view == 'kilo-code.SidebarProvider' && focusedView == 'kilo-code.SidebarProvider'"
}
```

This ensures the shortcut only fires when the Kilo Code sidebar view is focused — not when the editor, terminal, or Agent Manager panel is focused.

### Phase 2: Legacy Parity — High Priority (P1)

#### 2a. Toggle Auto-Approve (`Ctrl+Alt+A`)

**The permission system is complex.** A simple toggle cannot just flip everything to `"allow"` without destroying granular rules. The correct behavior:

**Toggle semantics:**

- **"Enable auto-approve"** = Set all simple tools to `"allow"`, set wildcard `"*"` to `"allow"` for granular tools (preserving pattern exceptions)
- **"Disable auto-approve"** = Set all simple tools to `"ask"`, set wildcard `"*"` to `"ask"` for granular tools (preserving pattern exceptions)

**Detection** ("is auto-approve currently on?"):

- Check if the majority of top-level permission values are `"allow"` or have `"*": "allow"`
- A simple heuristic: if every tool's effective default is `"allow"`, auto-approve is "on"

**Implementation:**

1. **`package.json`**: Add command + keybinding `Ctrl+Alt+A` / `Cmd+Alt+A` (no `when` clause — global)
2. **`extension.ts`**: Register handler that posts `{ type: "action", action: "toggleAutoApprove" }` to sidebar
3. **`App.tsx`**: Add handler case
4. **Config logic**: Use `updateConfig()` with a permission object that only changes the top-level/wildcard values, preserving nested pattern exceptions
5. **Toast notification**: Show "Auto-approve enabled" / "Auto-approve disabled" via VS Code notification from the extension host

#### 2b. Cancel Autocomplete Suggestions (`Escape`)

**Implementation:**

1. **`AutocompleteInlineCompletionProvider.ts`**: Set `kilo-code.new.autocomplete.hasSuggestions` context key via `setContext` when suggestions are returned (true) and when they're dismissed or empty (false)
2. **`autocomplete/index.ts`**: Register `kilo-code.new.autocomplete.cancelSuggestions` command that executes `editor.action.inlineSuggest.hide` and clears the context key
3. **`package.json`**: Add keybinding:
   ```json
   {
     "command": "kilo-code.new.autocomplete.cancelSuggestions",
     "key": "escape",
     "when": "editorTextFocus && !editorTabMovesFocus && !inSnippetMode && kilo-code.new.autocomplete.hasSuggestions"
   }
   ```

The `when` clause is highly specific — it only fires when the Kilo autocomplete has active suggestions, so it won't interfere with other Escape handlers.

#### 2c. Generate Autocomplete Suggestions (`Ctrl+L`)

**Implementation:**

1. **`package.json`**: Add two keybindings for `Ctrl+L` / `Cmd+L`:
   ```json
   {
     "command": "kilo-code.new.autocomplete.generateSuggestions",
     "key": "ctrl+l",
     "mac": "cmd+l",
     "when": "editorTextFocus && !editorTabMovesFocus && !inSnippetMode && kilocode.autocomplete.enableSmartInlineTaskKeybinding && !github.copilot.completions.enabled"
   },
   {
     "command": "kilo-code.new.autocomplete.showIncompatibilityExtensionPopup",
     "key": "ctrl+l",
     "mac": "cmd+l",
     "when": "editorTextFocus && !editorTabMovesFocus && !inSnippetMode && kilocode.autocomplete.enableSmartInlineTaskKeybinding && github.copilot.completions.enabled"
   }
   ```

The `enableSmartInlineTaskKeybinding` context key is already being set — it just has no consumer. These bindings restore the legacy behavior.

**Note:** `codeSuggestion()` currently auto-inserts the suggestion rather than showing it as ghost text. Consider whether to change this behavior to show a preview first. For legacy parity, auto-insert is acceptable since the legacy extension worked the same way.

### Phase 3: Lower Priority (P2)

#### 3a. Generate Terminal Command (`Ctrl+Shift+G`)

**Functional assessment:** The legacy extension had a dedicated AI terminal command generator. The current extension has `terminalFixCommand` and `terminalExplainCommand` (context menu only), but no "generate from description" feature.

**Implementation options:**

| Option                 | Approach                                                                      | Effort |
| ---------------------- | ----------------------------------------------------------------------------- | ------ |
| **A: Chat-based**      | Show input box → send to chat as "Generate a terminal command: {description}" | Low    |
| **B: Inline terminal** | Show input box → call CLI backend directly → insert into active terminal      | High   |

**Recommendation: Option A** — This is what the bot PR did and it's pragmatic. The user describes what they want, it goes to the chat agent which can generate and explain the command. No new backend work required.

```
1. VS Code showInputBox("Describe the command you want")
2. Focus sidebar chat
3. Send as triggerTask: "Generate a terminal command: {input}"
```

**Keybinding:** `Ctrl+Shift+G` / `Cmd+Shift+G` (no `when` clause — global). Note: this overrides VS Code's default `Ctrl+Shift+G` which opens the Source Control view. This is the same override the legacy extension used — legacy users expect this behavior.

#### 3b. SCM Input Menu Entry

Add the `generateCommitMessage` button to `scm/input` in addition to the existing `scm/title`:

```json
"scm/input": [
  {
    "command": "kilo-code.new.generateCommitMessage",
    "group": "navigation",
    "when": "scmProvider == git"
  }
]
```

This shows the commit message generation icon inside the SCM input box (not just in the toolbar).

### Phase 4: Nice-to-Have (P3)

#### 4a. Generate Commit Message Keybinding

The legacy extension had no keybinding for this. The bot PR added `Ctrl+L` when `scmInputIsFocused`, but that conflicts with the autocomplete `Ctrl+L` intent. Consider `Ctrl+Shift+G` when `scmInputIsFocused` instead — but that conflicts with the terminal command generator.

**Recommendation:** Do not add a keybinding. The SCM toolbar button and `scm/input` menu entry are sufficient. Users who want a shortcut can customize it via VS Code keybinding settings.

---

## 7. Detailed Implementation Specs

### 7.1 Files to Modify

| File                                                                                                           | Changes                                                                                 |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `packages/kilo-vscode/package.json`                                                                            | Add 5 commands + 7 keybindings + 1 menu entry                                           |
| `packages/kilo-vscode/src/extension.ts`                                                                        | Register 4 new command handlers                                                         |
| `packages/kilo-vscode/src/services/autocomplete/index.ts`                                                      | Register `cancelSuggestions` command                                                    |
| `packages/kilo-vscode/src/services/autocomplete/classic-auto-complete/AutocompleteInlineCompletionProvider.ts` | Set/clear `hasSuggestions` context key                                                  |
| `packages/kilo-vscode/webview-ui/src/App.tsx`                                                                  | Add action handlers for `cycleAgentMode`, `cyclePreviousAgentMode`, `toggleAutoApprove` |

### 7.2 New Commands

| Command ID                                     | Title                     | Category  |
| ---------------------------------------------- | ------------------------- | --------- |
| `kilo-code.new.cycleAgentMode`                 | Cycle Agent Mode          | Kilo Code |
| `kilo-code.new.cyclePreviousAgentMode`         | Cycle Previous Agent Mode | Kilo Code |
| `kilo-code.new.toggleAutoApprove`              | Toggle Auto-Approve       | Kilo Code |
| `kilo-code.new.generateTerminalCommand`        | Generate Terminal Command | Kilo Code |
| `kilo-code.new.autocomplete.cancelSuggestions` | Cancel Suggested Edits    | Kilo Code |

### 7.3 New Keybindings

| Key            | Mac           | Command                                          | When                                                                                                                                                        |
| -------------- | ------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Ctrl+.`       | `Cmd+.`       | `cycleAgentMode`                                 | `view == 'kilo-code.SidebarProvider' && focusedView == 'kilo-code.SidebarProvider'`                                                                         |
| `Ctrl+Shift+.` | `Cmd+Shift+.` | `cyclePreviousAgentMode`                         | `view == 'kilo-code.SidebarProvider' && focusedView == 'kilo-code.SidebarProvider'`                                                                         |
| `Ctrl+Alt+A`   | `Cmd+Alt+A`   | `toggleAutoApprove`                              | _(always)_                                                                                                                                                  |
| `Ctrl+Shift+G` | `Cmd+Shift+G` | `generateTerminalCommand`                        | _(always)_                                                                                                                                                  |
| `Escape`       | `Escape`      | `autocomplete.cancelSuggestions`                 | `editorTextFocus && !editorTabMovesFocus && !inSnippetMode && kilo-code.new.autocomplete.hasSuggestions`                                                    |
| `Ctrl+L`       | `Cmd+L`       | `autocomplete.generateSuggestions`               | `editorTextFocus && !editorTabMovesFocus && !inSnippetMode && kilocode.autocomplete.enableSmartInlineTaskKeybinding && !github.copilot.completions.enabled` |
| `Ctrl+L`       | `Cmd+L`       | `autocomplete.showIncompatibilityExtensionPopup` | `editorTextFocus && !editorTabMovesFocus && !inSnippetMode && kilocode.autocomplete.enableSmartInlineTaskKeybinding && github.copilot.completions.enabled`  |

### 7.4 Agent Cycling Pseudocode

```typescript
// In App.tsx — handleViewAction
case "cycleAgentMode":
  cycleAgent(1)
  break
case "cyclePreviousAgentMode":
  cycleAgent(-1)
  break

// Cycling function
const cycleAgent = (direction: 1 | -1) => {
  const available = session.agents().filter(a => a.mode !== "subagent" && !a.hidden)
  if (available.length === 0) return
  const current = session.selectedAgent()
  const idx = available.findIndex(a => a.name === current)
  const raw = idx + direction
  const next = raw < 0 ? available.length - 1 : raw >= available.length ? 0 : raw
  const agent = available[next]
  if (agent) session.selectAgent(agent.name)
}
```

### 7.5 Toggle Auto-Approve Pseudocode

```typescript
// In App.tsx — handleViewAction
case "toggleAutoApprove": {
  const perm = config().permission ?? {}

  // Check if auto-approve is currently "on":
  // It's "on" if every tool's effective default is "allow"
  const isOn = Object.values(perm).every(v => {
    if (typeof v === "string") return v === "allow"
    if (typeof v === "object") return v["*"] === "allow"
    return true
  })

  const target = isOn ? "ask" : "allow"

  // Build update that PRESERVES pattern-level exceptions
  const updated: Record<string, PermissionRule> = {}
  for (const [key, val] of Object.entries(perm)) {
    if (typeof val === "string") {
      updated[key] = target
    } else if (typeof val === "object" && val !== null) {
      // Preserve pattern exceptions, only change the wildcard default
      updated[key] = { ...val, "*": target }
    }
  }

  updateConfig({ permission: updated })

  // Notify user via postMessage to extension host for VS Code notification
  vscode.postMessage({
    type: "showNotification",
    message: target === "allow" ? "Auto-approve enabled" : "Auto-approve disabled"
  })
  break
}
```

---

## 8. Conflict Analysis

### 8.1 `Ctrl+.` / `Cmd+.`

| Context                | Current Binding                              | Proposed Binding | Conflict?                             |
| ---------------------- | -------------------------------------------- | ---------------- | ------------------------------------- |
| Editor focused         | VS Code Quick Fix (`editor.action.quickFix`) | —                | No (we don't bind in editor context)  |
| Sidebar focused        | Nothing                                      | `cycleAgentMode` | No conflict                           |
| Agent Manager terminal | `agentManager.focusPanel`                    | —                | No conflict (different `when` clause) |
| Agent Manager panel    | Nothing                                      | —                | No conflict                           |

**Verdict:** Safe. The `when` clauses are mutually exclusive.

### 8.2 `Ctrl+Shift+G` / `Cmd+Shift+G`

| Context | Current Binding               | Proposed Binding          | Conflict?    |
| ------- | ----------------------------- | ------------------------- | ------------ |
| Any     | VS Code "Open Source Control" | `generateTerminalCommand` | **Override** |

**Verdict:** Same override as legacy extension. Acceptable for legacy parity. Users can rebind via VS Code settings if needed.

### 8.3 `Ctrl+Alt+A` / `Cmd+Alt+A`

No existing VS Code default or extension binding uses this combination. **No conflict.**

### 8.4 `Escape` (for autocomplete cancel)

The `when` clause `kilo-code.new.autocomplete.hasSuggestions` ensures this only fires when Kilo Code inline suggestions are active. Other Escape handlers (close dialogs, exit Zen mode, abort session) have different or no `when` clauses — VS Code evaluates the most specific match. **No conflict.**

### 8.5 `Ctrl+L` / `Cmd+L`

| Context                                           | Current Binding                 | Proposed Binding                    | Conflict?                                      |
| ------------------------------------------------- | ------------------------------- | ----------------------------------- | ---------------------------------------------- |
| Editor (smart keybinding enabled, no Copilot)     | Nothing                         | `autocomplete.generateSuggestions`  | No conflict                                    |
| Editor (smart keybinding enabled, Copilot active) | Nothing                         | `showIncompatibilityExtensionPopup` | No conflict                                    |
| Editor (smart keybinding disabled)                | VS Code "Expand Line Selection" | —                                   | No conflict (our binding requires context key) |

**Verdict:** Safe. The context key guards prevent activation unless the user has explicitly enabled smart inline task keybinding.

---

## 9. Out of Scope / Deferred

These items are not recommended for this implementation round:

| Item                                                      | Reason                                                                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Autocomplete navigation (next/prev suggestion)            | Provider only returns 1 suggestion per invocation — nothing to navigate                                                    |
| `importSettings` / `exportSettings` commands              | Migration wizard covers this use case                                                                                      |
| `setCustomStoragePath` command                            | Niche feature, no user demand                                                                                              |
| `editor/title` buttons in tab mode                        | Different UI paradigm in new extension (settings, history accessible from sidebar)                                         |
| `popoutButtonClicked` in sidebar toolbar                  | `openInTab` command exists, accessible via editor title bar                                                                |
| Webview-internal keybinding system (CommandProvider port) | VS Code-native keybindings are more appropriate for the extension context and integrate with user keybinding customization |

---

## Summary: Complete Keybinding Map After Implementation

### Global Shortcuts

| Shortcut       | Mac           | Command                   | Category |
| -------------- | ------------- | ------------------------- | -------- |
| `Ctrl+Shift+A` | `Cmd+Shift+A` | Focus Chat Input          | Existing |
| `Ctrl+Shift+M` | `Cmd+Shift+M` | Open Agent Manager        | Existing |
| `Ctrl+Alt+A`   | `Cmd+Alt+A`   | Toggle Auto-Approve       | **New**  |
| `Ctrl+Shift+G` | `Cmd+Shift+G` | Generate Terminal Command | **New**  |

### Editor Shortcuts

| Shortcut        | Mac           | Command               | When                                     | Category |
| --------------- | ------------- | --------------------- | ---------------------------------------- | -------- |
| `Ctrl+K Ctrl+A` | `Cmd+K Cmd+A` | Add to Context        | Editor + selection                       | Existing |
| `Escape`        | `Escape`      | Cancel Suggestions    | Kilo suggestions active                  | **New**  |
| `Ctrl+L`        | `Cmd+L`       | Generate Suggestions  | Smart keybinding enabled, no Copilot     | **New**  |
| `Ctrl+L`        | `Cmd+L`       | Show Copilot Conflict | Smart keybinding enabled, Copilot active | **New**  |

### Sidebar Shortcuts

| Shortcut       | Mac           | Command                   | When            | Category |
| -------------- | ------------- | ------------------------- | --------------- | -------- |
| `Ctrl+.`       | `Cmd+.`       | Cycle Agent Mode          | Sidebar focused | **New**  |
| `Ctrl+Shift+.` | `Cmd+Shift+.` | Cycle Previous Agent Mode | Sidebar focused | **New**  |

### Agent Manager Shortcuts (24 existing, unchanged)

_(All 24 Agent Manager keybindings remain unchanged)_
