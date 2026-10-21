
import { useState } from "react"
import moment from "moment"
import {
  momentLocalizer,
  type View,
} from "react-big-calendar"

import ShadcnBigCalendar from "@/components/shadcn-big-calendar/shadcn-big-calendar"
import CreateEventDialog from "@/components/CreateEventDialog"
import type { CreateMeetingInput, MeetingEvent } from "@/types/meeting"

const localizer = momentLocalizer(moment)

type CalendarPanelProps = {
  events: MeetingEvent[]
  onCreateEvent: (event: CreateMeetingInput) => void
}

export default function CalendarPanel({
  events,
  onCreateEvent,
}: CalendarPanelProps) {
  const [view, setView] = useState<View>("week")
  const [date, setDate] = useState(new Date())

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Calendar</h2>
        </div>

        <CreateEventDialog onCreate={onCreateEvent} />
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
        />
      </div>
    </section>
  )
}

