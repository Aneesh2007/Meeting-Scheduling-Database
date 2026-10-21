
import { useState } from "react"

import ChatPanel from "@/components/ChatPanel"
import CalendarPanel from "@/components/CalendarPanel"
import SqlPanel from "@/components/SqlPanel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import type { CreateMeetingInput, MeetingEvent } from "@/types/meeting"

const initialSql = `SELECT death 
FROM chitraguptas_records
WHERE name='Apte';`

const initialEvents: MeetingEvent[] = [
  {
    id: "1",
    title: "Apte Funeral",
    description: "Plan the upcoming project.",
    start: new Date(2026, 9, 22, 10, 0),
    end: new Date(2026, 9, 22, 11, 0),
    participants: ["Alex", "Jordan"],
  },
]

export default function App() {
  const [sql, setSql] = useState(initialSql)
  const [events, setEvents] = useState<MeetingEvent[]>(initialEvents)

  function handleCreateEvent(input: CreateMeetingInput) {
    const newEvent: MeetingEvent = {
      ...input,
      id: crypto.randomUUID(),
    }

    setEvents((current) => [...current, newEvent])
  }

  return (
    <main className="flex h-dvh flex-col gap-3 overflow-hidden bg-background p-3">

      <ResizablePanelGroup
        orientation="vertical"
        className="min-h-0 flex-1 gap-0"
      >
        <ResizablePanel defaultSize="76%" minSize="30%">
          <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-0 gap-0"
          >
            <ResizablePanel
              defaultSize="32%"
              minSize="20%"
              maxSize="60%"
              className="min-h-0 min-w-0"
            >
              <ChatPanel onSqlChange={setSql} />
            </ResizablePanel>

            <ResizableHandle
              className="h-full w-3 shrink-0 grow-0 border-0 bg-transparent after:hidden"
            />

            <ResizablePanel
              defaultSize="68%"
              minSize="30%"
              className="min-h-0 min-w-0"
            >
              <CalendarPanel
                events={events}
                onCreateEvent={handleCreateEvent}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle
          className="relative z-10 h-3 min-h-3 w-full shrink-0 grow-0 border-0 bg-transparent after:hidden"
        />

        <ResizablePanel
          defaultSize="24%"
          minSize="12%"
          maxSize="60%"
          className="min-h-0"
        >
          <SqlPanel sql={sql} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}

