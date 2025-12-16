"use client"

import { useEffect, useState } from "react"
import { Sun, Cloud, CloudRain, CloudSnow, Wind, CloudDrizzle, ChevronLeft, ChevronRight, X, TrendingUp, Share2, Wand2, } from "lucide-react"
import api from "@/lib/api"

interface EmotionChange {
    count:number
    topEmotion:string
    volatility:string
}

interface EmotionEntry {
  analysisCode: number | undefined
  emotionScore: number
  emotionName: string
  summary: string
  createAt: number[]
  userCode: number
}


const emotionWeatherMap = {
  sunny: { icon: Sun, label: "맑음", color: "text-yellow-500" },  // 5
  cloudy: { icon: Cloud, label: "흐림", color: "text-gray-400" }, // 4
  drizzle: { icon: CloudDrizzle, label: "이슬비", color: "text-blue-400" }, // 3
  rainy: { icon: CloudRain, label: "비", color: "text-blue-500" },  // 3 <
}

export default function EmotionCalendar() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedEntry, setSelectedEntry] = useState<EmotionEntry | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [generatedDiary, setGeneratedDiary] = useState<string | null>(null)
  const [serverData, setServerData] = useState<EmotionEntry[]>([]);
  const [emotionChange, setEmotionChange] = useState<EmotionChange | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getEmotionForDate = (day: number): EmotionEntry | undefined => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return serverData.find((entry) => `${entry.createAt[0]}-${entry.createAt[1]}-${entry.createAt[2]}` === dateString)
  }
  // 일기 자동 생성 눌렀을 때 작동하는 함수
  const handleGenerateDiary = () => {
    if (!selectedEntry) return
    const generatedText = `[AI 자동 생성 일기]\n\n${selectedEntry.summary}\n\n이 날씨의 감정 상태에서 당신은 많은 생각과 경험을 나누었습니다. 오늘의 경험이 당신의 성장에 도움이 되기를 바랍니다.`
    setGeneratedDiary(generatedText)
  }
  const getCalendarData = async () => {
    // console.log(currentDate);
    
    const res = await api.get(`/auth/calendar?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()+1}`)
    // console.log(res.data);
    setServerData(res.data);
  }
  const getEmotionChange = async() => {
    const res = await api.get(`/auth/emotion?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()+1}`)
    setEmotionChange(res.data);    
    console.log(res.data);
    
  }
  useEffect(()=>{
    getCalendarData();
  },[])
  useEffect(() => {
    getEmotionChange();    
  },[currentDate])

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
  const getEmotionWeatherIcon = (score: number | undefined) => {
    if(score === undefined) return [Cloud, "text-gray-400"]
    if (score === 5) {
      return [Sun, "text-yellow-500"]
    } else if (score <= 4) {
      return [Cloud,"text-gray-400"]
    } else if (score <= 3) {
      return [CloudDrizzle,"text-blue-400"]
    } else {
      return [CloudRain,"text-blue-500"]
    }
  }
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 shadow-sm">
        <h2 className="font-semibold text-foreground text-lg">감정 기록</h2>
        <p className="text-xs text-muted-foreground mt-1">날씨로 표현된 당신의 감정을 확인하세요</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={previousMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-lg">
                {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
              </h3>
              <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const emotion = day ? getEmotionForDate(day) : null
                const [WeatherIcon, color] = getEmotionWeatherIcon(emotion?.emotionScore);

                return (
                  <button
                    key={index}
                    onClick={() => emotion && setSelectedEntry(emotion)}
                    disabled={!emotion}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all ${day
                        ? emotion
                          ? "bg-primary/10 hover:bg-primary/20 cursor-pointer border border-primary/30"
                          : "bg-muted text-muted-foreground"
                        : "bg-transparent"
                      }`}
                  >
                    {day && (
                      <div className="flex flex-col items-center">
                        {emotion && WeatherIcon && (
                          <WeatherIcon className={`w-6 h-6 ${emotion && color}`} />
                        )}
                        {!emotion && <span className="text-sm text-muted-foreground">{day}</span>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm font-medium mb-3 text-foreground">감정 날씨</p>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(emotionWeatherMap).map(([key, { icon: Icon, label }]) => (
                  <div key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emotion Report */}
          <div className="lg:col-span-1 space-y-4">
            {/* Report Card */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">감정 변화</h4>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">이번 달 기록 횟수</span>
                  <span className="font-semibold text-primary">{emotionChange?.count}회</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">가장 많은 감정</span>
                  <span className="font-semibold text-primary">{emotionChange?.topEmotion !== '-' ? emotionChange?.topEmotion : '없음'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">감정 변동성</span>
                  <span className="font-semibold text-primary">{emotionChange?.volatility!=='-'?emotionChange?.volatility:'없음'}</span>
                </div>
              </div>

              
            </div>

            {/* Selected Entry */}
            {selectedEntry && (
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-foreground">오늘의 일기</h4>
                  <button
                    onClick={() => {
                      setSelectedEntry(null)
                      setGeneratedDiary(null)
                    }}
                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  {new Date(`${selectedEntry.createAt[0]}-${selectedEntry.createAt[1]}-${selectedEntry.createAt[2]}`).toLocaleDateString("ko-KR")}
                </p>

                <div className="mb-4">
                  <p className="text-sm text-foreground leading-relaxed mb-4">{selectedEntry.summary}</p>
                </div>

                {!generatedDiary ? (
                  <button
                    onClick={handleGenerateDiary}
                    className="w-full mt-4 px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    일기 자동 생성
                  </button>
                ) : (
                  <div className="space-y-2 mt-4">
                    <div className="p-3 bg-card rounded-lg border border-border max-h-24 overflow-y-auto">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">생성된 일기:</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{generatedDiary}</p>
                    </div>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      커뮤니티에 공유하기
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">커뮤니티에 공유</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">공유할 일기:</p>
                <div className="p-3 bg-muted rounded-lg border border-border max-h-24 overflow-y-auto">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{generatedDiary}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">제목 (선택사항)</label>
                <input
                  type="text"
                  placeholder="커뮤니티에서 보여질 제목을 입력하세요"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">태그 (선택사항)</label>
                <input
                  type="text"
                  placeholder="예: 감사, 성취, 희망 (쉼표로 구분)"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border flex gap-2 justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors font-medium text-sm"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowShareModal(false)
                  setGeneratedDiary(null)
                }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium text-sm"
              >
                공유하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}