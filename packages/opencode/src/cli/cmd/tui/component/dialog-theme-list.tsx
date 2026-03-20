import { DialogSelect, type DialogSelectRef } from "../ui/dialog-select"
import { useTheme } from "../context/theme"
import { useDialog } from "../ui/dialog"
import { onCleanup } from "solid-js"
import { RGBA } from "@opentui/core"

const BG_SOLID = "__bg_solid"
const BG_TRANSPARENT = "__bg_transparent"

function isBgOption(value: string) {
  return value === BG_SOLID || value === BG_TRANSPARENT
}

export function DialogThemeList() {
  const ctx = useTheme()
  const { theme } = ctx
  const dialog = useDialog()
  let confirmed = false
  let ref: DialogSelectRef<string>
  const initial = ctx.selected

  const bgOptions = [
    {
      title: "Solid",
      value: BG_SOLID,
      category: "Background",
      gutter: <text fg={ctx.backgroundMode === "solid" ? theme.primary : RGBA.fromInts(0, 0, 0, 0)}>●</text>,
    },
    {
      title: "Transparent",
      value: BG_TRANSPARENT,
      category: "Background",
      gutter: <text fg={ctx.backgroundMode === "transparent" ? theme.primary : RGBA.fromInts(0, 0, 0, 0)}>●</text>,
    },
  ]

  const themeOptions = Object.keys(ctx.all())
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map((value) => ({
      title: value,
      value: value,
    }))

  const options = [...bgOptions, ...themeOptions]

  onCleanup(() => {
    if (!confirmed) ctx.set(initial)
  })

  return (
    <DialogSelect
      title="Themes"
      options={options}
      current={initial}
      onMove={(opt) => {
        if (isBgOption(opt.value)) return
        ctx.set(opt.value)
      }}
      onSelect={(opt) => {
        if (isBgOption(opt.value)) {
          ctx.setBackgroundMode(opt.value === BG_SOLID ? "solid" : "transparent")
          confirmed = true
          dialog.clear()
          return
        }
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

        const first = ref.filtered.find((opt) => !isBgOption(opt.value))
        if (first) ctx.set(first.value)
      }}
    />
  )
}
