"use client";

import { useEffect, useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Cloud,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contenxts/AuthContext";

type EmotionType =
  | "happy"
  | "sad"
  | "angry"
  | "anxious"
  | "calm"
  | "excited";

interface EmotionEntry {
  id: string;
  date: string; // yyyy-MM-dd
  emotion: EmotionType;
  intensity: number; // 0~100
  summary: string;
  diary?: string;
  tags?: string[];
}

type AnalysisResultDto = {
  id?: string;
  _id?: string;
  emotionScore?: number;
  emotionName?: string;
  summary?: string;
  createAt?: string;
};

const getEmotionIcon = (emotion: EmotionType, size = 16) => {
  const iconProps = { size, className: "shrink-0" };
  switch (emotion) {
    case "happy":
      return <Sun {...iconProps} className="shrink-0 text-yellow-500" />;
    case "sad":
      return <CloudRain {...iconProps} className="shrink-0 text-blue-500" />;
    case "angry":
      return (
        <CloudLightning {...iconProps} className="shrink-0 text-red-500" />
      );
    case "anxious":
      return <Cloud {...iconProps} className="shrink-0 text-gray-500" />;
    case "calm":
      return <CloudSnow {...iconProps} className="shrink-0 text-cyan-500" />;
    case "excited":
      return <Zap {...iconProps} className="shrink-0 text-purple-500" />;
    default:
      return <Cloud {...iconProps} className="shrink-0 text-gray-500" />;
  }
};

// ✅ 백엔드 emotionName → 프론트 아이콘 타입으로 넉넉하게 변환
const normalizeEmotionName = (name?: string): EmotionType => {
  const n = (name ?? "").toLowerCase();

  if (
    n.includes("happy") ||
    n.includes("joy") ||
    n.includes("행복") ||
    n.includes("기쁨") ||
    n.includes("즐거")
  )
    return "happy";

  if (
    n.includes("sad") ||
    n.includes("depress") ||
    n.includes("슬픔") ||
    n.includes("우울")
  )
    return "sad";

  if (n.includes("angry") || n.includes("분노") || n.includes("화"))
    return "angry";

  if (
    n.includes("anxious") ||
    n.includes("anxiety") ||
    n.includes("불안") ||
    n.includes("걱정")
  )
    return "anxious";

  if (
    n.includes("excited") ||
    n.includes("설렘") ||
    n.includes("흥분")
  )
    return "excited";

  // neutral/peace 등은 calm으로 흡수
  return "calm";
};

const scoreToIntensity = (score?: number) => {
  if (score == null) return 50;
  // 0~1 범위면 100 스케일로
  if (score <= 1) return Math.max(0, Math.min(100, Math.round(score * 100)));
  // 이미 0~100으로 오면 그대로
  if (score <= 100) return Math.round(score);
  return 50;
};

export default function EmotionCalendar() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ 월별 감정 데이터 가져오기
  useEffect(() => {
    const fetchMonth = async () => {
      if (!token) {
        setEntries([]);
        return;
      }

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      setLoading(true);
      try {
        const res = await api.get<AnalysisResultDto[]>("/auth/calendar", {
          params: { year, month },
        });

        const mapped: EmotionEntry[] = (res.data ?? [])
          .filter((r) => r?.createAt)
          .map((r, idx) => {
            const d = new Date(r.createAt as string);
            const dateStr = format(d, "yyyy-MM-dd");

            return {
              id: String(r.id ?? r._id ?? idx),
              date: dateStr,
              emotion: normalizeEmotionName(r.emotionName),
              intensity: scoreToIntensity(r.emotionScore),
              summary: r.summary ?? "",
              diary: "",
              tags: [],
            };
          });

        setEntries(mapped);
      } catch (e) {
        toast({
          title: "달력 불러오기 실패",
          description: "이번 달 감정 기록을 가져오지 못했어요.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMonth();
  }, [currentMonth, token, toast]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntryForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return entries.find((e) => e.date === dateStr);
  };

  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return entries.find((e) => e.date === dateStr) ?? null;
  }, [selectedDate, entries]);

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              감정 달력
            </CardTitle>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[120px] text-center text-sm font-medium">
                {format(currentMonth, "yyyy년 MM월")}
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {(() => {
                const blanks = monthStart.getDay();
                return Array.from({ length: blanks }).map((_, i) => (
                  <div key={`blank-${i}`} className="h-14 rounded-md" />
                ));
              })()}

              {daysInMonth.map((day) => {
                const entry = getEntryForDate(day);
                const isSelected = selectedDate
                  ? isSameDay(day, selectedDate)
                  : false;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={[
                      "h-14 rounded-xl border text-left px-2 py-2 transition",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={[
                          "text-xs font-medium",
                          isToday(day) ? "text-primary" : "text-foreground",
                        ].join(" ")}
                      >
                        {format(day, "d")}
                      </span>

                      {entry && (
                        <span className="inline-flex items-center">
                          {getEmotionIcon(entry.emotion, 14)}
                        </span>
                      )}
                    </div>

                    {/* 감정 강도 바 느낌(날씨 강수확률 느낌) */}
                    {entry && (
                      <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-primary/70"
                          style={{ width: `${entry.intensity}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {loading && (
              <div className="mt-4 text-xs text-muted-foreground">
                이번 달 감정 기록 불러오는 중...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate
                ? format(selectedDate, "yyyy년 MM월 dd일")
                : "날짜를 선택하세요"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {!token && (
              <div className="text-sm text-muted-foreground">
                로그인하면 감정 기록이 달력에 표시돼요.
              </div>
            )}

            {token && !selectedEntry && (
              <div className="text-sm text-muted-foreground">
                이 날짜에 저장된 감정 기록이 없어요.
              </div>
            )}

            {token && selectedEntry && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getEmotionIcon(selectedEntry.emotion, 18)}
                  <span className="text-sm font-semibold">
                    {selectedEntry.emotion.toUpperCase()}
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    강도 {selectedEntry.intensity}
                  </Badge>
                </div>

                {selectedEntry.summary && (
                  <div className="rounded-lg bg-muted/40 p-3 text-sm">
                    {selectedEntry.summary}
                  </div>
                )}

                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedEntry.tags.map((t, i) => (
                      <Badge key={i} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                {!selectedEntry.summary && (
                  <div className="text-sm text-muted-foreground">
                    요약 정보가 비어 있어요.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
