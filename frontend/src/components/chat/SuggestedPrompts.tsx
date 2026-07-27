import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void
}

const PROMPTS = [
  { emoji: '📊', label: 'Business summary', prompt: 'Give me a complete business summary — total deals, revenue in Rupees, win rate, and open pipeline.' },
  { emoji: '🏆', label: 'Top deals by value', prompt: 'What are our top 5 highest-value deals in Rupees and their current status?' },
  { emoji: '⚠️', label: 'Overdue work orders', prompt: 'Which work orders are overdue? Who is responsible and what are the priorities?' },
  { emoji: '💰', label: 'Revenue pipeline analysis', prompt: 'Analyze our revenue pipeline in Rupees. What stages have the most value and what deals are at risk?' },
  { emoji: '📈', label: 'Pipeline health & win rate', prompt: 'How healthy is our sales pipeline? What is the win rate and where are we losing deals?' },
  { emoji: '🔧', label: 'Engineer workload', prompt: 'What is the current work order backlog and who is assigned to most critical projects?' },
  { emoji: '🏭', label: 'Industry performance', prompt: 'Which industries/sectors are generating the highest deal revenue?' },
  { emoji: '🚨', label: 'Critical action items', prompt: 'What are the top 3 critical issues I should address today across deals and work orders?' },
]

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="px-4 pb-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Recommended Intelligence Prompts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROMPTS.map((p, i) => (
          <motion.button
            key={p.prompt}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(p.prompt)}
            className="flex items-center justify-between text-left px-4 py-3 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md hover:border-primary/40 hover:bg-accent/60 shadow-lg shadow-purple-500/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform">{p.emoji}</span>
              <span className="text-foreground/90 group-hover:text-primary transition-colors text-xs font-semibold">
                {p.label}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
