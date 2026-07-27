import React from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'

export function AIAssistantPage() {
  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      <ChatInterface />
    </div>
  )
}
