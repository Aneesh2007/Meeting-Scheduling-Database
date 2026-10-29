const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

export type User = {
  user_id: number
  username: string
  email: string
}

export type BackendEvent = {
  event_id: number
  owner_id?: number
  title: string
  description?: string | null
  start_time: string
  end_time: string
  role?: string
  status?: string
}

export type EventInput = {
  title: string
  description?: string
  start: Date
  end: Date
  participant_ids?: number[]
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const payload = (await response.json()) as { detail?: string }
      if (payload.detail) detail = payload.detail
    } catch {
      // Preserve the HTTP error when the server does not return JSON.
    }
    throw new Error(detail)
  }

  return response.json() as Promise<T>
}

export function findUsers(query = "", limit = 10) {
  return request<User[]>(
    `/users/?q=${encodeURIComponent(query)}&limit=${limit}`,
  )
}

export function listEvents({
  userId,
  rangeStart,
  rangeEnd,
  limit = 100,
}: {
  userId: number
  rangeStart?: Date
  rangeEnd?: Date
  limit?: number
}) {
  const params = new URLSearchParams({
    user_id: String(userId),
    limit: String(limit),
  })
  if (rangeStart) params.set("range_start", rangeStart.toISOString())
  if (rangeEnd) params.set("range_end", rangeEnd.toISOString())
  return request<BackendEvent[]>(`/events?${params.toString()}`)
}

export function backendEventToMeetingEvent(event: BackendEvent) {
  return {
    id: String(event.event_id),
    title: event.title,
    description: event.description ?? "",
    start: new Date(event.start_time),
    end: new Date(event.end_time),
    participants: [],
  }
}

export function createEvent(userId: number, input: EventInput) {
  return request<BackendEvent>(`/events?user_id=${userId}`, {
    method: "POST",
    body: {
      title: input.title,
      description: input.description ?? null,
      start: input.start.toISOString(),
      end: input.end.toISOString(),
      participant_ids: input.participant_ids ?? [],
    },
  })
}

export function updateEvent(
  userId: number,
  eventId: number,
  input: Partial<EventInput>,
) {
  return request<BackendEvent>(`/events/${eventId}?user_id=${userId}`, {
    method: "PUT",
    body: {
      ...(input.title === undefined ? {} : { title: input.title }),
      ...(input.description === undefined
        ? {}
        : { description: input.description }),
      ...(input.start === undefined ? {} : { start: input.start.toISOString() }),
      ...(input.end === undefined ? {} : { end: input.end.toISOString() }),
    },
  })
}

export function deleteEvent(userId: number, eventId: number) {
  return request<{ event_id: number }>(
    `/events/${eventId}?user_id=${userId}`,
    { method: "DELETE" },
  )
}

export function rescheduleEvent(
  userId: number,
  eventId: number,
  start: Date,
  end: Date,
) {
  return request<BackendEvent>(`/events/${eventId}/reschedule?user_id=${userId}`, {
    method: "POST",
    body: {
      new_start: start.toISOString(),
      new_end: end.toISOString(),
    },
  })
}

export function duplicateEvent(userId: number, eventId: number, start: Date) {
  return request<BackendEvent>(`/events/${eventId}/duplicate?user_id=${userId}`, {
    method: "POST",
    body: { new_start: start.toISOString() },
  })
}

export type ChatResponse = {
  reply: string
  sql_preview?: string
  pending_action?: {
    id: string
    kind: string
    summary: string
    payload: Record<string, unknown>
    requires_confirmation: boolean
  } | null
  action_result?: unknown
  availability?: unknown
  sources?: unknown[]
}

export function sendChat(
  userId: number,
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  confirmActionId?: string,
) {
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: {
      user_id: userId,
      message,
      history,
      ...(confirmActionId ? { confirm_action_id: confirmActionId } : {}),
    },
  })
}
