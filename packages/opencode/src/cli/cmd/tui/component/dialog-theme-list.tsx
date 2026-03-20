import { DialogSelect, type DialogSelectRef } from "../ui/dialog-select"
import { useTheme, selectedForeground } from "../context/theme"
import { useDialog } from "../ui/dialog"
import { For, onCleanup } from "solid-js"
import { RGBA, TextAttributes } from "@opentui/core"

export function DialogThemeList() {
  const ctx = useTheme()
  const { theme } = ctx
  const dialog = useDialog()
  let confirmed = false
  let ref: DialogSelectRef<string>
  const initial = ctx.selected

  const themeOptions = Object.keys(ctx.all())
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map((value) => ({
      title: value,
      value: value,
    }))

  onCleanup(() => {
    if (!confirmed) ctx.set(initial)
  })

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

        const first = ref.filtered.find((opt) => opt.value !== initial)
        if (first) ctx.set(first.value)
      }}
      header={<BackgroundTabs />}
    />
  )
}

function BackgroundTabs() {
  const ctx = useTheme()
  const { theme } = ctx
  const dialog = useDialog()
  const fg = selectedForeground(theme)

  const modes = [
    { label: "Solid", value: "solid" as const },
    { label: "Transparent", value: "transparent" as const },
  ]

  return (
    <box paddingLeft={4} paddingRight={4} paddingTop={1}>
      <text fg={theme.accent} attributes={TextAttributes.BOLD}>
        Background
      </text>
      <box flexDirection="row" paddingTop={1} border={["bottom"]} borderColor={theme.border}>
        <For each={modes}>
          {(mode, i) => {
            const active = () => ctx.backgroundMode === mode.value
            return (
              <box
                border={(() => {
                  const sides: ("top" | "left" | "right")[] = ["top"]
                  if (i() === 0) sides.push("left")
                  if (i() === modes.length - 1) sides.push("right")
                  return sides
                })()}
                borderColor={theme.border}
                backgroundColor={active() ? theme.primary : RGBA.fromInts(0, 0, 0, 0)}
                paddingLeft={2}
                paddingRight={2}
                paddingBottom={0}
                onMouseUp={() => {
                  ctx.setBackgroundMode(mode.value)
                  dialog.clear()
                }}
              >
                <text fg={active() ? fg : theme.text} attributes={active() ? TextAttributes.BOLD : undefined}>
                  {mode.label}
                </text>
              </box>
            )
          }}
        </For>
      </box>
    </box>
  )
}
