"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, MessageCircle, Smile, Lightbulb } from "lucide-react"
import api from "@/lib/api"
import { useInView } from "react-intersection-observer"
import { useAuth } from "@/contenxts/AuthContext"
import { useRouter } from "next/navigation"
interface Message {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: Date
  emotion?: string
}

const suggestedTopicsDefault = [
  "오늘 하루를 말해줄까?",
  "최근 스트레스가 있어..",
  "기분이 좋았던 순간이 있어!",
]

export default function ChatPage() {
  const history = useRouter();
  const [topRef, inView] = useInView()
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [chatRoomId, setChatRoomId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedTopics] = useState<string[]>(suggestedTopicsDefault)
  const [isFetchingPage, setIsFetchingPage] = useState(false)
  const {isLoggedIn, logout} = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const hasInitialLoadedRef = useRef(false)
  const isPrependRef = useRef(false)
  const prevScrollRef = useRef<{ height: number; top: number } | null>(null)

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!isLoggedIn) {
      alert("로그인 후 이용할 수 있습니다.")
      history.push("/login");
    }
    if (!input.trim() || !chatRoomId) return
    const now = new Date()

    const userMessage: Message = {
      id: `user-${now.getTime()}`,
      text: input,
      sender: "user",
      timestamp: now,
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await api.post("http://localhost:8000/chat", {
        message: userMessage.text,
        convId: chatRoomId,
      })

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: res.data,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedTopic = (topic: string) => {
    setInput(topic)
  }

  const getChatRoomData = async () => {
    if(!isLoggedIn) return;
    await api.post("/auth/conversations", { ai: "DEFAULT" })
    const res2 = await api.get("/auth/conversations")
    setChatRoomId(res2.data[0].id)
  }

  const getChatData = async () => {
    if (last || !chatRoomId || isFetchingPage) return

    const container = scrollContainerRef.current
    if (container && page > 0) {
      prevScrollRef.current = {
        height: container.scrollHeight,
        top: container.scrollTop,
      }
      isPrependRef.current = true
    } else {
      isPrependRef.current = false
      prevScrollRef.current = null
    }

    setIsFetchingPage(true)
    try {
      const res = await api.get(`/auth/messages?roomId=${chatRoomId}&page=${page}`)
      setLast(res.data.last)
      const newMessages: Message[] = res.data.content
        .slice()
        .reverse()
        .map((d: any, i: number) => ({
          id: `${page}-${i}`,
          text: d.content,
          sender: d.role,
          timestamp: new Date(d.createdAt[0],d.createdAt[1] - 1,d.createdAt[2],d.createdAt[3],d.createdAt[4],d.createdAt[5],Math.floor(d.createdAt[6] / 1_000_000),
          ),
        }))

      setMessages(prev => [...newMessages, ...prev])
      setPage(prev => prev + 1)
    } finally {
      setIsFetchingPage(false)
    }
  }
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    if (messages.length === 0) return
    if (!hasInitialLoadedRef.current) {
      hasInitialLoadedRef.current = true
      scrollToBottom("auto")
      return
    }
    if (isPrependRef.current && prevScrollRef.current) {
      const { height, top } = prevScrollRef.current
      const diff = container.scrollHeight - height
      container.scrollTop = top + diff

      isPrependRef.current = false
      prevScrollRef.current = null
      return
    }
    scrollToBottom("smooth")
  }, [messages])

  useEffect(() => {getChatRoomData()}, [])
  useEffect(() => { inView&&chatRoomId && getChatData();}, [inView, chatRoomId])

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">마음 친구와의 상담</h2>
            <p className="text-xs text-muted-foreground">항상 당신의 말을 경청합니다</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={scrollContainerRef}
      >
        {messages.length === 0 && (
          <div className="mt-8 space-y-4">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-3">
                <Smile className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                당신의 감정을 나누어주세요
              </h3>
              <p className="text-sm text-muted-foreground">
                편안한 환경에서 당신의 마음을 이야기할 수 있습니다
              </p>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              {suggestedTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedTopic(topic)}
                  className="w-full p-3 text-left bg-card border border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg transition-all text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{topic}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="h-6" ref={topRef} />

        {messages.map((message, i) => (
          <div
            key={message.id ?? i}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none shadow-sm"
                  : "bg-card border border-border text-foreground rounded-bl-none shadow-sm"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p
                className={`text-xs mt-2 ${
                  message.sender === "user"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {message.timestamp.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="당신의 마음을 나누어주세요..."
            className="flex-1 px-4 py-3 bg-muted border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
