"use client"

import { useState } from "react"
import { Play, Music, Leaf, Heart } from "lucide-react"
import YouTube from 'react-youtube';
interface Content {
  id: string
  title: string
  category: "meditation" | "music"
  duration: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
  color: string
  thumbnail: string
  url: string
  gradient: string
}

const meditationContents: Content[] = [
  {
    id: "1",
    title: "오늘 하루의 시작",
    category: "meditation",
    duration: "7분",
    description: "하루를 긍정적으로 시작하기 위한 명상",
    level: "beginner",
    color: "from-blue-400 to-blue-600",
    gradient: "bg-gradient-to-br from-blue-400/20 to-blue-600/20",
    thumbnail: 'https://img.youtube.com/vi/dZewQEbQQM0/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dZewQEbQQM0',
  },
  {
    id: "2",
    title: "스트레스 해소",
    category: "meditation",
    duration: "10분",
    description: "일상의 스트레스를 풀어주는 깊은 명상",
    level: "intermediate",
    color: "from-purple-400 to-purple-600",
    gradient: "bg-gradient-to-br from-purple-400/20 to-purple-600/20",
    thumbnail: 'https://img.youtube.com/vi/IAoXsc0OOvI/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?si=UJDt3FSo22mf4_WU&v=IAoXsc0OOvI&feature=youtu.be',
  },
  {
    id: "3",
    title: "숙면을 위한 명상",
    category: "meditation",
    duration: "15분",
    description: "편안한 수면을 위한 이완 명상",
    level: "beginner",
    color: "from-indigo-400 to-indigo-600",
    gradient: "bg-gradient-to-br from-indigo-400/20 to-indigo-600/20",
    thumbnail: 'https://img.youtube.com/vi/PIoK5ZdYk6E/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?si=uMItXitKDCmhNWSk&v=PIoK5ZdYk6E&feature=youtu.be',
  },
  {
    id: "4",
    title: "자신감 회복",
    category: "meditation",
    duration: "12분",
    description: "내면의 힘을 찾아 자신감을 높이는 명상",
    level: "intermediate",
    color: "from-rose-400 to-rose-600",
    gradient: "bg-gradient-to-br from-rose-400/20 to-rose-600/20",
    thumbnail: 'https://img.youtube.com/vi/MmWwXbUM9uY/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=MmWwXbUM9uY',
  },
  {
    id: "5",
    title: "깊은 이완",
    category: "meditation",
    duration: "20분",
    description: "신체와 마음을 완전히 이완시키는 심화 명상",
    level: "advanced",
    color: "from-teal-400 to-teal-600",
    gradient: "bg-gradient-to-br from-teal-400/20 to-teal-600/20",
    thumbnail: 'https://img.youtube.com/vi/inxAScz0PTM/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?si=9pyVVqUo-sa6KOGa&v=inxAScz0PTM&feature=youtu.be',
  },
  {
    id: "6",
    title: "감사 명상",
    category: "meditation",
    duration: "8분",
    description: "감사의 마음으로 긍정의 에너지를 높이기",
    level: "beginner",
    color: "from-amber-400 to-amber-600",
    gradient: "bg-gradient-to-br from-amber-400/20 to-amber-600/20",
    thumbnail: 'https://img.youtube.com/vi/yiysD0Jl2Wo/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=yiysD0Jl2Wo',
  },
]

