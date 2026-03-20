import { DialogSelect, type DialogSelectRef } from "../ui/dialog-select"
import { useTheme } from "../context/theme"
import { useDialog } from "../ui/dialog"
import { onCleanup } from "solid-js"
import { useKeyboard } from "@opentui/solid"

export function DialogThemeList() {
  const ctx = useTheme()
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
    />
  )
}
