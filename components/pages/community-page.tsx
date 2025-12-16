"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Heart,
  MessageCircle,
  Share2,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  CloudDrizzle,
  X,
  Edit2,
  Trash2,
  Send,
} from "lucide-react"
import api from "@/lib/api"

interface Post {
  id: string
  author: string
  avatar: string
  date: string
  emotion: "sunny" | "cloudy" | "rainy" | "snowy" | "windy" | "drizzle"
  title: string
  content: string
  likes: number
  comments: number
  tags: string[]
  isOwn?: boolean
}

interface Comment {
  id: string
  author: string
  avatar: string
  date: string
  content: string
  isOwn?: boolean
}

type ForumResponse = {
  id: number
  userCode: number
  title: string
  content: string
  deleted: boolean
  analysisSummary?: string | null
  emotionName?: string | null
  commentCount?: number | null
  likeCount?: number | null
  createdAt: string
}

type CommentResponse = {
  id: number
  forumId: number
  userCode: number
  content: string
  parentCommentId?: number | null
  deleted: boolean
  createdAt: string
}

const emotionWeatherMap: Record<Post["emotion"], { icon: any; label: string; color: string }> = {
  sunny: { icon: Sun, label: "맑음", color: "text-yellow-500" },
  cloudy: { icon: Cloud, label: "흐림", color: "text-gray-400" },
  rainy: { icon: CloudRain, label: "비", color: "text-blue-500" },
  snowy: { icon: CloudSnow, label: "눈", color: "text-blue-300" },
  windy: { icon: Wind, label: "바람", color: "text-gray-500" },
  drizzle: { icon: CloudDrizzle, label: "이슬비", color: "text-blue-400" },
}

