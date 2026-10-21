
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

import type { CreateMeetingInput } from "@/types/meeting"

type CreateEventDialogProps = {
  onCreate: (event: CreateMeetingInput) => void
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
  const [error, setError] = useState("")

  function resetForm() {
    const defaultStart = getDefaultStart()

    setTitle("")
    setDescription("")
    setStart(toDateTimeLocal(defaultStart))
    setEnd(toDateTimeLocal(getDefaultEnd(defaultStart)))
    setParticipants("")
    setError("")
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

    const participantList = [
      ...new Set(
        participants
          .split(",")
          .map((participant) => participant.trim())
          .filter(Boolean),
      ),
    ]

    onCreate({
      title: title.trim(),
      description: description.trim(),
      start: startDate,
      end: endDate,
      participants: participantList,
    })

    setOpen(false)
    resetForm()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setError("")
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
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
              maxLength={150}
              autoFocus
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
            />
            <p className="text-xs text-muted-foreground">
              Separate participants with commas.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

