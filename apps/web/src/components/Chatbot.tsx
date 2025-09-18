import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';

const buttonBaseClasses =
  'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const messageViewportRef = useRef<HTMLDivElement | null>(null)
  const [input, setInput] = useState('');

  const { messages, sendMessage, error } = useChat()
 
  useEffect(() => {
    if (!isOpen) return
    const viewport = messageViewportRef.current
    if (!viewport) return
    viewport.scrollTop = viewport.scrollHeight
  }, [isOpen, messages])

  const hasMessages = messages.length > 0

  const toggleOpen = () => {
    setIsOpen((prev) => !prev)
  }

  // Nicely render a single message part
  const renderPart = (messageId: string, part: any, i: number) => {
    switch (part.type) {
      case 'text': {
        // If this text contains the token, hide the token from display
        const cleaned = (part.text as string)?.trim();
        return (
          <div key={`${messageId}-t-${i}`}>
            {cleaned}
          </div>
        );
      }
      default:
        return null;
    }
  };
  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-24 right-6 z-40 w-[min(22rem,calc(100vw-3rem))] overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">AI Trading Copilot</p>
              <p className="text-xs text-muted-foreground">Ask about journaling, stats, or next actions.</p>
            </div>
            <Button size="icon" variant="ghost" onClick={toggleOpen} className="h-8 w-8 rounded-full">
              <span aria-hidden>×</span>
              <span className="sr-only">Close chat</span>
            </Button>
          </div>

          <div
            ref={messageViewportRef}
            className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4 text-sm"
          >
            {hasMessages ? (
              messages.map((message) => {
                const isUser = message.role === 'user'
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex w-full',
                      isUser ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3 py-2 shadow-sm',
                        isUser
                          ? 'bg-primary/20 text-primary-foreground/90 backdrop-blur'
                          : 'bg-muted/25 text-muted-foreground'
                      )}
                    >
                      {message.parts.map((part, i) => renderPart(message.id, part, i))}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-muted-foreground">
                👋 Hi! I can summarise performance, suggest focus points, or walk you through the journal features. How can I help?
              </p>
            )}
          </div>

          {error ? (
            <div className="px-4 pb-2 text-xs text-rose-300">{error.message ?? 'Something went wrong.'}</div>
          ) : null}

          <form
            onSubmit={async (event) => {
              event.preventDefault()
              if (!input.trim()) return
              console.log(input)
              await sendMessage({ text: input });
            }}
            className="border-t border-border/60 bg-card/90 px-4 py-3"
          >
            <label htmlFor="chatbot-input" className="sr-only">
              Ask the assistant
            </label>
            <div className="flex items-end gap-2">
              <Input
                id="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}                placeholder="Ask anything about your trading journal..."
                className="flex-1 bg-background/40"
                autoComplete="off"
              />
              <Button type="submit" size="sm" disabled={!input.trim()}>
               Send
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <button type="button" className={buttonBaseClasses} onClick={toggleOpen} aria-expanded={isOpen}>
        <span className="sr-only">Toggle AI assistant</span>
        <span className="text-lg font-semibold">AI</span>
      </button>
    </>
  )
}
