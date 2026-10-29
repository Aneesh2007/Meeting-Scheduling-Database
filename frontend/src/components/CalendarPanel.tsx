import { useState } from "react"
import moment from "moment"
import {
  momentLocalizer,
  type View,
} from "react-big-calendar"

import ShadcnBigCalendar from "@/components/shadcn-big-calendar/shadcn-big-calendar"
import CreateEventDialog from "@/components/CreateEventDialog"
import type { MeetingEvent } from "@/types/meeting"
import {
  updateEvent as apiUpdateEvent,
  deleteEvent as apiDeleteEvent,
  rescheduleEvent as apiRescheduleEvent,
  duplicateEvent as apiDuplicateEvent,
} from "@/lib/api"
import {
  Button,
} from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const localizer = momentLocalizer(moment)

type CalendarPanelProps = {
  userId: number
  events: MeetingEvent[]
  onEventsChange: React.Dispatch<React.SetStateAction<MeetingEvent[]>>
}

// -------------------------------------------------------
// Edit Event Dialog
// -------------------------------------------------------

type EditEventDialogProps = {
  event: MeetingEvent
  userId: number
  onUpdate: (event: MeetingEvent) => void
  onDelete: () => void
  onClose: () => void
  open: boolean
}

function EditEventDialog({
  event,
  userId,
  onUpdate,
  onDelete,
  onClose,
  open,
}: EditEventDialogProps) {
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description)
  const [start, setStart] = useState(
    new Date(event.start.getTime() - event.start.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16),
  )
  const [end, setEnd] = useState(
    new Date(event.end.getTime() - event.end.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16),
  )
  const [error, setError] = useState("")

  function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    setError("")

    const startDate = new Date(start)
    const endDate = new Date(end)
    if (endDate <= startDate) {
      setError("The end time must be after the start time.")
      return
    }

    const updated: MeetingEvent = {
      ...event,
      title: title.trim(),
      description: description.trim(),
      start: startDate,
      end: endDate,
    }

    apiUpdateEvent(userId, Number(event.id), {
      title: updated.title,
      description: updated.description,
      start: updated.start,
      end: updated.end,
    })
      .then(() => {
        onUpdate(updated)
        onClose()
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to update event.",
        )
      })
  }

  function handleDelete() {
    apiDeleteEvent(userId, Number(event.id))
      .then(() => {
        onDelete()
        onClose()
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to delete event.")
      })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" disabled={!open} />}
      >
        <span>
          Edit
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Event title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-start">Start</Label>
              <Input
                id="edit-start"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end">End</Label>
              <Input
                id="edit-end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              Delete event
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// -------------------------------------------------------
// Reschedule Event Dialog
// -------------------------------------------------------

type RescheduleEventDialogProps = {
  event: MeetingEvent
  userId: number
  onReschedule: (event: MeetingEvent) => void
  onClose: () => void
  open: boolean
}

function RescheduleEventDialog({
  event,
  userId,
  onReschedule,
  onClose,
  open,
}: RescheduleEventDialogProps) {
  const [newStart, setNewStart] = useState(
    new Date(event.start.getTime() - event.start.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16),
  )
  const [newEnd, setNewEnd] = useState(
    new Date(event.end.getTime() - event.end.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16),
  )
  const [error, setError] = useState("")

  function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    setError("")

    const startDate = new Date(newStart)
    const endDate = new Date(newEnd)
    if (endDate <= startDate) {
      setError("The end time must be after the start time.")
      return
    }

    apiRescheduleEvent(userId, Number(event.id), startDate, endDate)
      .then(() => {
        onReschedule({
          ...event,
          start: startDate,
          end: endDate,
        })
        onClose()
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to reschedule event.",
        )
      })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" disabled={!open} />}
      >
        <span>
          Reschedule
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reschedule-start">New start</Label>
              <Input
                id="reschedule-start"
                type="datetime-local"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-end">New end</Label>
              <Input
                id="reschedule-end"
                type="datetime-local"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                required
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Reschedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// -------------------------------------------------------
// Duplicate Event Dialog
// -------------------------------------------------------

type DuplicateEventDialogProps = {
  event: MeetingEvent
  userId: number
  onDuplicate: (event: MeetingEvent) => void
  onClose: () => void
  open: boolean
}

function DuplicateEventDialog({
  event,
  userId,
  onDuplicate,
  onClose,
  open,
}: DuplicateEventDialogProps) {
  const [newStart, setNewStart] = useState(() => {
    const now = new Date()
    return new Date(
      now.getTime() + 60 * 60 * 1000 - now.getTimezoneOffset() * 60_000,
    )
      .toISOString()
      .slice(0, 16)
  })
  const [error, setError] = useState("")

  function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    setError("")

    const startDate = new Date(newStart)
    apiDuplicateEvent(userId, Number(event.id), startDate)
      .then((backend) => {
        onDuplicate({
          id: String(backend.event_id),
          title: backend.title,
          description: backend.description ?? "",
          start: new Date(backend.start_time),
          end: new Date(backend.end_time),
          participants: [],
        })
        onClose()
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to duplicate event.",
        )
      })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" disabled={!open} />}
      >
        <span>
          Duplicate
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicate event</DialogTitle>
          <DialogDescription>
            Create a copy of this event at a new time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duplicate-start">New start time</Label>
            <Input
              id="duplicate-start"
              type="datetime-local"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              required
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Duplicate</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// -------------------------------------------------------
// CalendarPanel
// -------------------------------------------------------

export default function CalendarPanel({
  userId,
  events,
  onEventsChange,
}: CalendarPanelProps) {
  const [view, setView] = useState<View>("week")
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null)
  const [dialogMode, setDialogMode] = useState<
    "edit" | "reschedule" | "duplicate" | null
  >(null)

  const editOpen = dialogMode === "edit" && selectedEvent != null
  const rescheduleOpen = dialogMode === "reschedule" && selectedEvent != null
  const duplicateOpen = dialogMode === "duplicate" && selectedEvent != null

  function handleEventClick(event: MeetingEvent) {
    setSelectedEvent(event)
  }

  function handleUpdate(updated: MeetingEvent) {
    onEventsChange((current) =>
      current.map((e) => (e.id === updated.id ? updated : e)),
    )
    setSelectedEvent(null)
    setDialogMode(null)
  }

  function handleReschedule(updated: MeetingEvent) {
    onEventsChange((current) =>
      current.map((e) => (e.id === updated.id ? updated : e)),
    )
    setSelectedEvent(null)
    setDialogMode(null)
  }

  function handleDuplicate(added: MeetingEvent) {
    onEventsChange((current) => [...current, added])
    setSelectedEvent(null)
    setDialogMode(null)
  }

  function handleDelete() {
    if (!selectedEvent) return
    onEventsChange((current) =>
      current.filter((e) => e.id !== selectedEvent.id),
    )
    setSelectedEvent(null)
    setDialogMode(null)
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Calendar</h2>
          <p className="text-xs text-muted-foreground">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </p>
        </div>

        <CreateEventDialog
          userId={userId}
          onCreate={(backend) => {
            const newEvent: MeetingEvent = {
              id: String(backend.event_id),
              title: backend.title,
              description: backend.description ?? "",
              start: new Date(backend.start_time),
              end: new Date(backend.end_time),
              participants: [],
            }
            onEventsChange((current) => [...current, newEvent])
          }}
        />

      </header>

      <div className="min-h-0 min-w-0 flex-1 p-2">
        <ShadcnBigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          date={date}
          onNavigate={setDate}
          view={view}
          onView={setView}
          style={{ height: "100%", width: "100%" }}
          eventPropGetter={() => ({
            className: "event-variant-primary",
          })}
          onSelectEvent={(event: MeetingEvent) => {
            handleEventClick(event)
            setDialogMode("edit")
          }}
          onDoubleClickEvent={(event: MeetingEvent) => {
            handleEventClick(event)
            setDialogMode("edit")
          }}
        />
      </div>

      {selectedEvent && (
        <>
          <EditEventDialog
            event={selectedEvent}
            userId={userId}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onClose={() => {
              setSelectedEvent(null)
              setDialogMode(null)
            }}
            open={editOpen}
          />

          <RescheduleEventDialog
            event={selectedEvent}
            userId={userId}
            onReschedule={handleReschedule}
            onClose={() => {
              setSelectedEvent(null)
              setDialogMode(null)
            }}
            open={rescheduleOpen}
          />

          <DuplicateEventDialog
            event={selectedEvent}
            userId={userId}
            onDuplicate={handleDuplicate}
            onClose={() => {
              setSelectedEvent(null)
              setDialogMode(null)
            }}
            open={duplicateOpen}
          />
        </>
      )}
    </section>
  )
}
