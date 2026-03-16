'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import {
  Button,
  Surface,
  Card,
} from '@heroui/react'
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern'
import type { StudentDetail } from './actions'

interface StudentDetailClientProps {
  studentDetail: StudentDetail
}

export function StudentDetailClient({ studentDetail }: StudentDetailClientProps) {
  const router = useRouter()
  const timelineRef = useRef<HTMLDivElement>(null)

  // GSAP animation for timeline
  useEffect(() => {
    if (timelineRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(timelineRef.current?.children || [], {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.2,
        })
      })
      return () => ctx.revert()
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="relative min-h-screen">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-30">
        <AnimatedGridPattern
          numSquares={20}
          maxOpacity={0.2}
          duration={4}
          repeatDelay={2}
        />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onPress={() => router.back()}
          className="mb-4"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali
        </Button>

        {/* Profile & Score Card */}
        <Surface variant="default" className="rounded-2xl p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {studentDetail.profile.full_name}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                NIS: {studentDetail.profile.nis || '-'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Skor
                </p>
                <p
                  className={`text-3xl font-bold ${
                    studentDetail.totalScore >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {studentDetail.totalScore > 0 ? '+' : ''}
                  {studentDetail.totalScore}
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-400"
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
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {studentDetail.records.length} catatan tersimpan
          </div>
        </Surface>

        {/* Timeline */}
        <Surface variant="default" className="rounded-2xl p-6">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Riwayat Catatan
          </h2>

          {studentDetail.records.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Belum ada catatan untuk siswa ini.
              </p>
            </div>
          ) : (
            <div ref={timelineRef} className="relative space-y-4">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-zinc-200 via-zinc-300 to-transparent dark:from-zinc-700 dark:via-zinc-600" />

              {studentDetail.records.map((record, index) => (
                <div key={record.id} className="relative flex gap-4">
                  {/* Timeline Node */}
                  <div
                    className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                      record.category_type === 'achievement'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                    }`}
                  >
                    <div
                      className={`h-3 w-3 rounded-full ${
                        record.category_type === 'achievement'
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>

                  {/* Record Card */}
                  <Card className="flex-1 border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {record.category_name}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              record.category_type === 'achievement'
                                ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                                : 'bg-red-600 text-white dark:bg-red-500'
                            }`}
                          >
                            {record.category_type === 'achievement' ? 'Prestasi' : 'Pelanggaran'}
                          </span>
                        </div>
                        <div className="mb-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <svg
                            className="h-3 w-3"
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
                          {formatDate(record.created_at)}
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {record.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xl font-extrabold ${
                            record.point_value >= 0
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-red-700 dark:text-red-300'
                          }`}
                        >
                          {record.point_value > 0 ? '+' : ''}
                          {record.point_value}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Surface>
      </div>
    </div>
  )
}

