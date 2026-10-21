
export type MeetingEvent = {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  participants: string[]
}

export type CreateMeetingInput = Omit<MeetingEvent, "id">