const musicContents: Content[] = [
  {
    id: "m1",
    title: "평온한 일상",
    category: "music",
    duration: "40분",
    description: "일상에서 마음의 평온함을 주는 피아노 음악",
    level: "beginner",
    color: "from-green-400 to-green-600",
    gradient: "bg-gradient-to-br from-green-400/20 to-green-600/20",
    thumbnail: 'https://img.youtube.com/vi/nEUTBCLNoeQ/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=nEUTBCLNoeQ',
  },
  {
    id: "m2",
    title: "숲의 소리",
    category: "music",
    duration: "45분",
    description: "자연 속 평화로운 명상 음악",
    level: "beginner",
    color: "from-emerald-400 to-emerald-600",
    gradient: "bg-gradient-to-br from-emerald-400/20 to-emerald-600/20",
    thumbnail: 'https://img.youtube.com/vi/CSjmEAeyQao/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=CSjmEAeyQao&list=RDCSjmEAeyQao&start_radio=1',
  },
  {
    id: "m3",
    title: "감성 재즈",
    category: "music",
    duration: "50분",
    description: "마음을 따뜻하게 해주는 재즈 컬렉션",
    level: "intermediate",
    color: "from-orange-400 to-orange-600",
    gradient: "bg-gradient-to-br from-orange-400/20 to-orange-600/20",
    thumbnail: 'https://img.youtube.com/vi/pywxuQJk3vc/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=pywxuQJk3vc',
  },
  {
    id: "m4",
    title: "도시의 밤",
    category: "music",
    duration: "55분",
    description: "밤거리의 감성을 담은 로파이 비트",
    level: "intermediate",
    color: "from-slate-400 to-slate-600",
    gradient: "bg-gradient-to-br from-slate-400/20 to-slate-600/20",
    thumbnail: 'https://img.youtube.com/vi/npqwKtWqNds/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=npqwKtWqNds&list=RDnpqwKtWqNds&start_radio=1',
  },
  {
    id: "m5",
    title: "새벽의 고요함",
    category: "music",
    duration: "48분",
    description: "새벽의 침묵 속에서 느끼는 아름다운 음악",
    level: "advanced",
    color: "from-cyan-400 to-cyan-600",
    gradient: "bg-gradient-to-br from-cyan-400/20 to-cyan-600/20",
    thumbnail: 'https://img.youtube.com/vi/feQn-0ObCAM/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=feQn-0ObCAM&list=RDfeQn-0ObCAM&start_radio=1',
  },
  {
    id: "m6",
    title: "치유의 선율",
    category: "music",
    duration: "43분",
    description: "마음을 치유하는 따뜻한 클래식 음악",
    level: "beginner",
    color: "from-pink-400 to-pink-600",
    gradient: "bg-gradient-to-br from-pink-400/20 to-pink-600/20",
    thumbnail: 'https://img.youtube.com/vi/VE-0WIe7rog/mqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=VE-0WIe7rog&list=RDVE-0WIe7rog&start_radio=1',
  },
]

const levelLabels = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "심화",
}

export default function MindCareContent() {
  const [selectedCategory, setSelectedCategory] = useState<"meditation" | "music">("meditation")

  const contents = selectedCategory === "meditation" ? meditationContents : musicContents

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 shadow-sm">
        <h2 className="font-semibold text-foreground text-lg">마음 관리</h2>
        <p className="text-xs text-muted-foreground mt-1">명상과 음악으로 마음을 돌보세요</p>
      </div>
      {/* <img width={50} src={"https://img.youtube.com/vi/vXvsSSD7yzE/0.jpg"} alt="any"/> */}
      {/* Category Tabs */}
      <div className="border-b border-border bg-card px-4 pt-4">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedCategory("meditation")}
            className={`pb-3 px-1 font-medium text-sm transition-all ${selectedCategory === "meditation"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              명상
            </div>
          </button>
          <button
            onClick={() => setSelectedCategory("music")}
            className={`pb-3 px-1 font-medium text-sm transition-all ${selectedCategory === "music"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              음악
            </div>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => (
            <div
              key={content.id}
              className={`${content.gradient} border border-primary/20 rounded-2xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer`}
              onClick={() => window.open(content.url)}
            >
              {/* Thumbnail */}
              {/* <div className="relative h-40 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center group-hover:from-primary/40 group-hover:to-secondary/40 transition-all"> */}
                <img className="rounded-2xl scale-80" style={{ height: '100%' }} src={content.thumbnail} />
              {/* </div> */}

              {/* Content Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-sm leading-relaxed flex-1">{content.title}</h3>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded whitespace-nowrap ml-2">
                    {levelLabels[content.level]}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{content.description}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{content.duration}</span>
                  <Heart className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
