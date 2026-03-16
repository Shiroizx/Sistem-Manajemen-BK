'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
  Button,
  Card,
  Input,
  Alert,
} from '@heroui/react'
import { DotPattern } from '@/components/ui/dot-pattern'
import { searchStudentByNIS, type StudentSearchResult } from './actions'

export function PublicSearchClient() {
  const [nis, setNis] = useState('')
  const [studentData, setStudentData] = useState<StudentSearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchCardRef = useRef<HTMLDivElement>(null)
  const profileCardRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const timelineItemsRef = useRef<HTMLDivElement[]>([])

  // Initial entrance animation for search card
  useEffect(() => {
    if (searchCardRef.current && !studentData) {
      const ctx = gsap.context(() => {
        gsap.from(searchCardRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
        })
      })
      return () => ctx.revert()
    }
  }, [studentData])

  // Animate search card shrink and results appear
  useEffect(() => {
    if (studentData && searchCardRef.current) {
      const ctx = gsap.context(() => {
        // Shrink and move search card up
        gsap.to(searchCardRef.current, {
          scale: 0.95,
          y: -20,
          duration: 0.5,
          ease: 'power3.out',
        })

        // Fade in profile card
        if (profileCardRef.current) {
          gsap.from(profileCardRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.6,
            delay: 0.2,
            ease: 'power3.out',
          })
        }

        // Stagger fade in timeline items
        if (timelineItemsRef.current.length > 0) {
          gsap.from(timelineItemsRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            delay: 0.4,
            ease: 'power3.out',
          })
        }
      })
      return () => ctx.revert()
    }
  }, [studentData])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await searchStudentByNIS(nis.trim())
      if (data) {
        setStudentData(data)
        // Reset timeline refs
        timelineItemsRef.current = []
      } else {
        setError('NIS tidak ditemukan. Pastikan NIS yang Anda masukkan benar.')
        setStudentData(null)
      }
    } catch {
      setError('Terjadi kesalahan saat mengambil data. Silakan coba lagi.')
      setStudentData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStudentData(null)
    setNis('')
    setError(null)
    timelineItemsRef.current = []
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-zinc-950">
      {/* Subtle Dot Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <DotPattern
          width={20}
          height={20}
          cr={0.5}
          className="text-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header Section */}
        <header className="mx-auto w-full max-w-7xl px-6 pt-12 pb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            SMAN 101 Jakarta
          </h1>
          <p className="text-base font-medium text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Sistem Manajemen Bimbingan Konseling
          </p>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-4xl">
            {/* Search Card */}
            {!studentData && (
              <div ref={searchCardRef} className="mx-auto w-full max-w-md">
                <Card className="border border-zinc-200/50 bg-white/80 backdrop-blur-sm shadow-lg dark:border-zinc-800/50 dark:bg-zinc-900/80">
                  <Card.Header className="flex flex-col gap-2 px-8 pt-8 pb-6">
                    <Card.Title className="text-2xl font-bold text-zinc-900 dark:text-white">
                      Cari Data Siswa
                    </Card.Title>
                    <Card.Description className="text-sm text-zinc-600 dark:text-zinc-400">
                      Masukkan NIS siswa untuk melihat catatan dan skor
                    </Card.Description>
                  </Card.Header>

                  <Card.Content className="px-8 pb-8">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                      {error && (
                        <Alert
                          status="danger"
                          className="animate-in fade-in slide-in-from-top-2 border border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20"
                        >
                          <Alert.Indicator />
                          <Alert.Content>
                            <Alert.Description className="text-sm text-red-800 dark:text-red-300">
                              {error}
                            </Alert.Description>
                          </Alert.Content>
                        </Alert>
                      )}

                      <div className="relative">
                        <div className="relative">
                          <svg
                            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <Input
                            name="nis"
                            value={nis}
                            onChange={(e) => setNis(e.target.value)}
                            placeholder="00019"
                            autoComplete="off"
                            disabled={loading}
                            variant="secondary"
                            className="w-full pl-10 text-zinc-900 placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-zinc-900 font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                        isPending={loading}
                        isDisabled={loading}
                      >
                        {loading ? 'Mencari...' : 'Cari Data'}
                      </Button>
                    </form>
                  </Card.Content>
                </Card>
              </div>
            )}

            {/* Results Section */}
            {studentData && (
              <div className="space-y-8">
                {/* Profile & Score Card */}
                <div ref={profileCardRef}>
                  <Card className="border border-zinc-200/50 bg-white/80 backdrop-blur-sm shadow-lg dark:border-zinc-800/50 dark:bg-zinc-900/80">
                    <Card.Content className="p-8">
                      <div className="flex items-center justify-between gap-8">
                        {/* Left: Student Info */}
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
                            {studentData.profile.full_name}
                          </h2>
                          <p className="mt-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            NIS: {studentData.profile.nis || '-'}
                          </p>
                        </div>

                        {/* Right: Score Display */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              Total Skor
                            </p>
                            <p
                              className={`mt-1.5 text-4xl font-bold sm:text-5xl ${
                                studentData.totalScore >= 0
                                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-500'
                                  : 'bg-gradient-to-br from-red-600 to-red-500 bg-clip-text text-transparent dark:from-red-400 dark:to-red-500'
                              }`}
                            >
                              {studentData.totalScore > 0 ? '+' : ''}
                              {studentData.totalScore}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="font-medium">
                                {studentData.records.length} catatan tersimpan
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                </div>

                {/* Timeline Section */}
                <div ref={timelineRef}>
                  <Card className="border border-zinc-200/50 bg-white/80 backdrop-blur-sm shadow-lg dark:border-zinc-800/50 dark:bg-zinc-900/80">
                    <Card.Header className="px-8 pt-8 pb-6">
                      <Card.Title className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                        Riwayat Catatan
                      </Card.Title>
                    </Card.Header>

                    <Card.Content className="px-8 pb-8">
                      {studentData.records.length === 0 ? (
                        <div className="py-12 text-center">
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Belum ada catatan untuk ditampilkan
                          </p>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Vertical Timeline Line */}
                          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-zinc-200 via-zinc-200/50 to-transparent dark:from-zinc-700 dark:via-zinc-700/50" />

                          {/* Timeline Items */}
                          <div className="space-y-6">
                            {studentData.records.map((record, index) => {
                              const isAchievement = record.category_type === 'achievement'
                              const ringColor = isAchievement
                                ? 'ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20'
                                : 'ring-red-500/20 bg-red-50 dark:bg-red-950/20'
                              const dotColor = isAchievement
                                ? 'bg-emerald-500 dark:bg-emerald-400'
                                : 'bg-red-500 dark:bg-red-400'
                              const ringDotColor = isAchievement
                                ? 'ring-emerald-500/30 dark:ring-emerald-400/30'
                                : 'ring-red-500/30 dark:ring-red-400/30'

                              return (
                                <div
                                  key={record.id}
                                  ref={(el) => {
                                    if (el) timelineItemsRef.current[index] = el
                                  }}
                                  className="relative flex gap-6"
                                >
                                  {/* Timeline Node */}
                                  <div className="relative z-10 flex shrink-0 items-center">
                                    <div
                                      className={`relative flex h-12 w-12 items-center justify-center rounded-full ${ringColor} ring-2 ${ringDotColor}`}
                                    >
                                      <div
                                        className={`h-3 w-3 rounded-full ${dotColor}`}
                                      />
                                    </div>
                                  </div>

                                  {/* Record Card */}
                                  <div className="flex-1 rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/50">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 space-y-2">
                                        <h4 className="font-semibold text-zinc-900 dark:text-white">
                                          {record.category_name}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                          <svg
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          <span>{formatDate(record.created_at)}</span>
                                          <span className="text-zinc-300 dark:text-zinc-700">
                                            •
                                          </span>
                                          <span>{formatTime(record.created_at)}</span>
                                        </div>
                                        {record.notes && (
                                          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                            {record.notes}
                                          </p>
                                        )}
                                      </div>

                                      {/* Category Pill with Score */}
                                      <div className="flex shrink-0 flex-col items-end gap-2">
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            isAchievement
                                              ? 'bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/50'
                                              : 'bg-red-100/80 text-red-700 ring-1 ring-red-200/50 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800/50'
                                          }`}
                                        >
                                          {isAchievement ? 'Prestasi' : 'Pelanggaran'}
                                        </span>
                                        <span
                                          className={`text-lg font-bold ${
                                            record.point_value >= 0
                                              ? 'text-emerald-600 dark:text-emerald-400'
                                              : 'text-red-600 dark:text-red-400'
                                          }`}
                                        >
                                          {record.point_value > 0 ? '+' : ''}
                                          {record.point_value}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </Card.Content>
                  </Card>
                </div>

                {/* Back to Search Button */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onPress={handleReset}
                    className="text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    ← Cari NIS Lain
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
