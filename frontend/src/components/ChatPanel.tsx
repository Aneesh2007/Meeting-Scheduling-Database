
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
import { sendChat } from "@/lib/api"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

type ChatPanelProps = {
  onSqlChange: (sql: string) => void
  userId: number
  onActionCompleted: () => void
}

type PendingAction = {
  id: string
  summary: string
}

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    " ",
}

export default function ChatPanel({
  onSqlChange,
  userId,
  onActionCompleted,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    welcomeMessage,
  ])
  const [input, setInput] = useState("")
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  async function confirmAction() {
    if (!pendingAction) return

    try {
      const reply = await sendChat(userId, "Confirm", [], pendingAction.id)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply.reply,
        },
      ])
      setPendingAction(null)
      onActionCompleted()
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "The calendar operation failed.",
        },
      ])
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const text = input.trim()
    if (!text) return

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
        content: "Thinking…",
      },
    ])
    setInput("")

    try {
      const history = messages
        .filter((message) => message.id !== "welcome" && message.content !== "Thinking…")
        .map(({ role, content }) => ({ role, content }))
      const reply = await sendChat(userId, text, history)
      setMessages((current) => [
        ...current.slice(0, -1),
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply.reply,
        },
      ])
      setPendingAction(
        reply.pending_action
          ? {
              id: reply.pending_action.id,
              summary: reply.pending_action.summary,
            }
          : null,
      )
      onSqlChange(reply.sql_preview ?? "-- No backend preview available")
    } catch (error) {
      setMessages((current) => [
        ...current.slice(0, -1),
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "The assistant request failed.",
        },
      ])
    }

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

      {pendingAction && (
        <div className="shrink-0 border-t p-3">
          <p className="mb-2 text-sm">{pendingAction.summary}</p>
          <Button type="button" onClick={confirmAction} size="sm">
            Confirm action
          </Button>
        </div>
      )}

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
