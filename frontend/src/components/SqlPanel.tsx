
import { useState } from "react"
import { ChevronDown, ChevronUp, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

type SqlPanelProps = {
  sql: string
}

export default function SqlPanel({ sql }: SqlPanelProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
      <header className="flex shrink-0 items-center justify-between border-b px-3 py-2">
        <h2 className="text-sm font-semibold">SQL Inspection</h2>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!sql}
            onClick={() => void navigator.clipboard.writeText(sql)}
          >
            <Copy className="mr-1 size-3.5" />
            Copy
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={expanded ? "Collapse SQL content" : "Expand SQL content"}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronUp className="size-4" />
            )}
          </Button>
        </div>
      </header>

      {expanded && (
        <textarea
          aria-label="Generated SQL"
          readOnly
          spellCheck={false}
          value={sql}
          placeholder="SQL go brrrrrrrrrrr"
          className="min-h-0 flex-1 resize-none bg-muted/20 p-3 font-mono text-xs leading-5 outline-none"
        />
      )}
    </section>
  )
}

