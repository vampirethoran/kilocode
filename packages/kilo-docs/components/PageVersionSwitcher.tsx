import React from "react"
import type { Platform } from "../lib/types"

interface PageVersionSwitcherProps {
  platform?: Platform
}

export function PageVersionSwitcher({ platform }: PageVersionSwitcherProps) {
  if (!platform || platform === "all") return null

  const isClassic = platform === "classic"
  return (
    <div className="version-banner">
      <span className="version-banner-icon">{isClassic ? "\u24D8" : "\u2728"}</span>
      <span>
        {isClassic
          ? "This page documents the VSCode extension. The Pre-release VSCode extension & CLI does not have an equivalent page yet."
          : "This page documents the Pre-release VSCode extension & CLI. There is no equivalent page for the current VSCode extension."}
      </span>

      <style jsx>{`
        .version-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          color: var(--text-color);
        }

        .version-banner-icon {
          flex-shrink: 0;
          font-size: 1rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
