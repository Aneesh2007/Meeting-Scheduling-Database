import { useState, useEffect, useCallback } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { User } from "@/lib/api"
import {
  findUsers,
  listEvents,
  backendEventToMeetingEvent,
} from "@/lib/api"

import ChatPanel from "@/components/ChatPanel"
import CalendarPanel from "@/components/CalendarPanel"
import SqlPanel from "@/components/SqlPanel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import type { MeetingEvent } from "@/types/meeting"

const initialSql = `SELECT death 
FROM chitraguptas_records
WHERE name='Apte';`

export default function App() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<MeetingEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [sql, setSql] = useState(initialSql)

  // Load users for the picker
  useEffect(() => {
    findUsers("", 50).then(setUsers).catch(() => setUsers([]))
  }, [])

  // Fetch events for the current user
  const fetchEvents = useCallback(async () => {
    if (currentUserId === null) return
    setLoading(true)
    try {
      const backendEvents = await listEvents({
        userId: currentUserId,
        limit: 200,
      })
      setEvents(
        backendEvents.map((e) => backendEventToMeetingEvent(e)),
      )
    } catch (err) {
      console.error("Failed to load events:", err)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    // This effect synchronizes calendar state with the selected backend user.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents()
  }, [fetchEvents])

  if (currentUserId === null) {
    return (
      <main className="flex h-dvh flex-col gap-3 overflow-hidden bg-background p-3">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
          <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Select User</h2>
          </header>
          <div className="min-h-0 flex-1 p-6">
            <p className="text-sm text-muted-foreground">
              Please select a user to view their calendar.
            </p>
            <Select
              defaultValue={users[0]?.user_id.toString() ?? ""}
              onValueChange={(value) => {
                setCurrentUserId(Number(value))
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={String(user.user_id)}>
                    {user.username} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="flex h-dvh flex-col gap-3 overflow-hidden bg-background p-3">

      {/* User selector bar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            User:
          </span>
          <Select
            defaultValue={currentUserId.toString()}
            onValueChange={(value) => {
              setCurrentUserId(Number(value))
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.user_id} value={String(user.user_id)}>
                  {user.username} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-xs text-muted-foreground animate-pulse">
              Loading events…
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {events.length} events
            </span>
          )}
        </div>
      </header>

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
              <ChatPanel
                onSqlChange={setSql}
                userId={currentUserId}
                onActionCompleted={fetchEvents}
              />
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
                userId={currentUserId}
                events={events}
                onEventsChange={setEvents}
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
