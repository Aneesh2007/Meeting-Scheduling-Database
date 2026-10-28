import { useState, type FormEvent } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import {
  createEvent as apiCreateEvent,
  findUsers,
  type BackendEvent,
} from "@/lib/api"

import type { MeetingEvent } from "@/types/meeting"

type CreateEventDialogProps = {
  userId: number
  onCreate: (backend: BackendEvent) => void
}

function toDateTimeLocal(date: Date) {
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  )

  return localDate.toISOString().slice(0, 16)
}

function getDefaultStart() {
  const date = new Date()
  date.setMinutes(0, 0, 0)
  date.setHours(date.getHours() + 1)
  return date
}

function getDefaultEnd(start: Date) {
  return new Date(start.getTime() + 60 * 60 * 1000)
}

export default function CreateEventDialog({
  userId,
  onCreate,
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [start, setStart] = useState(() =>
    toDateTimeLocal(getDefaultStart()),
  )
  const [end, setEnd] = useState(() =>
    toDateTimeLocal(getDefaultEnd(getDefaultStart())),
  )
  const [participants, setParticipants] = useState("")
  const [participantIds, setParticipantIds] = useState<number[]>([])
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState("")

  function resetForm() {
    const defaultStart = getDefaultStart()

    setTitle("")
    setDescription("")
    setStart(toDateTimeLocal(defaultStart))
    setEnd(toDateTimeLocal(getDefaultEnd(defaultStart)))
    setParticipants("")
    setParticipantIds([])
    setError("")
  }

  async function resolveParticipants() {
    if (!participants.trim()) {
      setParticipantIds([])
      return
    }

    setResolving(true)
    setError("")

    try {
      const names = participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)

      const resolvedIds: number[] = []
      const unresolved: string[] = []

      for (const name of names) {
        const users = await findUsers(name, 5)
        const match = users.find(
          (u) =>
            u.username.toLowerCase() === name.toLowerCase() ||
            u.email.toLowerCase() === name.toLowerCase() ||
            u.username.toLowerCase().includes(name.toLowerCase()) ||
            u.email.toLowerCase().includes(name.toLowerCase()),
        )
        if (match) {
          resolvedIds.push(match.user_id)
        } else {
          unresolved.push(name)
        }
      }

      setParticipantIds([...new Set(resolvedIds)])

      if (unresolved.length > 0) {
        setError(
          `Could not find users: ${unresolved.join(", ")}. They will not be invited.`,
        )
      }
    } catch {
      setError("Failed to look up participants.")
    } finally {
      setResolving(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (endDate <= startDate) {
      setError("The end time must be after the start time.")
      return
    }

    apiCreateEvent(userId, {
      title: title.trim(),
      description: description.trim(),
      start: startDate,
      end: endDate,
      participant_ids: participantIds,
    })
      .then((backend) => {
        onCreate(backend)
        setOpen(false)
        resetForm()
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to create event.",
        )
      })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setError("")
          resetForm()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" disabled={resolving}>
          <Plus className="size-4" />
          Create event
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
          <DialogDescription>
            Add a meeting to your calendar and specify its participants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Event title</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Project planning"
              required
              maxLength={100}
              autoFocus
              disabled={resolving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Event description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this meeting about?"
              rows={3}
              disabled={resolving}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-start">Start</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={start}
                onChange={(event) => setStart(event.target.value)}
                required
                disabled={resolving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-end">End</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
                required
                disabled={resolving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-participants">Participants</Label>
            <Input
              id="event-participants"
              value={participants}
              onChange={(event) => setParticipants(event.target.value)}
              placeholder="alex@example.com, Jordan"
              disabled={resolving}
            />
            <button
              type="button"
              onClick={resolveParticipants}
              disabled={resolving || !participants.trim()}
              className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resolving ? "Resolving…" : "Look up users"}
            </button>
            {participantIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {participantIds.length} participant(s) resolved
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Separate participants with commas (name or email), then look them
              up.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={resolving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={resolving || !title.trim()}
            >
              Create event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
