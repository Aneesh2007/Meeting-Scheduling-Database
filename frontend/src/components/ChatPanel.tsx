
import { useState, type FormEvent, type KeyboardEvent } from "react"
import { ArrowUp, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Message,
  MessageContent,
} from "@/components/ui/message"
import {
  Bubble,
  BubbleContent,
} from "@/components/ui/bubble"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

type ChatPanelProps = {
  onSqlChange: (sql: string) => void
}

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    " ",
}

function mockReply(text: string) {
  const query = text.toLowerCase()

  if (query.includes("list") || query.includes("upcoming")) {
    return {
      content:
        "Here's a preview query for upcoming meetings. This is a mock response; no database was queried.",
      sql: `SELECT id, title, start_time, end_time
FROM meetings
WHERE start_time >= CURRENT_TIMESTAMP
ORDER BY start_time ASC;`,
    }
  }

  if (
    query.includes("schedule") ||
    query.includes("book") ||
    query.includes("create")
  ) {
    return {
      content:
        "I'll help plan that meeting. The connected backend will need to check participant availability and conflicts before confirming a slot. No meeting has been created yet.",
      sql: `SELECT participant_id, start_time, end_time
FROM meeting_availability
WHERE participant_id IN (:participant_ids)
  AND start_time >= :preferred_start
ORDER BY start_time ASC;`,
    }
  }

  return {
    content:
      "Could you provide the participants, a preferred date or time range, and the expected duration?",
    sql: `SELECT id, name, email
FROM participants
WHERE name ILIKE :participant_search
ORDER BY name ASC;`,
  }
}

export default function ChatPanel({ onSqlChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    welcomeMessage,
  ])
  const [input, setInput] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const text = input.trim()
    if (!text) return

    const reply = mockReply(text)

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply.content,
      },
    ])

    onSqlChange(reply.sql)
    setInput("")
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  function resetChat() {
    setMessages([{ ...welcomeMessage }])
    setInput("")
    onSqlChange("-- Send a message to generate a SQL preview")
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Chat Interface</h2>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={resetChat}
          aria-label="Start a new chat"
          title="New chat"
        >
          <RotateCcw className="size-4" />
        </Button>
      </header>

      <MessageScrollerProvider autoScroll>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4 p-4">
              {messages.map((message) => (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={message.role === "user"}
                >
                  <Message
                    align={message.role === "user" ? "end" : "start"}
                  >
                    <MessageContent>
                      {message.role === "user" ? (
                        <Bubble align="end" variant="muted">
                          <BubbleContent>
                            {message.content}
                          </BubbleContent>
                        </Bubble>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-6">
                          {message.content}
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>

          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t bg-background p-3"
      >
        <InputGroup>
          <InputGroupTextarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="..."
            aria-label="Message the meeting assistant"
            className="max-h-36 min-h-20 p-3"
          />

          <InputGroupAddon align="block-end">
            <span className="px-2 text-xs text-muted-foreground">
              Enter to send · Shift+Enter for newline
            </span>

            <InputGroupButton
              type="submit"
              size="icon-sm"
              variant="default"
              className="ml-auto rounded-full"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <ArrowUp className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </section>
  )
}

