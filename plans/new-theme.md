# Adding a New Bundled Theme to Kilo CLI

## Overview

Themes are JSON files that define colors for the TUI. Each theme maps ~50 color slots
covering UI elements, syntax highlighting, diff views, and markdown rendering.

## Step 1: Create the Theme JSON File

Create `packages/opencode/src/cli/cmd/tui/context/theme/<your-theme-name>.json`.

Use `dracula.json` as a reference — it's a clean example.

### Structure

```json
{
  "$schema": "https://opencode.ai/theme.json",
  "defs": {
    "bg": "#1a1b26",
    "fg": "#a9b1d6",
    "blue": "#7aa2f7",
    "purple": "#bb9af7",
    "green": "#9ece6a",
    "red": "#f7768e",
    "yellow": "#e0af68",
    "cyan": "#7dcfff",
    "orange": "#ff9e64"
  },
  "theme": {
    "primary": { "dark": "blue", "light": "blue" },
    "secondary": { "dark": "purple", "light": "purple" },
    "accent": { "dark": "cyan", "light": "cyan" },
    "error": { "dark": "red", "light": "red" },
    "warning": { "dark": "yellow", "light": "yellow" },
    "success": { "dark": "green", "light": "green" },
    "info": { "dark": "orange", "light": "orange" },
    "text": { "dark": "fg", "light": "#1a1b26" },
    "textMuted": { "dark": "#565f89", "light": "#565f89" },
    "background": { "dark": "bg", "light": "#f5f5f5" },
    "backgroundPanel": { "dark": "#16161e", "light": "#e1e2e7" },
    "backgroundElement": { "dark": "#1a1b26", "light": "#d5d6db" },
    "border": { "dark": "#292e42", "light": "#c0c1c6" },
    "borderActive": { "dark": "blue", "light": "blue" },
    "borderSubtle": { "dark": "#13131a", "light": "#e0e1e6" },
    "diffAdded": { "dark": "green", "light": "green" },
    "diffRemoved": { "dark": "red", "light": "red" },
    "diffContext": { "dark": "#565f89", "light": "#565f89" },
    "diffHunkHeader": { "dark": "#565f89", "light": "#565f89" },
    "diffHighlightAdded": { "dark": "green", "light": "green" },
    "diffHighlightRemoved": { "dark": "red", "light": "red" },
    "diffAddedBg": { "dark": "#1a2e1a", "light": "#e0ffe0" },
    "diffRemovedBg": { "dark": "#2e1a1a", "light": "#ffe0e0" },
    "diffContextBg": { "dark": "#16161e", "light": "#e1e2e7" },
    "diffLineNumber": { "dark": "#292e42", "light": "#c0c1c6" },
    "diffAddedLineNumberBg": { "dark": "#1a2e1a", "light": "#e0ffe0" },
    "diffRemovedLineNumberBg": { "dark": "#2e1a1a", "light": "#ffe0e0" },
    "markdownText": { "dark": "fg", "light": "#1a1b26" },
    "markdownHeading": { "dark": "blue", "light": "blue" },
    "markdownLink": { "dark": "cyan", "light": "cyan" },
    "markdownLinkText": { "dark": "purple", "light": "purple" },
    "markdownCode": { "dark": "green", "light": "green" },
    "markdownBlockQuote": { "dark": "#565f89", "light": "#565f89" },
    "markdownEmph": { "dark": "yellow", "light": "yellow" },
    "markdownStrong": { "dark": "orange", "light": "orange" },
    "markdownHorizontalRule": { "dark": "#565f89", "light": "#565f89" },
    "markdownListItem": { "dark": "blue", "light": "blue" },
    "markdownListEnumeration": { "dark": "cyan", "light": "cyan" },
    "markdownImage": { "dark": "cyan", "light": "cyan" },
    "markdownImageText": { "dark": "purple", "light": "purple" },
    "markdownCodeBlock": { "dark": "fg", "light": "#1a1b26" },
    "syntaxComment": { "dark": "#565f89", "light": "#565f89" },
    "syntaxKeyword": { "dark": "purple", "light": "purple" },
    "syntaxFunction": { "dark": "blue", "light": "blue" },
    "syntaxVariable": { "dark": "fg", "light": "#1a1b26" },
    "syntaxString": { "dark": "green", "light": "green" },
    "syntaxNumber": { "dark": "orange", "light": "orange" },
    "syntaxType": { "dark": "cyan", "light": "cyan" },
    "syntaxOperator": { "dark": "purple", "light": "purple" },
    "syntaxPunctuation": { "dark": "fg", "light": "#1a1b26" }
  }
}
```

### Color Value Formats

Each color value can be:

| Format             | Example                                  | Description                       |
| ------------------ | ---------------------------------------- | --------------------------------- |
| Hex string         | `"#ff5555"`                              | Direct hex color                  |
| Defs reference     | `"purple"`                               | References a `defs` entry         |
| Theme reference    | `"background"`                           | References another theme property |
| Dark/light variant | `{ "dark": "blue", "light": "#0066cc" }` | Separate colors per mode          |
| Transparent        | `"transparent"`                          | Fully transparent RGBA            |

### All Color Slots

Defined in `ThemeColors` type at `theme.tsx:48-101`:

**Semantic:** primary, secondary, accent, error, warning, success, info

**Text:** text, textMuted, selectedListItemText

**Backgrounds:** background, backgroundPanel, backgroundElement, backgroundMenu

**Borders:** border, borderActive, borderSubtle

**Diff:** diffAdded, diffRemoved, diffContext, diffHunkHeader, diffHighlightAdded,
diffHighlightRemoved, diffAddedBg, diffRemovedBg, diffContextBg, diffLineNumber,
diffAddedLineNumberBg, diffRemovedLineNumberBg

**Markdown:** markdownText, markdownHeading, markdownLink, markdownLinkText,
markdownCode, markdownBlockQuote, markdownEmph, markdownStrong,
markdownHorizontalRule, markdownListItem, markdownListEnumeration,
markdownImage, markdownImageText, markdownCodeBlock

**Syntax:** syntaxComment, syntaxKeyword, syntaxFunction, syntaxVariable,
syntaxString, syntaxNumber, syntaxType, syntaxOperator, syntaxPunctuation

**Optional:** selectedListItemText, backgroundMenu, thinkingOpacity (default 0.6)

## Step 2: Import in theme.tsx

Add an import at `packages/opencode/src/cli/cmd/tui/context/theme.tsx` (around line 6-40):

```ts
import myTheme from "./theme/my-theme-name.json" with { type: "json" }
```

## Step 3: Register in DEFAULT_THEMES

Add it to the `DEFAULT_THEMES` record at `theme.tsx:143-179`:

```ts
"my-theme-name": myTheme,
```

## Step 4: Verify

```bash
bun dev
```

Then press `Ctrl+X` then `T` to open the theme picker and select your theme.

## Tips

- Use `defs` to define your palette once and reference colors by name throughout
- Always provide both `dark` and `light` variants for each color
- Use subtle background colors for diff backgrounds (low opacity tints)
- Test with `bun dev` and use the theme picker for live preview
- Existing themes in `packages/opencode/src/cli/cmd/tui/context/theme/` are good references
