import { DialogSelect, type DialogSelectRef } from "../ui/dialog-select"
import { useTheme, selectedForeground } from "../context/theme"
import { useDialog } from "../ui/dialog"
import { onCleanup } from "solid-js"
import { TextAttributes } from "@opentui/core"
import { useKeyboard } from "@opentui/solid"

export function DialogThemeList() {
  const ctx = useTheme()
  const { theme } = ctx
  const dialog = useDialog()
  const fg = selectedForeground(theme)
  let confirmed = false
  let ref: DialogSelectRef<string>
  const initial = ctx.selected

  const themeOptions = Object.keys(ctx.all())
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map((value) => ({
      title: value,
      value: value,
    }))

  useKeyboard((evt) => {
    if (evt.name === "tab") {
      evt.preventDefault()
      evt.stopPropagation()
      ctx.setBackgroundMode(ctx.backgroundMode === "solid" ? "transparent" : "solid")
    }
  })

  onCleanup(() => {
    if (!confirmed) ctx.set(initial)
  })

  const solidActive = () => ctx.backgroundMode === "solid"

  return (
    <DialogSelect
      title="Themes"
      options={themeOptions}
      current={initial}
      onMove={(opt) => {
        ctx.set(opt.value)
      }}
      onSelect={(opt) => {
        ctx.set(opt.value)
        confirmed = true
        dialog.clear()
      }}
      ref={(r) => {
        ref = r
      }}
      onFilter={(query) => {
        if (query.length === 0) {
          ctx.set(initial)
          return
        }

        const first = ref.filtered[0]
        if (first) ctx.set(first.value)
      }}
      footer={
        <box paddingLeft={4} paddingRight={4} paddingTop={1} paddingBottom={1}>
          <text fg={theme.textMuted}>
            Press tab to cycle transparency modes:{" "}
            <span
              style={{
                fg: solidActive() ? theme.primary : theme.textMuted,
                attributes: solidActive() ? TextAttributes.BOLD : undefined,
              }}
            >
              Solid
            </span>
            {" | "}
            <span
              style={{
                fg: !solidActive() ? theme.primary : theme.textMuted,
                attributes: !solidActive() ? TextAttributes.BOLD : undefined,
              }}
            >
              Transparent
            </span>
          </text>
        </box>
      }
    />
  )
}
