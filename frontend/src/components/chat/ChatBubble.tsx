import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion'
import { Sparkles, User, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'

interface ChatBubbleProps {
  message: ChatMessage
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-1">
      <span className="text-xs font-semibold text-violet-400 mr-1 animate-pulse">ARIA is thinking</span>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  const isLoading = message.isLoading

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex items-start gap-3.5', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div className={cn(
        'w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-200 hover:scale-105',
        isUser
          ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-indigo-500/20'
          : 'bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-purple-500/30'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4.5 h-4.5 text-cyan-200 animate-spin-slow" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn(
        'max-w-[85%] sm:max-w-[80%] rounded-3xl px-5 py-3.5 shadow-xl transition-all duration-200',
        isUser
          ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white rounded-tr-xs border border-white/20 shadow-indigo-500/15'
          : message.isError
            ? 'bg-amber-500/10 border border-amber-500/40 text-amber-200 rounded-tl-xs backdrop-blur-xl'
            : 'bg-card/90 border border-border/80 text-foreground rounded-tl-xs backdrop-blur-xl shadow-purple-500/5 hover:border-primary/30',
      )}>
        {isLoading ? (
          <TypingDots />
        ) : message.isError ? (
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-amber-200 leading-relaxed">{message.content}</p>
          </div>
        ) : isUser ? (
          <p className="text-sm font-medium leading-relaxed tracking-wide">{message.content}</p>
        ) : (
          <div className="markdown-body text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp */}
        {!isLoading && (
          <p className={cn(
            'text-[10px] font-medium mt-2',
            isUser ? 'text-white/70 text-right' : 'text-muted-foreground'
          )}>
            {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  )
}
