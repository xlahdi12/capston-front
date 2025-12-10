"use client"

import { useEffect, useState } from "react"
import { User, Mail, Calendar, Edit, Save, X, TrendingUp, Clock } from "lucide-react"
import api from "@/lib/api"

interface UserProfile {
  name: string
  email: string
  profileImage: string
  joinDate: string[]
  bio: string
  location: string
  conversationCount: number
  monthCount: number
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: "로딩 중..",
    email: "",
    profileImage: "",
    joinDate: [],
    bio: "",
    location: "",
    conversationCount: 0,
    monthCount: 0
  })

  const [editedProfile, setEditedProfile] = useState(profile);
  useEffect(() => {
    setEditedProfile(profile);
  }, [profile])

  const handleEditChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setProfile(editedProfile)
    await api.post("/auth/user", editedProfile);
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const getUserData = async () => {
    const res = await api.get(`/auth/user`);
    setProfile(res.data);

  }
  useEffect(() => {
    getUserData();
  }, [])

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground text-lg">프로필</h2>
          <p className="text-xs text-muted-foreground mt-1">당신의 정보를 관리하세요</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm font-medium">수정</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium">저장</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">취소</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Avatar and Name */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-22 h-22 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center">
                  {
                    profile.profileImage ?
                      <img alt="profile-image" className="w-20 h-20 rounded-full object-cover" src={profile.profileImage} />
                    : <User className="w-10 h-10 text-primary" />
                }
                </div>

                <div className="flex-1">
                  {!isEditing ? (
                    <>
                      <h3 className="text-2xl font-bold text-foreground">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{profile.bio ? profile.bio : "소개글을 작성해주세요."}</p>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">이름</label>
                        <input
                          type="text"
                          value={editedProfile.name}
                          onChange={(e) => handleEditChange("name", e.target.value)}
                          className="w-full mt-1 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">소개글</label>
                        <textarea
                          value={editedProfile.bio}
                          onChange={(e) => handleEditChange("bio", e.target.value)}
                          className="w-full mt-1 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none h-20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  이메일
                </label>
                {!isEditing ? (
                  <p className="mt-1 text-sm text-foreground">{profile.email ? profile.email : "이메일을 설정해주세요."}</p>
                ) : (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleEditChange("email", e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                )}
              </div>



              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  가입일
                </label>
                <p className="mt-1 text-sm text-foreground">{`${profile.joinDate[0]}년 ${profile.joinDate[1]}월 ${profile.joinDate[2]}일`}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-1 space-y-4">
            {/* Consultation Stats */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">상담 통계</h4>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-card rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">총 상담 횟수</p>
                  <p className="text-2xl font-bold text-primary mt-1">{profile.conversationCount}</p>
                </div>

                <div className="p-3 bg-card rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">이번 달 기록</p>
                  <p className="text-2xl font-bold text-secondary mt-1">{profile.monthCount}</p>
                </div>
              </div>
            </div>

            {/* Growth Trend */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">성장 지표</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">감정 안정도</span>
                    <span className="text-xs font-bold text-primary">72%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "72%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">자신감</span>
                    <span className="text-xs font-bold text-secondary">65%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">긍정성</span>
                    <span className="text-xs font-bold text-accent">58%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: "58%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