const sortOptions = ["최신순", "인기순", "댓글순"] as const
type SortOption = (typeof sortOptions)[number]

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("최신순")
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)

  const [commentText, setCommentText] = useState("")
  const [selectedComments, setSelectedComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liking, setLiking] = useState(false)

  const currentUserCode = useMemo(() => {
    if (typeof window === "undefined") return 0
    const raw = window.localStorage.getItem("userCode")
    const n = raw ? Number(raw) : 0
    return Number.isFinite(n) ? n : 0
  }, [])

  const truncateText = (text: string, maxLength = 150) => (text.length > maxLength ? text.substring(0, maxLength) + "..." : text)

  const formatDate = (value: string) => {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
  }

  const mapForumToPost = (forum: ForumResponse): Post => {
    const rawEmotion = (forum.emotionName || "").toLowerCase()
    const emotionKey: Post["emotion"] =
      rawEmotion === "sunny" || rawEmotion === "cloudy" || rawEmotion === "rainy" || rawEmotion === "snowy" || rawEmotion === "windy" || rawEmotion === "drizzle"
        ? (rawEmotion as Post["emotion"])
        : "sunny"

    return {
      id: String(forum.id),
      author: "익명",
      avatar: "👤",
      date: formatDate(forum.createdAt),
      emotion: emotionKey,
      title: forum.title,
      content: forum.content,
      likes: forum.likeCount ?? 0,
      comments: forum.commentCount ?? 0,
      tags: [],
      isOwn: currentUserCode ? forum.userCode === currentUserCode : false,
    }
  }

  const mapCommentToComment = (comment: CommentResponse): Comment => {
    return {
      id: String(comment.id),
      author: "익명",
      avatar: "👤",
      date: formatDate(comment.createdAt),
      content: comment.content,
      isOwn: currentUserCode ? comment.userCode === currentUserCode : false,
    }
  }

  const fetchPosts = async (sortParam?: string) => {
    try {
      setLoading(true)
      const res = await api.get<ForumResponse[]>("/api/board", {
        params: sortParam ? { sort: sortParam } : {},
      })
      setPosts(res.data.map(mapForumToPost))
    } catch (e) {
      console.error(e)
      alert("게시글을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      setLoadingComments(true)
      const res = await api.get<CommentResponse[]>(`/api/board/${postId}/comments`)
      setSelectedComments(res.data.map(mapCommentToComment))
    } catch (e) {
      console.error(e)
      alert("댓글을 불러오지 못했습니다.")
    } finally {
      setLoadingComments(false)
    }
  }

  const refreshSelectedPostCounts = async (postId: string) => {
    try {
      const res = await api.get<ForumResponse>(`/api/board/${postId}`)
      const updated = mapForumToPost(res.data)

      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: updated.likes, comments: updated.comments } : p)))

      if (selectedPostId === postId) {
        // 상세 화면에서도 좋아요/댓글 수 즉시 반영
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (sortBy === "인기순") fetchPosts("likes")
    else if (sortBy === "댓글순") fetchPosts("comments")
    else fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  const openDetail = async (postId: string) => {
    setSelectedPostId(postId)
    setShowDetailView(true)
    setCommentText("")
    await fetchComments(postId)
    await refreshSelectedPostCounts(postId)
  }

  const closeDetail = () => {
    setShowDetailView(false)
    setSelectedPostId(null)
    setSelectedComments([])
    setCommentText("")
  }

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
    closeDetail()
  }

  const handleLike = async (postId: string) => {
    if (liking) return
    try {
      setLiking(true)
      await api.post(`/api/board/${postId}/like`)
      await refreshSelectedPostCounts(postId)
      if (sortBy === "인기순") fetchPosts("likes")
    } catch (e) {
      console.error(e)
      alert("좋아요 처리에 실패했습니다.")
    } finally {
      setLiking(false)
    }
  }

  const submitComment = async () => {
    const forumId = selectedPostId
    const content = commentText.trim()
    if (!forumId) return
    if (!content) return

    try {
      setSubmittingComment(true)
      await api.post(`/api/board/${forumId}/comments`, {
        content,
        parentCommentId: null,
      })

      setCommentText("")
      await fetchComments(forumId)
      await refreshSelectedPostCounts(forumId)
      if (sortBy === "댓글순") fetchPosts("comments")
    } catch (e) {
      console.error(e)
      alert("댓글 작성에 실패했습니다.")
    } finally {
      setSubmittingComment(false)
    }
  }

  const selectedPost = selectedPostId ? posts.find((p) => p.id === selectedPostId) : null

  const localSortedPosts = useMemo(() => {
    const arr = [...posts]
    if (sortBy === "인기순") arr.sort((a, b) => b.likes - a.likes)
    else if (sortBy === "댓글순") arr.sort((a, b) => b.comments - a.comments)
    return arr
  }, [posts, sortBy])

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground text-lg">일기 커뮤니티</h2>
          <p className="text-xs text-muted-foreground mt-1">당신의 이야기를 나누고 서로를 응원해주세요</p>
        </div>
      </div>

      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex gap-2">
          {sortOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                sortBy === option ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {!showDetailView ? (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {loading && <div className="text-center text-sm text-muted-foreground py-4">불러오는 중...</div>}

            {!loading &&
              localSortedPosts.map((post) => {
                const WeatherIcon = emotionWeatherMap[post.emotion].icon
                const weatherColor = emotionWeatherMap[post.emotion].color
                const weatherLabel = emotionWeatherMap[post.emotion].label
                const truncatedContent = truncateText(post.content)

                return (
                  <div
                    key={post.id}
                    onClick={() => openDetail(post.id)}
                    className="bg-card rounded-2xl border border-border hover:border-primary/50 transition-all shadow-sm overflow-hidden cursor-pointer"
                  >
                    <div className="p-4 border-b border-border">
                      <div className="flex items-start gap-3 justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">{post.avatar}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm text-foreground">{post.author}</span>
                              <span className="text-xs text-muted-foreground">{post.date}</span>
                              <div className="flex items-center gap-1 text-xs">
                                <WeatherIcon className={`w-3 h-3 ${weatherColor}`} />
                                <span className="text-muted-foreground">{weatherLabel}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {post.isOwn && (
                          <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-foreground text-base leading-relaxed">{post.title}</h3>
                      <p className="text-sm text-foreground/80 leading-relaxed">{truncatedContent}</p>
                    </div>

                    <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLike(post.id)
                          }}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </button>

                        <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </button>
                      </div>

                      <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto">
            {selectedPost && (
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{selectedPost.avatar}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{selectedPost.author}</span>
                        <span className="text-sm text-muted-foreground">{selectedPost.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">감정 상태:</span>
                        <span className="text-sm text-muted-foreground">{emotionWeatherMap[selectedPost.emotion].label}</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={closeDetail} className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-3">{selectedPost.title}</h2>
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex gap-6">
                    <button
                      onClick={() => handleLike(selectedPost.id)}
                      className="flex items-center gap-2 hover:text-primary transition-colors text-muted-foreground"
                    >
                      <Heart className="w-5 h-5" />
                      <span className="text-sm">{selectedPost.likes}</span>
                    </button>

                    <button className="flex items-center gap-2 hover:text-primary transition-colors text-muted-foreground">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{selectedPost.comments}</span>
                    </button>
                  </div>

                  <button className="flex items-center gap-2 hover:text-primary transition-colors text-muted-foreground">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="border-t border-border">
                  {loadingComments && <div className="p-6 text-sm text-muted-foreground">댓글 불러오는 중...</div>}

                  {!loadingComments && (
                    <div className="p-6 space-y-4 bg-muted/20">
                      <h3 className="font-semibold text-foreground mb-4">댓글 ({selectedComments.length})</h3>

                      {selectedComments.length === 0 && (
                        <div className="text-sm text-muted-foreground">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</div>
                      )}

                      {selectedComments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 pb-4 border-b border-border last:border-b-0">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">{comment.avatar}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-foreground">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">{comment.date}</span>
                            </div>
                            <p className="text-sm text-foreground/80">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 border-t border-border bg-muted/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="댓글을 작성해주세요..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            if (!submittingComment) submitComment()
                          }
                        }}
                        disabled={submittingComment}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                      />

                      <button
                        onClick={submitComment}
                        disabled={submittingComment || !commentText.trim()}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1 disabled:opacity-60"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
