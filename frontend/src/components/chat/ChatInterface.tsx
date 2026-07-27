import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Sparkles, Bot, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatBubble } from './ChatBubble'
import { SuggestedPrompts } from './SuggestedPrompts'
import { postChat } from '@/api/client'
import type { ChatMessage } from '@/types'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 130) + 'px'
    }
  }, [input])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    const loadingMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMsg, loadingMsg])
    setInput('')
    setIsLoading(true)

    // Build history for multi-turn (last 10 turns, exclude loading)
    const history = [...messages, userMsg]
      .filter((m) => !m.isLoading && !m.isError)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const response = await postChat({ message: trimmed, history: history.slice(0, -1) })
      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        {
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(),
        },
      ])
    } catch (err: unknown) {
      const friendly =
        (err as { friendlyMessage?: string })?.friendlyMessage ||
        'Something went wrong. Please check that the backend is running and try again.'

      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        {
          role: 'assistant',
          content: friendly,
          timestamp: new Date(),
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => setMessages([])

  const showSuggestions = messages.length === 0

  return (
    <div className="flex flex-col h-full max-h-full bg-background/50 backdrop-blur-xl relative">
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card/60 backdrop-blur-2xl flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-400 blur-sm opacity-70 animate-pulse-glow" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight text-foreground">ARIA AI</h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                Groq Llama 3.3
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Advanced Revenue Intelligence Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Monday Live Sync</span>
          </div>

          {messages.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearChat}
              className="w-8 h-8 rounded-xl border-border/80 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <ScrollArea className="flex-1">
        <div className="px-4 md:px-8 py-6 space-y-6 max-w-5xl mx-auto">
          {showSuggestions ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 blur-md opacity-60 animate-pulse-glow" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-900 border border-white/20 flex items-center justify-center text-white shadow-2xl">
                    <Bot className="w-10 h-10 text-cyan-300" />
                  </div>
                </div>

                <h3 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">
                  Welcome to <span className="gradient-text">ARIA Intelligence</span>
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed font-medium">
                  Ask founder-level questions about deals, revenue metrics in Rupees (₹), work order statuses, or pipeline risks.
                </p>

                <SuggestedPrompts onSelect={(p) => sendMessage(p)} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence>
              {messages.map((msg, i) => (
                <ChatBubble key={`${msg.role}-${i}`} message={msg} />
              ))}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="p-4 md:p-6 border-t border-border/80 bg-card/60 backdrop-blur-2xl flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-card border border-border/80 rounded-2xl px-4 py-2.5 shadow-2xl focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/15 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask ARIA about deals, revenue in ₹, work orders, pipeline status… (Enter to send)"
              className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/80 resize-none border-none outline-none min-h-[40px] max-h-[130px] py-1.5 leading-relaxed"
              rows={1}
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="h-9 w-9 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex-shrink-0 mb-0.5 shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mt-2 px-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> Shift+Enter for newline
            </span>
            <span>Real-time Monday GraphQL + Groq Llama 3.3</span>
          </div>
        </div>
      </div>
    </div>
  )
}
