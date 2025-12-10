"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, MessageCircle, Smile, Lightbulb, Settings2 } from "lucide-react"
import axios from "axios"
import api from "@/lib/api"
import { useInView } from 'react-intersection-observer';

interface Message {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: Date
  emotion?: string
}

const emotionEmojis: { [key: string]: string } = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  anxious: "😰",
  neutral: "😐",
  grateful: "🙏",
  excited: "🤩",
}

const chatbotModes = [
  { id: "polite", label: "존댓말", description: "존댓말로 대화합니다" },
  { id: "casual", label: "반말", description: "편한 반말로 대화합니다" },
]

export default function ChatPage() {
  const [ref, inView] = useInView();
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: '안녕하세요! 저는 심리 상담 AI 봇 "마음 친구"입니다. 오늘 기분은 어떠신가요? 무엇이 당신의 마음을 더 편하게 해줄 수 있을까요?',
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [chatRoomId, setChatRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([
    "오늘 하루를 말해줄래?",
    "최근 스트레스가 있어?",
    "기분이 좋았던 순간이 있어?",
  ])
  const [selectedMode, setSelectedMode] = useState("polite")
  const [showModeSelector, setShowModeSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    const res = await api.post("http://localhost:8000/chat", { message: input, convId: chatRoomId });
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: res.data,
      sender: "ai",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, aiMessage])
    setIsLoading(false)

  }

  const handleSuggestedTopic = (topic: string) => {
    setInput(topic)
  }
  const getChatRoomData = async () => {
    // const res = await api.post('http://localhost:8080/auth/conversations',{ai:"DEFAULT"});
    const res2 = await api.get('http://localhost:8080/auth/conversations');
    setChatRoomId(res2.data[0].id);
  }
  const getChatData = async () => {
    if (!last) {
      const res = await api.get(`http://localhost:8080/auth/messages?roomId=${chatRoomId}&page=${page}`)
      setLast(res.data.last);
      
      res.data.content.map((d: any, i: number) => {
        const aiMessage: Message = {
          id: i.toString(),
          text: d.content,
          sender: d.role,
          timestamp: new Date(
            d.createdAt[0],
            d.createdAt[1] - 1,
            d.createdAt[2],
            d.createdAt[3],
            d.createdAt[4],
            d.createdAt[5],
            Math.floor(d.createdAt[6] / 1_000_000)
          )
        }
        setMessages((prev) => [...prev, aiMessage]);
      })
      setPage(page + 1);
    }

  }
  useEffect(() => {
    getChatRoomData();
  }, [])
  useEffect(() => {
    if (inView) {
      console.log("inView 상태");
      getChatData();
    }
  }, [inView])
  useEffect(() => {
    console.log("page :", page);
  }, [page])
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
        <div className="relative">
          <button
            onClick={() => setShowModeSelector(!showModeSelector)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="챗봇 모드 선택"
          >
            <Settings2 className="w-5 h-5 text-primary" />
          </button>

          {showModeSelector && (
            <div className="absolute right-0 top-12 bg-card border border-border rounded-lg shadow-lg p-3 w-48 z-50">
              <p className="text-xs font-medium text-muted-foreground mb-2">챗봇 모드 선택</p>
              {chatbotModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode.id)
                    setShowModeSelector(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm mb-1 ${selectedMode === mode.id
                    ? "bg-primary/20 text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                    }`}
                >
                  <p className="font-medium">{mode.label}</p>
                  <p className="text-xs text-muted-foreground">{mode.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 1 && (
          <div className="mt-8 space-y-4">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-3">
                <Smile className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">당신의 감정을 나누어주세요</h3>
              <p className="text-sm text-muted-foreground">편안한 환경에서 당신의 마음을 이야기할 수 있습니다</p>
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
        <div className="bg-black w-200 h-20" ref={ref}></div>
        {messages.map((message, i) => (
          <div key={i} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.sender === "user"
                ? "bg-primary text-primary-foreground rounded-br-none shadow-sm"
                : "bg-card border border-border text-foreground rounded-bl-none shadow-sm"
                }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p
                className={`text-xs mt-2 ${message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
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
            onChange={(e) => setInput(e.target.value)}
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
